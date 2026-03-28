import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, dealerProcedure } from "../trpc";
import { estimateCarValue } from "@/lib/valuation/estimate";

const carSourceEnum = z.enum([
  "LOCAL",
  "IMPORTED_USA",
  "IMPORTED_GULF",
  "IMPORTED_EUROPE",
  "SALVAGE_REBUILT",
]);

/** Sell Listings router — "Sell My Car" auction system. */
export const sellListingsRouter = createTRPCRouter({
  /** Create a new sell listing. */
  create: protectedProcedure
    .input(
      z.object({
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().min(1900).max(2030),
        trim: z.string().optional(),
        mileageKm: z.number().min(0),
        conditionDescription: z.string().optional(),
        conditionCheckboxes: z.any().optional(),
        source: carSourceEnum,
        accidentHistory: z.boolean().optional(),
        askingPriceUsd: z.number().positive().optional(),
        estimatedValueMinUsd: z.number().positive().optional(),
        estimatedValueMaxUsd: z.number().positive().optional(),
        images: z.array(z.string()).default([]),
        isAuction: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { isAuction, ...data } = input;

      // Calculate auction end time: 24 hours for auction, 7 days for fixed price
      const durationMs = isAuction
        ? 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

      return ctx.prisma.sellListing.create({
        data: {
          ...data,
          sellerId: ctx.session.user.id,
          status: "PENDING_REVIEW",
          auctionEndsAt: new Date(Date.now() + durationMs),
        },
      });
    }),

  /** Get valuation estimate for a car. */
  getValuation: publicProcedure
    .input(
      z.object({
        make: z.string().min(1),
        model: z.string().optional(),
        year: z.number().min(1900).max(2030),
        mileageKm: z.number().min(0),
        source: carSourceEnum,
        accidentHistory: z.boolean().optional(),
        hasDamage: z.boolean().optional(),
        serviceRecords: z.enum(["full", "partial", "none"]).optional(),
      })
    )
    .query(({ input }) => {
      return estimateCarValue(input);
    }),

  /** List active sell listings for dealers to bid on. */
  listActive: dealerProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        make: z.string().optional(),
        model: z.string().optional(),
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        priceFrom: z.number().optional(),
        priceTo: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: Record<string, unknown> = {
        status: "LIVE",
        auctionEndsAt: { gt: new Date() },
      };

      if (input.make) where.make = input.make;
      if (input.model) where.model = input.model;
      if (input.yearFrom || input.yearTo) {
        where.year = {
          ...(input.yearFrom ? { gte: input.yearFrom } : {}),
          ...(input.yearTo ? { lte: input.yearTo } : {}),
        };
      }

      const [items, total] = await Promise.all([
        ctx.prisma.sellListing.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          include: {
            _count: { select: { bids: true } },
            seller: { select: { name: true, locationRegion: true, locationCity: true } },
          },
        }),
        ctx.prisma.sellListing.count({ where }),
      ]);

      return { items, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Get a seller's own listings with bid details. */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.sellListing.findMany({
      where: { sellerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        bids: {
          orderBy: { bidAmountUsd: "desc" },
          include: {
            dealer: {
              select: {
                id: true,
                companyName: true,
                companyNameAr: true,
                slug: true,
                ratingAvg: true,
                isVerified: true,
                city: true,
                region: true,
              },
            },
          },
        },
      },
    });
  }),

  /** Get a single sell listing by ID. */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.sellListing.findUnique({
        where: { id: input.id },
        include: {
          seller: { select: { name: true, email: true, phone: true } },
          bids: {
            orderBy: { bidAmountUsd: "desc" },
            include: {
              dealer: {
                select: {
                  id: true,
                  companyName: true,
                  companyNameAr: true,
                  slug: true,
                  ratingAvg: true,
                  isVerified: true,
                  city: true,
                  region: true,
                },
              },
            },
          },
        },
      });
    }),

  /** Cancel a sell listing (seller only). */
  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.sellListing.findUnique({
        where: { id: input.id },
      });

      if (!listing || listing.sellerId !== ctx.session.user.id) {
        throw new Error("Listing not found or unauthorized");
      }

      if (listing.status === "SOLD") {
        throw new Error("Cannot cancel a sold listing");
      }

      await ctx.prisma.$transaction([
        ctx.prisma.sellListing.update({
          where: { id: input.id },
          data: { status: "CANCELLED" },
        }),
        ctx.prisma.sellBid.updateMany({
          where: { sellListingId: input.id, status: { in: ["PENDING", "WINNING"] } },
          data: { status: "REJECTED" },
        }),
      ]);

      return { success: true };
    }),
});
