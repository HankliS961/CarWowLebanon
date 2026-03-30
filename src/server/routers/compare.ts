import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const compareRouter = createTRPCRouter({
  /** Get user's compare list (with full car + dealer data). */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.compareList.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { addedAt: "asc" },
      include: {
        car: {
          include: {
            dealer: {
              select: {
                companyName: true,
                companyNameAr: true,
                slug: true,
                logoUrl: true,
                isVerified: true,
                ratingAvg: true,
                city: true,
                region: true,
              },
            },
          },
        },
      },
    });
  }),

  /** Add a car to compare (max 3). */
  add: protectedProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.prisma.compareList.count({
        where: { userId: ctx.session.user.id },
      });
      if (count >= 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 3 cars in compare list",
        });
      }
      return ctx.prisma.compareList.create({
        data: { userId: ctx.session.user.id, carId: input.carId },
      });
    }),

  /** Remove a car from compare. */
  remove: protectedProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.compareList.deleteMany({
        where: { userId: ctx.session.user.id, carId: input.carId },
      });
      return { success: true };
    }),

  /** Clear all cars from compare. */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.compareList.deleteMany({
      where: { userId: ctx.session.user.id },
    });
    return { success: true };
  }),

  /** Check if a car is in compare list. */
  isInCompare: protectedProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.compareList.findUnique({
        where: {
          userId_carId: {
            userId: ctx.session.user.id,
            carId: input.carId,
          },
        },
      });
      return { inCompare: !!item };
    }),

  /** Get count of cars in compare. */
  count: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.compareList.count({
      where: { userId: ctx.session.user.id },
    });
  }),
});
