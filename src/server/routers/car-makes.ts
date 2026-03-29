import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { deleteFromR2 } from "@/lib/r2";

/** Car Makes router — reference data for makes and models. */
export const carMakesRouter = createTRPCRouter({
  /** List all car makes. */
  list: publicProcedure
    .input(z.object({ popularOnly: z.boolean().default(false) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.carMake.findMany({
        where: input?.popularOnly ? { isPopular: true } : undefined,
        orderBy: { nameEn: "asc" },
        include: { _count: { select: { models: true } } },
      });
    }),

  /** Get models for a specific make. */
  getModels: publicProcedure
    .input(z.object({ makeSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const make = await ctx.prisma.carMake.findUnique({
        where: { slug: input.makeSlug },
        include: {
          models: { orderBy: { nameEn: "asc" } },
        },
      });
      return make;
    }),

  /** Get a make by slug. */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.carMake.findUnique({
        where: { slug: input.slug },
        include: { models: { orderBy: { nameEn: "asc" } } },
      });
    }),

  /** Update a car make's logo (admin only). */
  updateLogo: adminProcedure
    .input(
      z.object({
        makeId: z.number().int(),
        logoUrl: z.string().url().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const make = await ctx.prisma.carMake.findUnique({ where: { id: input.makeId } });
      if (!make) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car make not found" });
      }

      // Delete old logo from R2 if replacing or removing
      if (make.logoUrl && make.logoUrl !== input.logoUrl) {
        deleteFromR2(make.logoUrl).catch(console.error);
      }

      const updated = await ctx.prisma.carMake.update({
        where: { id: input.makeId },
        data: { logoUrl: input.logoUrl },
      });

      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: input.logoUrl ? "UPDATE_MAKE_LOGO" : "REMOVE_MAKE_LOGO",
          targetType: "CarMake",
          targetId: String(input.makeId),
          details: { makeName: make.nameEn, logoUrl: input.logoUrl },
        },
      });

      return updated;
    }),
});
