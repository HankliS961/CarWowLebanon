import { z } from "zod";
import { createTRPCRouter, protectedProcedure, dealerProcedure } from "../trpc";

/** Configurations router — reverse marketplace: buyers configure, dealers offer. */
export const configurationsRouter = createTRPCRouter({
  /** Create a new car configuration request. */
  create: protectedProcedure
    .input(
      z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        trim: z.string().optional(),
        bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "PICKUP", "COUPE", "CONVERTIBLE", "VAN", "WAGON"]).optional(),
        preferredColor: z.string().optional(),
        budgetMinUsd: z.number().positive(),
        budgetMaxUsd: z.number().positive(),
        financePreference: z.enum(["CASH", "FINANCE", "NOT_SURE"]),
        featuresWanted: z.array(z.string()).default([]),
        notes: z.string().optional(),
        locationRegion: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.carConfiguration.create({
        data: {
          ...input,
          buyerId: ctx.session.user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }),

  /** List open configurations for dealers to browse. */
  listOpen: dealerProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.carConfiguration.findMany({
        where: { status: "OPEN", expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
        include: {
          buyer: { select: { name: true, locationRegion: true } },
          _count: { select: { offers: true } },
        },
      });
    }),

  /** Get buyer's own configurations with received offers. */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.carConfiguration.findMany({
      where: { buyerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        offers: {
          include: {
            dealer: {
              select: { companyName: true, companyNameAr: true, slug: true, logoUrl: true, ratingAvg: true, isVerified: true },
            },
          },
          orderBy: { priceOfferedUsd: "asc" },
        },
      },
    });
  }),
});
