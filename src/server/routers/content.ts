import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { BLOG_CATEGORIES } from "@/types/content";

/** Content router — blog posts, guides, and editorial content. */
export const contentRouter = createTRPCRouter({
  // -----------------------------------------------------------------------
  // Blog Posts
  // -----------------------------------------------------------------------

  /** List published blog posts with optional category and tag filters. */
  listBlogPosts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        tag: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // Map slug to DB enum value if category is a slug
      let categoryFilter: string | undefined = input.category;
      if (input.category) {
        const meta = BLOG_CATEGORIES.find((c) => c.slug === input.category);
        if (meta) categoryFilter = meta.dbValue;
      }

      const where = {
        status: "PUBLISHED" as const,
        ...(categoryFilter && { category: categoryFilter as never }),
        ...(input.tag && {
          tags: { array_contains: [input.tag] },
        }),
      };

      const [posts, total] = await Promise.all([
        ctx.prisma.blogPost.findMany({
          where,
          orderBy: { publishedAt: "desc" },
          skip,
          take: input.limit,
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        }),
        ctx.prisma.blogPost.count({ where }),
      ]);

      return {
        posts,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  /** Get a single blog post by slug. */
  getBlogPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.blogPost.findUnique({
        where: { slug: input.slug },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      });

      if (post) {
        // Fire-and-forget view count increment
        ctx.prisma.blogPost
          .update({ where: { id: post.id }, data: { viewsCount: { increment: 1 } } })
          .catch(() => {});
      }

      return post;
    }),

  /** Get related posts by same category (excluding current post). */
  getRelatedPosts: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        category: z.string(),
        limit: z.number().min(1).max(6).default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          category: input.category as never,
          id: { not: input.postId },
        },
        orderBy: { publishedAt: "desc" },
        take: input.limit,
        include: {
          author: { select: { name: true, avatarUrl: true } },
        },
      });
    }),

  /** Get popular posts by view count. */
  getPopularPosts: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewsCount: "desc" },
        take: input.limit,
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleAr: true,
          featuredImageUrl: true,
          publishedAt: true,
          viewsCount: true,
        },
      });
    }),

  // -----------------------------------------------------------------------
  // Car Reviews
  // -----------------------------------------------------------------------

  /** List published car reviews with optional make/model filter. */
  listCarReviews: publicProcedure
    .input(
      z.object({
        make: z.string().optional(),
        bodyType: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where = {
        status: "PUBLISHED" as const,
        ...(input.make && { make: { equals: input.make, mode: "insensitive" as const } }),
      };

      const [reviews, total] = await Promise.all([
        ctx.prisma.carReview.findMany({
          where,
          orderBy: { publishedAt: "desc" },
          skip,
          take: input.limit,
          include: { author: { select: { name: true, avatarUrl: true } } },
        }),
        ctx.prisma.carReview.count({ where }),
      ]);

      return { reviews, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Get a car review by make and model slug (for hub pages). */
  getCarReviewByMakeModel: publicProcedure
    .input(
      z.object({
        make: z.string(),
        model: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const review = await ctx.prisma.carReview.findFirst({
        where: {
          make: { equals: input.make, mode: "insensitive" },
          model: { equals: input.model, mode: "insensitive" },
          status: "PUBLISHED",
        },
        orderBy: { year: "desc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      });

      if (review) {
        ctx.prisma.carReview
          .update({ where: { id: review.id }, data: { viewsCount: { increment: 1 } } })
          .catch(() => {});
      }

      return review;
    }),

  /** Get a single car review by slug. */
  getCarReviewBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const review = await ctx.prisma.carReview.findUnique({
        where: { slug: input.slug },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      });

      if (review) {
        ctx.prisma.carReview
          .update({ where: { id: review.id }, data: { viewsCount: { increment: 1 } } })
          .catch(() => {});
      }

      return review;
    }),

  /** Get distinct makes that have published reviews. */
  getReviewedMakes: publicProcedure.query(async ({ ctx }) => {
    const makes = await ctx.prisma.carReview.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["make"],
      select: { make: true },
      orderBy: { make: "asc" },
    });
    return makes.map((m) => m.make);
  }),
});
