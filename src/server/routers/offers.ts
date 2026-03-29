import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, dealerProcedure } from "../trpc";
import { notifyNewOffer } from "@/lib/notifications/create";
import { sendNewOfferEmail } from "@/lib/notifications/email";

/** Offers router — dealer offers on buyer configurations. */
export const offersRouter = createTRPCRouter({
  /** Submit an offer for a buyer configuration (dealer only). */
  create: dealerProcedure
    .input(
      z.object({
        configurationId: z.string().uuid(),
        priceOfferedUsd: z.number().positive(),
        deliveryTimeDays: z.number().min(0).optional(),
        notes: z.string().optional(),
        includedExtras: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({ where: { userId: ctx.session.user.id } });
      if (!dealer) throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });

      const offer = await ctx.prisma.dealerOffer.create({
        data: {
          ...input,
          dealerId: dealer.id,
        },
      });

      // Fire-and-forget: notify buyer of new offer
      const config = await ctx.prisma.carConfiguration.findUnique({
        where: { id: input.configurationId },
        include: { buyer: true },
      });

      if (config) {
        notifyNewOffer({
          buyerId: config.buyerId,
          dealerName: dealer.companyName,
          priceOffered: input.priceOfferedUsd,
          configurationId: input.configurationId,
        }).catch(console.error);

        if (config.buyer.email) {
          sendNewOfferEmail(
            config.buyer.email,
            dealer.companyName,
            input.priceOfferedUsd,
            input.configurationId,
          ).catch(console.error);
        }
      }

      return offer;
    }),

  /** Accept an offer (buyer only). */
  accept: protectedProcedure
    .input(z.object({ offerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const offer = await ctx.prisma.dealerOffer.findUnique({
        where: { id: input.offerId },
        include: { configuration: true },
      });

      if (!offer || offer.configuration.buyerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Offer not found or unauthorized" });
      }

      // Accept this offer, reject others
      await ctx.prisma.$transaction([
        ctx.prisma.dealerOffer.update({
          where: { id: input.offerId },
          data: { status: "ACCEPTED" },
        }),
        ctx.prisma.dealerOffer.updateMany({
          where: { configurationId: offer.configurationId, id: { not: input.offerId } },
          data: { status: "REJECTED" },
        }),
        ctx.prisma.carConfiguration.update({
          where: { id: offer.configurationId },
          data: { status: "CLOSED" },
        }),
      ]);

      return { success: true };
    }),
});
