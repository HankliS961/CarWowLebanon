import { z } from "zod";
import { createTRPCRouter, protectedProcedure, dealerProcedure } from "../trpc";

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
      if (!dealer) throw new Error("Dealer profile not found");

      return ctx.prisma.dealerOffer.create({
        data: {
          ...input,
          dealerId: dealer.id,
        },
      });
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
        throw new Error("Offer not found or unauthorized");
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
