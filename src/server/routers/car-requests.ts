import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  dealerProcedure,
} from "../trpc";
import {
  BUYER_REQUEST_LIMITS,
  DEFAULT_REQUEST_DURATION_DAYS,
  TIER_LIMITS,
} from "@/lib/constants";
import type { SubscriptionTier } from "@/lib/constants";
import { createNotification, notifyCarRequestMatch } from "@/lib/notifications/create";

/** Car Requests router — buyers post wanted car requests, dealers respond. */
export const carRequestsRouter = createTRPCRouter({
  /**
   * Create a car request (buyer).
   * Enforces active-request limit based on buyer tier (FREE = 1 for now).
   * Sets expiry to DEFAULT_REQUEST_DURATION_DAYS from now.
   * Created as PENDING_REVIEW — admin must approve before dealers see it.
   */
  create: protectedProcedure
    .input(
      z.object({
        make: z.string().min(1, "Make is required").trim(),
        model: z.string().min(1, "Model is required").trim(),
        yearFrom: z.number().int().min(1990).max(2030),
        yearTo: z.number().int().min(1990).max(2030),
        transmission: z
          .enum(["AUTOMATIC", "MANUAL", "CVT"])
          .optional(),
        bodyType: z
          .enum([
            "SEDAN",
            "SUV",
            "HATCHBACK",
            "PICKUP",
            "COUPE",
            "CONVERTIBLE",
            "VAN",
            "WAGON",
          ])
          .optional(),
        notes: z.string().max(500).trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate yearFrom <= yearTo
      if (input.yearFrom > input.yearTo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "yearFrom must be less than or equal to yearTo",
        });
      }

      // Check active request count against buyer limit.
      // Buyers don't have subscription tiers yet, so everyone is treated as FREE.
      const limit = BUYER_REQUEST_LIMITS.FREE ?? 1;
      const activeCount = await ctx.prisma.carRequest.count({
        where: {
          buyerId: ctx.session.user.id,
          status: { in: ["ACTIVE", "PENDING_REVIEW"] },
        },
      });

      if (activeCount >= limit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You can have at most ${limit} active car request${limit > 1 ? "s" : ""}. Cancel or wait for an existing one to expire.`,
        });
      }

      const expiresAt = new Date(
        Date.now() + DEFAULT_REQUEST_DURATION_DAYS * 24 * 60 * 60 * 1000
      );

      const request = await ctx.prisma.carRequest.create({
        data: {
          buyerId: ctx.session.user.id,
          make: input.make,
          model: input.model,
          yearFrom: input.yearFrom,
          yearTo: input.yearTo,
          transmission: input.transmission ?? null,
          bodyType: input.bodyType ?? null,
          notes: input.notes ?? null,
          status: "PENDING_REVIEW",
          expiresAt,
        },
      });

      // Notify all admins that a new request needs approval (fire-and-forget)
      const carDesc = `${input.yearFrom}-${input.yearTo} ${input.make} ${input.model}`;
      ctx.prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      }).then((admins) => {
        if (admins.length > 0) {
          ctx.prisma.notification.createMany({
            data: admins.map((a) => ({
              userId: a.id,
              type: "NEW_CAR_REQUEST" as const,
              title: `New car request needs approval`,
              body: `A buyer requested a ${carDesc}. Review and approve it.`,
              data: { requestId: request.id, make: input.make, model: input.model },
            })),
          }).catch(console.error);
        }
      }).catch(console.error);

      return request;
    }),

  /**
   * List the current buyer's car requests.
   * Auto-expires any that have passed their expiresAt before returning.
   */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    // Auto-expire stale requests before returning
    await ctx.prisma.carRequest.updateMany({
      where: {
        buyerId: ctx.session.user.id,
        status: "ACTIVE",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    return ctx.prisma.carRequest.findMany({
      where: { buyerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Cancel an active car request (buyer).
   * Verifies ownership before updating status.
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.carRequest.findUnique({
        where: { id: input.id },
        select: { buyerId: true, status: true },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car request not found",
        });
      }

      if (request.buyerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own requests",
        });
      }

      if (request.status !== "ACTIVE" && request.status !== "PENDING_REVIEW") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only active or pending requests can be cancelled",
        });
      }

      return ctx.prisma.carRequest.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  /**
   * List active buyer requests for dealers (BRONZE+ only).
   * Supports pagination and optional make/model filtering.
   * Auto-expires stale requests before querying.
   */
  listActive: dealerProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
        make: z.string().optional(),
        model: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Gate to BRONZE+ tier
      const tierKey = ctx.dealer.subscriptionTier as SubscriptionTier;
      if (!TIER_LIMITS[tierKey]?.buyerRequests) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Viewing buyer requests requires a Bronze or higher subscription",
        });
      }

      // Auto-expire stale requests globally
      await ctx.prisma.carRequest.updateMany({
        where: {
          status: "ACTIVE",
          expiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
      });

      const where = {
        status: "ACTIVE" as const,
        expiresAt: { gt: new Date() },
        ...(input.make ? { make: input.make } : {}),
        ...(input.model ? { model: input.model } : {}),
      };

      const skip = (input.page - 1) * input.limit;

      const [requests, total] = await ctx.prisma.$transaction([
        ctx.prisma.carRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          select: {
            id: true,
            make: true,
            model: true,
            yearFrom: true,
            yearTo: true,
            transmission: true,
            bodyType: true,
            notes: true,
            expiresAt: true,
            createdAt: true,
            buyer: {
              select: {
                name: true,
                phone: true,
                locationRegion: true,
                locationCity: true,
              },
            },
          },
        }),
        ctx.prisma.carRequest.count({ where }),
      ]);

      return {
        requests,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  /**
   * Dealer responds to a buyer request (BRONZE+ only).
   * Creates a CAR_REQUEST_MATCH notification for the buyer.
   * No separate response model -- just notifies the buyer with dealer info.
   */
  respond: dealerProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        message: z.string().min(1, "Message is required").max(1000).trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Gate to BRONZE+ tier
      const tierKey = ctx.dealer.subscriptionTier as SubscriptionTier;
      if (!TIER_LIMITS[tierKey]?.buyerRequests) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Responding to buyer requests requires a Bronze or higher subscription",
        });
      }

      // Verify the request exists and is active
      const request = await ctx.prisma.carRequest.findUnique({
        where: { id: input.requestId },
        select: {
          id: true,
          buyerId: true,
          make: true,
          model: true,
          status: true,
          expiresAt: true,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car request not found",
        });
      }

      if (request.status !== "ACTIVE" || request.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This car request is no longer active",
        });
      }

      // Get dealer info for the notification
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
        select: { companyName: true },
      });

      if (!dealer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Dealer profile not found",
        });
      }

      // Fire-and-forget: notify the buyer about this dealer's interest
      notifyCarRequestMatch({
        buyerId: request.buyerId,
        dealerName: dealer.companyName,
        make: request.make,
        model: request.model,
      }).catch(console.error);

      return { success: true };
    }),
});
