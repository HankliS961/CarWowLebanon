import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure, dealerProcedure, adminProcedure } from "../trpc";
import { notifyReviewReceived } from "@/lib/notifications/create";

/** Reviews router — dealer and car reviews. */
export const reviewsRouter = createTRPCRouter({
  /** Submit a dealer review. */
  createDealerReview: protectedProcedure
    .input(
      z.object({
        dealerId: z.string().uuid(),
        inquiryId: z.string().uuid().optional(),
        ratingOverall: z.number().min(1).max(5),
        ratingPriceFairness: z.number().min(1).max(5),
        ratingCommunication: z.number().min(1).max(5),
        ratingHonesty: z.number().min(1).max(5),
        title: z.string().optional(),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.dealerReview.create({
        data: {
          ...input,
          buyerId: ctx.session.user.id,
        },
      });

      // Fire-and-forget: notify dealer about the new review
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { id: input.dealerId },
      });

      if (dealer) {
        notifyReviewReceived({
          dealerUserId: dealer.userId,
          reviewerName: ctx.session.user.name || "A buyer",
          rating: input.ratingOverall,
          dealerId: input.dealerId,
        }).catch(console.error);
      }

      return review;
    }),

  /** Get dealer reviews. */
  getDealerReviews: publicProcedure
    .input(z.object({ dealerId: z.string().uuid(), page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.dealerReview.findMany({
        where: { dealerId: input.dealerId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
        include: {
          buyer: { select: { name: true, avatarUrl: true } },
        },
      });
    }),

  /** Get reviews for the currently logged-in dealer. */
  getForDealer: dealerProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const skip = (input.page - 1) * input.limit;

      const [reviews, total] = await Promise.all([
        ctx.prisma.dealerReview.findMany({
          where: { dealerId: dealer.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          include: {
            buyer: { select: { name: true, avatarUrl: true } },
          },
        }),
        ctx.prisma.dealerReview.count({ where: { dealerId: dealer.id } }),
      ]);

      return { reviews, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Dealer responds to a review. */
  respondToReview: dealerProcedure
    .input(z.object({ reviewId: z.string().uuid(), response: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const review = await ctx.prisma.dealerReview.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      if (review.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only respond to your own reviews" });
      }

      return ctx.prisma.dealerReview.update({
        where: { id: input.reviewId },
        data: {
          dealerResponse: input.response,
          dealerRespondedAt: new Date(),
        },
      });
    }),

  /** Admin moderates a dealer review (approve/reject). */
  moderateReview: adminProcedure
    .input(z.object({ reviewId: z.string().uuid(), status: z.enum(["APPROVED", "REJECTED"]) }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.dealerReview.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      return ctx.prisma.dealerReview.update({
        where: { id: input.reviewId },
        data: { status: input.status },
      });
    }),

  /** Admin gets pending reviews for moderation. */
  getPendingReviews: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const [reviews, total] = await Promise.all([
        ctx.prisma.dealerReview.findMany({
          where: { status: "PENDING_REVIEW" },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          include: {
            buyer: { select: { name: true, avatarUrl: true } },
            dealer: { select: { companyName: true, slug: true, logoUrl: true } },
          },
        }),
        ctx.prisma.dealerReview.count({ where: { status: "PENDING_REVIEW" } }),
      ]);

      return { reviews, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Get published car reviews. */
  listCarReviews: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.carReview.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip,
        take: input.limit,
        include: {
          author: { select: { name: true, avatarUrl: true } },
        },
      });
    }),

  /** Get a single car review by slug. */
  getCarReviewBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const review = await ctx.prisma.carReview.findUnique({
        where: { slug: input.slug },
        include: { author: { select: { name: true, avatarUrl: true } } },
      });

      if (review) {
        ctx.prisma.carReview
          .update({ where: { id: review.id }, data: { viewsCount: { increment: 1 } } })
          .catch(() => {});
      }

      return review;
    }),
});
