import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, dealerProcedure } from "../trpc";

/** Dealers router — dealer profiles and directory. */
export const dealersRouter = createTRPCRouter({
  /** List dealers with filters. */
  list: publicProcedure
    .input(
      z.object({
        region: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]).optional(),
        isVerified: z.boolean().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, ...filters } = input;
      const skip = (page - 1) * limit;

      const where = {
        status: "ACTIVE" as const,
        ...(filters.region && { region: filters.region }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
        ...(filters.search && {
          OR: [
            { companyName: { contains: filters.search, mode: "insensitive" as const } },
            { companyNameAr: { contains: filters.search } },
          ],
        }),
      };

      const [dealers, total] = await Promise.all([
        ctx.prisma.dealer.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ isFeatured: "desc" }, { ratingAvg: "desc" }],
          include: {
            _count: { select: { cars: { where: { status: "ACTIVE" } } } },
          },
        }),
        ctx.prisma.dealer.count({ where }),
      ]);

      return { dealers, total, page, totalPages: Math.ceil(total / limit) };
    }),

  /** Get a dealer profile by slug. */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.dealer.findUnique({
        where: { slug: input.slug },
        include: {
          cars: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          reviews: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              buyer: { select: { name: true, avatarUrl: true } },
            },
          },
          _count: { select: { cars: { where: { status: "ACTIVE" } } } },
        },
      });
    }),

  /** Register as a new dealer. */
  register: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(2),
        companyNameAr: z.string().min(2),
        phone: z.string().min(8),
        email: z.string().email(),
        region: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]),
        city: z.string().min(2),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return ctx.prisma.dealer.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          slug,
        },
      });
    }),

  /** Update dealer profile (dealer only). */
  updateProfile: dealerProcedure
    .input(
      z.object({
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        whatsappNumber: z.string().optional(),
        websiteUrl: z.string().url().optional(),
        instagramUrl: z.string().optional(),
        workingHours: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dealer.update({
        where: { userId: ctx.session.user.id },
        data: {
          descriptionEn: input.descriptionEn,
          descriptionAr: input.descriptionAr,
          whatsappNumber: input.whatsappNumber,
          websiteUrl: input.websiteUrl,
          instagramUrl: input.instagramUrl,
          ...(input.workingHours !== undefined && { workingHours: input.workingHours }),
        },
      });
    }),
});
