import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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
      return ctx.prisma.dealerReview.create({
        data: {
          ...input,
          buyerId: ctx.session.user.id,
        },
      });
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
