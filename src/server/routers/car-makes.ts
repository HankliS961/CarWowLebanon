import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
});
