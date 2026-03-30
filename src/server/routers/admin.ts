import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure, publicProcedure } from "../trpc";
import { UserRole, ContentStatus } from "@prisma/client";
import { deleteFromR2 } from "@/lib/r2";
import { createNotification } from "@/lib/notifications/create";

/** Admin router — platform administration. */
export const adminRouter = createTRPCRouter({
  /** Get platform statistics. */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [users, dealers, cars, inquiries, sellListings, pendingDealers, flaggedListings, pendingReviews] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.dealer.count(),
      ctx.prisma.car.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.inquiry.count(),
      ctx.prisma.sellListing.count(),
      ctx.prisma.dealer.count({ where: { status: "PENDING" } }),
      ctx.prisma.car.count({ where: { status: { not: "ACTIVE" } } }),
      ctx.prisma.dealerReview.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    return { users, dealers, cars, inquiries, sellListings, pendingDealers, flaggedListings, pendingReviews };
  }),

  /** Get car count by region for analytics. */
  getRegionStats: adminProcedure.query(async ({ ctx }) => {
    const regionStats = await ctx.prisma.car.groupBy({
      by: ["locationRegion"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    return regionStats.map((r) => ({
      region: r.locationRegion,
      count: r._count,
    }));
  }),

  /** List all users with pagination. */
  listUsers: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(25) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        ctx.prisma.user.count(),
      ]);
      return { users, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Verify a dealer. */
  verifyDealer: adminProcedure
    .input(z.object({ dealerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.update({
        where: { id: input.dealerId },
        data: { isVerified: true, status: "ACTIVE" },
      });

      // Log admin action
      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "VERIFY_DEALER",
          targetType: "Dealer",
          targetId: input.dealerId,
        },
      });

      return dealer;
    }),

  /** Get admin logs. */
  getLogs: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.adminLog.findMany({
        skip,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true, email: true } } },
      });
    }),

  /** Reject a dealer application. */
  rejectDealer: adminProcedure
    .input(z.object({ dealerId: z.string().uuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({ where: { id: input.dealerId } });
      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer not found" });
      }

      const updated = await ctx.prisma.dealer.update({
        where: { id: input.dealerId },
        data: { status: "SUSPENDED", isVerified: false },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "REJECT_DEALER",
          targetType: "Dealer",
          targetId: input.dealerId,
          details: { reason: input.reason },
        },
      });

      return updated;
    }),

  /** Suspend a dealer. */
  suspendDealer: adminProcedure
    .input(z.object({ dealerId: z.string().uuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({ where: { id: input.dealerId } });
      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer not found" });
      }

      const updated = await ctx.prisma.dealer.update({
        where: { id: input.dealerId },
        data: { status: "SUSPENDED" },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "SUSPEND_DEALER",
          targetType: "Dealer",
          targetId: input.dealerId,
          details: { reason: input.reason },
        },
      });

      return updated;
    }),

  /** Suspend a user (logs the action; User model has no status field). */
  suspendUser: adminProcedure
    .input(z.object({ userId: z.string().uuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "SUSPEND_USER",
          targetType: "User",
          targetId: input.userId,
          details: { reason: input.reason },
        },
      });

      return { success: true };
    }),

  /** Change a user's role. */
  changeUserRole: adminProcedure
    .input(z.object({ userId: z.string().uuid(), role: z.nativeEnum(UserRole) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const updated = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "CHANGE_USER_ROLE",
          targetType: "User",
          targetId: input.userId,
          details: { previousRole: user.role, newRole: input.role },
        },
      });

      return updated;
    }),

  /** Moderate a car listing (approve, remove, or warn). */
  moderateListing: adminProcedure
    .input(
      z.object({
        carId: z.string().uuid(),
        action: z.enum(["APPROVE", "REMOVE", "WARN", "REVOKE_WARN"]),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const car = await ctx.prisma.car.findUnique({ where: { id: input.carId } });
      if (!car) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car listing not found" });
      }

      if (input.action === "APPROVE") {
        await ctx.prisma.car.update({
          where: { id: input.carId },
          data: { status: "ACTIVE", warningReason: null },
        });
      } else if (input.action === "REMOVE") {
        await ctx.prisma.car.update({
          where: { id: input.carId },
          data: { status: "EXPIRED" },
        });
      } else if (input.action === "WARN") {
        // Set to DRAFT so dealer can edit and resubmit, store the reason
        await ctx.prisma.car.update({
          where: { id: input.carId },
          data: { status: "DRAFT", warningReason: input.reason ?? null },
        });

        // Fetch dealer info to notify the right user
        const dealer = await ctx.prisma.dealer.findUnique({
          where: { id: car.dealerId },
          select: { userId: true },
        });

        if (dealer) {
          const carTitle = `${car.year} ${car.make} ${car.model}`;
          createNotification({
            userId: dealer.userId,
            type: "LISTING_WARNING",
            title: `Listing warning: ${carTitle}`,
            body: input.reason
              ? `Your listing for ${carTitle} was flagged by an admin: "${input.reason}". The listing has been moved to drafts so you can fix it and resubmit.`
              : `Your listing for ${carTitle} was flagged by an admin and moved to drafts. Please review and resubmit.`,
            data: { carId: input.carId, reason: input.reason ?? null },
          }).catch(console.error);
        }
      } else if (input.action === "REVOKE_WARN") {
        await ctx.prisma.car.update({
          where: { id: input.carId },
          data: { status: "ACTIVE", warningReason: null },
        });
      }

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: `MODERATE_LISTING_${input.action}`,
          targetType: "Car",
          targetId: input.carId,
          details: { action: input.action, reason: input.reason ?? null },
        },
      });

      return { success: true };
    }),

  /** Load latest settings from the most recent UPDATE_SETTINGS admin log. */
  getLatestSettings: adminProcedure.query(async ({ ctx }) => {
    const latest = await ctx.prisma.adminLog.findFirst({
      where: { action: "UPDATE_SETTINGS" },
      orderBy: { createdAt: "desc" },
    });
    return (latest?.details ?? null) as Record<string, unknown> | null;
  }),

  /** Update platform settings (stored as admin log until SystemSettings model is added). */
  updateSettings: adminProcedure
    .input(
      z.object({
        exchangeRate: z.number().positive().optional(),
        leadFee: z.number().nonnegative().optional(),
        featuredFee: z.number().nonnegative().optional(),
        auctionDuration: z.number().int().positive().optional(),
        maxFreeListings: z.number().int().nonnegative().optional(),
        platformName: z.string().min(1).optional(),
        supportEmail: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "UPDATE_SETTINGS",
          details: input,
        },
      });

      return { success: true };
    }),

  /** Toggle featured status on a car listing. */
  toggleFeatured: adminProcedure
    .input(z.object({ carId: z.string().uuid(), featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const car = await ctx.prisma.car.findUnique({ where: { id: input.carId } });
      if (!car) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car listing not found" });
      }

      const updated = await ctx.prisma.car.update({
        where: { id: input.carId },
        data: { isFeatured: input.featured },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "TOGGLE_FEATURED",
          targetType: "Car",
          targetId: input.carId,
          details: { featured: input.featured },
        },
      });

      return updated;
    }),

  /** Toggle featured status on a dealer. */
  toggleFeaturedDealer: adminProcedure
    .input(z.object({ dealerId: z.string().uuid(), featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({ where: { id: input.dealerId } });
      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer not found" });
      }

      const updated = await ctx.prisma.dealer.update({
        where: { id: input.dealerId },
        data: { isFeatured: input.featured },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "TOGGLE_FEATURED",
          targetType: "Dealer",
          targetId: input.dealerId,
          details: { featured: input.featured },
        },
      });

      return updated;
    }),

  /** Publish or unpublish blog posts and car reviews. */
  publishContent: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        type: z.enum(["BLOG", "REVIEW"]),
        status: z.nativeEnum(ContentStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

      if (input.type === "BLOG") {
        const post = await ctx.prisma.blogPost.findUnique({ where: { id: input.id } });
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Blog post not found" });
        }
        await ctx.prisma.blogPost.update({
          where: { id: input.id },
          data: { status: input.status, publishedAt },
        });
      } else {
        const review = await ctx.prisma.carReview.findUnique({ where: { id: input.id } });
        if (!review) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Car review not found" });
        }
        await ctx.prisma.carReview.update({
          where: { id: input.id },
          data: { status: input.status, publishedAt },
        });
      }

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "PUBLISH_CONTENT",
          targetType: input.type === "BLOG" ? "BlogPost" : "CarReview",
          targetId: input.id,
          details: { type: input.type, status: input.status },
        },
      });

      return { success: true };
    }),

  /** Get dealers with PENDING status (awaiting approval). */
  getDealersPending: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.dealer.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
        _count: { select: { cars: true } },
      },
    });
  }),

  /** List all dealers regardless of status (admin view). */
  listAllDealers: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const [dealers, total] = await Promise.all([
        ctx.prisma.dealer.findMany({
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { cars: true } },
          },
        }),
        ctx.prisma.dealer.count(),
      ]);
      return { dealers, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Get listings for moderation (non-ACTIVE cars). */
  getListingsFlagged: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.car.findMany({
      where: { status: { not: "ACTIVE" } },
      orderBy: { createdAt: "desc" },
      include: {
        dealer: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
    });
  }),

  // =========================================================================
  // SITE IMAGES
  // =========================================================================

  /** List site images, optionally filtered by category (admin). */
  listSiteImages: adminProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.siteImage.findMany({
        where: input?.category ? { category: input.category } : undefined,
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      });
    }),

  /** Upsert a site image by category + key. */
  upsertSiteImage: adminProcedure
    .input(
      z.object({
        category: z.string().min(1),
        key: z.string().min(1),
        imageUrl: z.string().url(),
        label: z.string().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Delete old image from R2 if replacing
      const existing = await ctx.prisma.siteImage.findUnique({
        where: { category_key: { category: input.category, key: input.key } },
      });
      if (existing && existing.imageUrl !== input.imageUrl) {
        deleteFromR2(existing.imageUrl).catch(console.error);
      }

      const image = await ctx.prisma.siteImage.upsert({
        where: { category_key: { category: input.category, key: input.key } },
        create: {
          category: input.category,
          key: input.key,
          imageUrl: input.imageUrl,
          label: input.label ?? null,
          sortOrder: input.sortOrder ?? 0,
        },
        update: {
          imageUrl: input.imageUrl,
          ...(input.label !== undefined && { label: input.label }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "UPSERT_SITE_IMAGE",
          targetType: "SiteImage",
          targetId: image.id,
          details: { category: input.category, key: input.key },
        },
      });

      return image;
    }),

  /** Delete a site image by ID. */
  deleteSiteImage: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.siteImage.findUnique({ where: { id: input.id } });
      if (!image) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Site image not found" });
      }

      // Delete from R2 storage
      deleteFromR2(image.imageUrl).catch(console.error);

      await ctx.prisma.siteImage.delete({ where: { id: input.id } });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "DELETE_SITE_IMAGE",
          targetType: "SiteImage",
          targetId: input.id,
          details: { category: image.category, key: image.key },
        },
      });

      return { success: true };
    }),

  /** Get site images (PUBLIC) — used by homepage sections. */
  getSiteImages: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.siteImage.findMany({
        where: { category: input.category },
        orderBy: { sortOrder: "asc" },
      });
    }),

  /** Get market data collection statistics for analytics dashboard. */
  getMarketDataStats: adminProcedure.query(async ({ ctx }) => {
    const [total, bySource, topMakes] = await Promise.all([
      ctx.prisma.marketPriceData.count(),
      ctx.prisma.marketPriceData.groupBy({
        by: ["source"],
        _count: true,
      }),
      ctx.prisma.marketPriceData.groupBy({
        by: ["make"],
        _count: true,
        orderBy: { _count: { make: "desc" } },
        take: 10,
      }),
    ]);

    return {
      total,
      bySource: bySource.map((s: any) => ({ source: s.source, count: s._count })),
      topMakes: topMakes.map((m: any) => ({ make: m.make, count: m._count })),
    };
  }),
});
