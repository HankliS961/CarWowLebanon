import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, dealerProcedure } from "../trpc";

/** Inquiries router — buyer-dealer communication. */
export const inquiriesRouter = createTRPCRouter({
  /** Create a new inquiry for a car. */
  create: protectedProcedure
    .input(
      z.object({
        carId: z.string().uuid(),
        message: z.string().min(1).max(1000),
        preferredContact: z.enum(["WHATSAPP", "CALL", "EMAIL", "IN_APP"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const car = await ctx.prisma.car.findUnique({
        where: { id: input.carId },
        select: { dealerId: true },
      });

      if (!car) throw new Error("Car not found");

      // Increment inquiry count on the car
      await ctx.prisma.car.update({
        where: { id: input.carId },
        data: { inquiriesCount: { increment: 1 } },
      });

      return ctx.prisma.inquiry.create({
        data: {
          carId: input.carId,
          buyerId: ctx.session.user.id,
          dealerId: car.dealerId,
          message: input.message,
          preferredContact: input.preferredContact,
        },
      });
    }),

  /** List inquiries for the current buyer. */
  listMine: protectedProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.inquiry.findMany({
        where: { buyerId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
        include: {
          car: { select: { id: true, make: true, model: true, year: true, thumbnailUrl: true, priceUsd: true } },
          dealer: { select: { companyName: true, companyNameAr: true, slug: true } },
        },
      });
    }),

  /** List inquiries for the current dealer. */
  listForDealer: dealerProcedure
    .input(
      z.object({
        status: z.enum(["NEW", "VIEWED", "RESPONDED", "CONVERTED", "CLOSED"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({ where: { userId: ctx.session.user.id } });
      if (!dealer) throw new Error("Dealer profile not found");

      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.inquiry.findMany({
        where: {
          dealerId: dealer.id,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
        include: {
          car: { select: { id: true, make: true, model: true, year: true, thumbnailUrl: true } },
          buyer: { select: { name: true, email: true, phone: true } },
        },
      });
    }),
});
