import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const alertFiltersSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  condition: z.string().optional(),
  source: z.string().optional(),
  region: z.string().optional(),
});

/** Search Alerts router — saved search notifications. */
export const searchAlertsRouter = createTRPCRouter({
  /** Create a new search alert. */
  create: protectedProcedure
    .input(
      z.object({
        filters: alertFiltersSchema,
        frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.searchAlert.create({
        data: {
          filters: input.filters,
          frequency: input.frequency,
          userId: ctx.session.user.id,
        },
      });
    }),

  /** List search alerts for the current user. */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.searchAlert.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Toggle a search alert on/off. */
  toggle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await ctx.prisma.searchAlert.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!alert) throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });

      return ctx.prisma.searchAlert.update({
        where: { id: input.id },
        data: { isActive: !alert.isActive },
      });
    }),

  /** Update a search alert. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        filters: alertFiltersSchema.optional(),
        frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.searchAlert.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  /** Delete a search alert. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.searchAlert.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),

  /** Get count of active alerts. */
  activeCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.searchAlert.count({
      where: { userId: ctx.session.user.id, isActive: true },
    });
  }),
});
