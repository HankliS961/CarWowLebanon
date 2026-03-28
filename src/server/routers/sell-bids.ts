import { z } from "zod";
import { createTRPCRouter, protectedProcedure, dealerProcedure } from "../trpc";
import { notifyNewBid, notifyBidAccepted } from "@/lib/notifications/create";
import { sendNewBidEmail, sendBidAcceptedEmail } from "@/lib/notifications/email";

/** Sell Bids router — dealer bids on sell listings. */
export const sellBidsRouter = createTRPCRouter({
  /** Place a bid on a sell listing (dealer only). */
  create: dealerProcedure
    .input(
      z.object({
        sellListingId: z.string().uuid(),
        bidAmountUsd: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });
      if (!dealer) throw new Error("Dealer profile not found");

      // Validate the listing is still live
      const listing = await ctx.prisma.sellListing.findUnique({
        where: { id: input.sellListingId },
        include: { seller: { select: { id: true, email: true, phone: true, name: true } } },
      });

      if (!listing || listing.status !== "LIVE") {
        throw new Error("Listing is not available for bidding");
      }

      if (listing.auctionEndsAt && listing.auctionEndsAt < new Date()) {
        throw new Error("Auction has ended");
      }

      // Check minimum bid increment ($100)
      const highestBid = await ctx.prisma.sellBid.findFirst({
        where: { sellListingId: input.sellListingId },
        orderBy: { bidAmountUsd: "desc" },
      });

      if (highestBid && Number(input.bidAmountUsd) <= Number(highestBid.bidAmountUsd)) {
        throw new Error("Bid must be higher than the current highest bid");
      }

      // Check if dealer already bid on this listing
      const existingBid = await ctx.prisma.sellBid.findFirst({
        where: { sellListingId: input.sellListingId, dealerId: dealer.id },
      });

      let bid;
      if (existingBid) {
        // Update existing bid
        bid = await ctx.prisma.sellBid.update({
          where: { id: existingBid.id },
          data: {
            bidAmountUsd: input.bidAmountUsd,
            notes: input.notes,
            status: "PENDING",
          },
        });
      } else {
        // Create new bid
        bid = await ctx.prisma.sellBid.create({
          data: {
            sellListingId: input.sellListingId,
            dealerId: dealer.id,
            bidAmountUsd: input.bidAmountUsd,
            notes: input.notes,
          },
        });
      }

      // Notify seller about the new bid
      const carTitle = `${listing.year} ${listing.make} ${listing.model}`;
      try {
        await notifyNewBid({
          sellerId: listing.sellerId,
          carTitle,
          bidAmount: input.bidAmountUsd,
          dealerName: dealer.companyName,
          sellListingId: listing.id,
        });

        if (listing.seller.email) {
          await sendNewBidEmail(
            listing.seller.email,
            carTitle,
            input.bidAmountUsd,
            dealer.companyName,
            listing.id
          );
        }
      } catch (notifError) {
        // Don't fail the bid if notification fails
        console.error("[Bid] Notification error:", notifError);
      }

      return bid;
    }),

  /** Accept a bid (seller only). */
  accept: protectedProcedure
    .input(z.object({ bidId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const bid = await ctx.prisma.sellBid.findUnique({
        where: { id: input.bidId },
        include: {
          sellListing: true,
          dealer: {
            include: { user: { select: { email: true } } },
          },
        },
      });

      if (!bid || bid.sellListing.sellerId !== ctx.session.user.id) {
        throw new Error("Bid not found or unauthorized");
      }

      if (bid.sellListing.status === "SOLD") {
        throw new Error("This listing is already sold");
      }

      await ctx.prisma.$transaction([
        ctx.prisma.sellBid.update({
          where: { id: input.bidId },
          data: { status: "ACCEPTED" },
        }),
        ctx.prisma.sellBid.updateMany({
          where: { sellListingId: bid.sellListingId, id: { not: input.bidId } },
          data: { status: "REJECTED" },
        }),
        ctx.prisma.sellListing.update({
          where: { id: bid.sellListingId },
          data: { status: "SOLD" },
        }),
      ]);

      // Notify winning dealer
      const carTitle = `${bid.sellListing.year} ${bid.sellListing.make} ${bid.sellListing.model}`;
      try {
        const dealerData = bid.dealer;
        await notifyBidAccepted({
          dealerUserId: dealerData.userId,
          carTitle,
          bidAmount: Number(bid.bidAmountUsd),
          sellListingId: bid.sellListingId,
        });

        if (dealerData.user?.email) {
          await sendBidAcceptedEmail(
            dealerData.user.email,
            carTitle,
            Number(bid.bidAmountUsd),
            bid.sellListingId
          );
        }
      } catch (notifError) {
        console.error("[BidAccept] Notification error:", notifError);
      }

      return { success: true };
    }),

  /** Get dealer's own bids with listing info. */
  listMyBids: dealerProcedure.query(async ({ ctx }) => {
    const dealer = await ctx.prisma.dealer.findUnique({
      where: { userId: ctx.session.user.id },
    });
    if (!dealer) throw new Error("Dealer profile not found");

    return ctx.prisma.sellBid.findMany({
      where: { dealerId: dealer.id },
      orderBy: { createdAt: "desc" },
      include: {
        sellListing: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            trim: true,
            mileageKm: true,
            images: true,
            status: true,
            auctionEndsAt: true,
          },
        },
      },
    });
  }),
});
