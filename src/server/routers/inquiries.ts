import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure, dealerProcedure } from "../trpc";
import { createNotification, notifyNewInquiry } from "@/lib/notifications/create";
import { sendInquiryEmail } from "@/lib/notifications/email";

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
        select: {
          dealerId: true,
          make: true,
          model: true,
          year: true,
          dealer: { select: { userId: true, user: { select: { email: true } } } },
        },
      });

      if (!car) throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });

      // Increment inquiry count on the car
      await ctx.prisma.car.update({
        where: { id: input.carId },
        data: { inquiriesCount: { increment: 1 } },
      });

      const inquiry = await ctx.prisma.inquiry.create({
        data: {
          carId: input.carId,
          buyerId: ctx.session.user.id,
          dealerId: car.dealerId,
          message: input.message,
          preferredContact: input.preferredContact,
        },
      });

      // Fire-and-forget: notify dealer about new inquiry
      const carTitle = `${car.year} ${car.make} ${car.model}`;
      const buyerName = ctx.session.user.name || "A buyer";

      notifyNewInquiry({
        dealerUserId: car.dealer.userId,
        buyerName,
        carTitle,
        inquiryId: inquiry.id,
      }).catch(console.error);

      if (car.dealer.user.email) {
        sendInquiryEmail(
          car.dealer.user.email,
          buyerName,
          carTitle,
          inquiry.id,
        ).catch(console.error);
      }

      return inquiry;
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
          dealer: { select: { companyName: true, companyNameAr: true, slug: true, phone: true, whatsappNumber: true, email: true } },
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
      if (!dealer) throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });

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

  /** Respond to an inquiry (dealer only). */
  respond: dealerProcedure
    .input(
      z.object({
        inquiryId: z.string().uuid(),
        response: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const inquiry = await ctx.prisma.inquiry.findUnique({
        where: { id: input.inquiryId },
        select: { dealerId: true, buyerId: true, car: { select: { make: true, model: true, year: true } } },
      });

      if (!inquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inquiry not found" });
      }

      if (inquiry.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this inquiry" });
      }

      const updated = await ctx.prisma.inquiry.update({
        where: { id: input.inquiryId },
        data: {
          status: "RESPONDED",
          dealerResponse: input.response,
          respondedAt: new Date(),
        },
      });

      // Notify the buyer about the dealer's response
      const carTitle = `${inquiry.car.year} ${inquiry.car.make} ${inquiry.car.model}`;
      createNotification({
        userId: inquiry.buyerId,
        type: "NEW_INQUIRY",
        title: `${dealer.companyName} responded to your inquiry`,
        body: `Response about ${carTitle}: ${input.response}`,
        data: { inquiryId: input.inquiryId, response: input.response },
      }).catch(() => {});

      return updated;
    }),

  /** Mark an inquiry as viewed (dealer only). */
  markViewed: dealerProcedure
    .input(z.object({ inquiryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const inquiry = await ctx.prisma.inquiry.findUnique({
        where: { id: input.inquiryId },
        select: { dealerId: true },
      });

      if (!inquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inquiry not found" });
      }

      if (inquiry.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this inquiry" });
      }

      return ctx.prisma.inquiry.update({
        where: { id: input.inquiryId },
        data: {
          status: "VIEWED",
          viewedAt: new Date(),
        },
      });
    }),

  /** Close an inquiry (dealer only). */
  close: dealerProcedure
    .input(z.object({ inquiryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const inquiry = await ctx.prisma.inquiry.findUnique({
        where: { id: input.inquiryId },
        select: { dealerId: true },
      });

      if (!inquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inquiry not found" });
      }

      if (inquiry.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this inquiry" });
      }

      return ctx.prisma.inquiry.update({
        where: { id: input.inquiryId },
        data: { status: "CLOSED" },
      });
    }),
});
