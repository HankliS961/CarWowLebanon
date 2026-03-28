import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Saved Cars router — user's saved/bookmarked cars. */
export const savedCarsRouter = createTRPCRouter({
  /** Toggle save status for a car. */
  toggle: protectedProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.savedCar.findUnique({
        where: {
          userId_carId: {
            userId: ctx.session.user.id,
            carId: input.carId,
          },
        },
      });

      if (existing) {
        await ctx.prisma.savedCar.delete({ where: { id: existing.id } });
        return { saved: false };
      }

      await ctx.prisma.savedCar.create({
        data: {
          userId: ctx.session.user.id,
          carId: input.carId,
        },
      });
      return { saved: true };
    }),

  /** List saved cars for the current user. */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.savedCar.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          include: {
            dealer: {
              select: { companyName: true, companyNameAr: true, slug: true, isVerified: true },
            },
          },
        },
      },
    });
  }),

  /** Check if a car is saved by the current user. */
  isSaved: protectedProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const saved = await ctx.prisma.savedCar.findUnique({
        where: {
          userId_carId: {
            userId: ctx.session.user.id,
            carId: input.carId,
          },
        },
      });
      return { saved: !!saved };
    }),
});
