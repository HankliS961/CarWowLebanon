import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure, dealerProcedure } from "../trpc";
import { estimateCarValue } from "@/lib/valuation/estimate";
import { notifyNewAuction } from "@/lib/notifications/create";

const carSourceEnum = z.enum([
  "LOCAL",
  "IMPORTED_USA",
  "IMPORTED_GULF",
  "IMPORTED_EUROPE",
  "SALVAGE_REBUILT",
]);

/** Shared schema for all optional sell-listing fields (used by saveDraft & create). */
const draftFieldsSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().min(1900).max(2030).optional(),
  trim: z.string().optional(),
  mileageKm: z.number().min(0).optional(),
  conditionDescription: z.string().optional(),
  conditionCheckboxes: z.any().optional(),
  source: carSourceEnum.optional(),
  accidentHistory: z.boolean().optional(),
  askingPriceUsd: z.number().positive().optional(),
  estimatedValueMinUsd: z.number().positive().optional(),
  estimatedValueMaxUsd: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  currentStep: z.number().min(1).optional(),
});

/** Sell Listings router — "Sell My Car" auction system. */
export const sellListingsRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // Draft procedures
  // ---------------------------------------------------------------------------

  /** Save (create or update) a draft sell listing. */
  saveDraft: protectedProcedure
    .input(draftFieldsSchema.extend({ draftId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { draftId, ...fields } = input;

      if (draftId) {
        // Update existing draft — verify ownership & status
        const existing = await ctx.prisma.sellListing.findUnique({
          where: { id: draftId },
        });

        if (!existing || existing.sellerId !== ctx.session.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
        }

        if (existing.status !== "DRAFT") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only drafts can be updated via saveDraft",
          });
        }

        return ctx.prisma.sellListing.update({
          where: { id: draftId },
          data: fields,
        });
      }

      // Create a new draft
      return ctx.prisma.sellListing.create({
        data: {
          ...fields,
          sellerId: ctx.session.user.id,
          status: "DRAFT",
        },
      });
    }),

  /** List all drafts for the current user. */
  listDrafts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.sellListing.findMany({
      where: {
        sellerId: ctx.session.user.id,
        status: "DRAFT",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        trim: true,
        mileageKm: true,
        currentStep: true,
        updatedAt: true,
        images: true,
      },
    });
  }),

  /** Get a single draft by ID (full data). */
  getDraft: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const draft = await ctx.prisma.sellListing.findUnique({
        where: { id: input.id },
      });

      if (
        !draft ||
        draft.sellerId !== ctx.session.user.id ||
        draft.status !== "DRAFT"
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }

      return draft;
    }),

  /** Delete a draft sell listing. */
  deleteDraft: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const draft = await ctx.prisma.sellListing.findUnique({
        where: { id: input.id },
      });

      if (!draft || draft.sellerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }

      if (draft.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only drafts can be deleted via deleteDraft",
        });
      }

      await ctx.prisma.sellListing.delete({ where: { id: input.id } });

      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Create / submit listing
  // ---------------------------------------------------------------------------

  /** Create a new sell listing (or promote an existing draft to PENDING_REVIEW). */
  create: protectedProcedure
    .input(
      z.object({
        draftId: z.string().uuid().optional(),
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
      const { isAuction, draftId, ...data } = input;

      // Calculate auction end time: 24 hours for auction, 7 days for fixed price
      const durationMs = isAuction
        ? 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

      // If promoting an existing draft, update it instead of creating a new row
      if (draftId) {
        const existing = await ctx.prisma.sellListing.findUnique({
          where: { id: draftId },
        });

        if (!existing || existing.sellerId !== ctx.session.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
        }

        if (existing.status !== "DRAFT") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only drafts can be submitted",
          });
        }

        const updated = await ctx.prisma.sellListing.update({
          where: { id: draftId },
          data: {
            ...data,
            status: "LIVE",
            auctionEndsAt: new Date(Date.now() + durationMs),
          },
        });

        // Notify all verified dealers about this new listing (fire-and-forget)
        const carTitle = `${data.year} ${data.make} ${data.model}`;
        notifyNewAuction({
          sellListingId: updated.id,
          carTitle,
          askingPrice: data.askingPriceUsd ? Number(data.askingPriceUsd) : undefined,
          sellerName: ctx.session.user.name ?? "A seller",
        }).catch(console.error);

        return updated;
      }

      const listing = await ctx.prisma.sellListing.create({
        data: {
          ...data,
          sellerId: ctx.session.user.id,
          status: "LIVE",
          auctionEndsAt: new Date(Date.now() + durationMs),
        },
      });

      // Notify all verified dealers about this new listing (fire-and-forget)
      const carTitle = `${data.year} ${data.make} ${data.model}`;
      notifyNewAuction({
        sellListingId: listing.id,
        carTitle,
        askingPrice: data.askingPriceUsd ? Number(data.askingPriceUsd) : undefined,
        sellerName: ctx.session.user.name ?? "A seller",
      }).catch(console.error);

      return listing;
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
        throw new TRPCError({ code: "FORBIDDEN", message: "Listing not found or unauthorized" });
      }

      if (listing.status === "SOLD") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel a sold listing" });
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
