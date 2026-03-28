import { z } from "zod";
import { createTRPCRouter, publicProcedure, dealerProcedure } from "../trpc";

/** Cars router — CRUD operations for car listings. */
export const carsRouter = createTRPCRouter({
  /** List cars with filters, pagination, and sorting. */
  list: publicProcedure
    .input(
      z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        priceFrom: z.number().optional(),
        priceTo: z.number().optional(),
        condition: z.enum(["NEW", "USED", "CERTIFIED_PREOWNED"]).optional(),
        bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "PICKUP", "COUPE", "CONVERTIBLE", "VAN", "WAGON"]).optional(),
        fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC", "PLUG_IN_HYBRID"]).optional(),
        transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT"]).optional(),
        region: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]).optional(),
        source: z.enum(["LOCAL", "IMPORTED_USA", "IMPORTED_GULF", "IMPORTED_EUROPE", "SALVAGE_REBUILT"]).optional(),
        sort: z.enum(["newest", "oldest", "priceLow", "priceHigh", "mileageLow", "yearNew"]).default("newest"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, ...filters } = input;
      const skip = (page - 1) * limit;

      const where = {
        status: "ACTIVE" as const,
        ...(filters.make && { make: filters.make }),
        ...(filters.model && { model: filters.model }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.bodyType && { bodyType: filters.bodyType }),
        ...(filters.fuelType && { fuelType: filters.fuelType }),
        ...(filters.transmission && { transmission: filters.transmission }),
        ...(filters.region && { locationRegion: filters.region }),
        ...(filters.source && { source: filters.source }),
        ...(filters.yearFrom || filters.yearTo
          ? {
              year: {
                ...(filters.yearFrom && { gte: filters.yearFrom }),
                ...(filters.yearTo && { lte: filters.yearTo }),
              },
            }
          : {}),
        ...(filters.priceFrom || filters.priceTo
          ? {
              priceUsd: {
                ...(filters.priceFrom && { gte: filters.priceFrom }),
                ...(filters.priceTo && { lte: filters.priceTo }),
              },
            }
          : {}),
      };

      const orderBy = {
        newest: { createdAt: "desc" as const },
        oldest: { createdAt: "asc" as const },
        priceLow: { priceUsd: "asc" as const },
        priceHigh: { priceUsd: "desc" as const },
        mileageLow: { mileageKm: "asc" as const },
        yearNew: { year: "desc" as const },
      }[sort];

      const [cars, total] = await Promise.all([
        ctx.prisma.car.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            dealer: {
              select: {
                id: true,
                companyName: true,
                companyNameAr: true,
                slug: true,
                logoUrl: true,
                isVerified: true,
                ratingAvg: true,
                city: true,
                region: true,
              },
            },
          },
        }),
        ctx.prisma.car.count({ where }),
      ]);

      return {
        cars,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /** Get a single car by ID with full details. */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const car = await ctx.prisma.car.findUnique({
        where: { id: input.id },
        include: {
          dealer: {
            select: {
              id: true,
              companyName: true,
              companyNameAr: true,
              slug: true,
              logoUrl: true,
              isVerified: true,
              ratingAvg: true,
              reviewCount: true,
              phone: true,
              whatsappNumber: true,
              city: true,
              region: true,
            },
          },
        },
      });

      if (car) {
        // Increment view count asynchronously
        ctx.prisma.car
          .update({ where: { id: input.id }, data: { viewsCount: { increment: 1 } } })
          .catch(() => {});
      }

      return car;
    }),

  /** Get featured cars for the homepage. */
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.car.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          dealer: {
            select: {
              id: true,
              companyName: true,
              companyNameAr: true,
              slug: true,
              isVerified: true,
            },
          },
        },
      });
    }),

  /** Create a new car listing (dealer only). */
  create: dealerProcedure
    .input(
      z.object({
        condition: z.enum(["NEW", "USED", "CERTIFIED_PREOWNED"]),
        source: z.enum(["LOCAL", "IMPORTED_USA", "IMPORTED_GULF", "IMPORTED_EUROPE", "SALVAGE_REBUILT"]),
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().min(1900).max(2030),
        trim: z.string().optional(),
        bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "PICKUP", "COUPE", "CONVERTIBLE", "VAN", "WAGON"]),
        mileageKm: z.number().min(0),
        fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC", "PLUG_IN_HYBRID"]),
        transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT"]),
        priceUsd: z.number().positive(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        locationRegion: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]),
        locationCity: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new Error("Dealer profile not found");
      }

      return ctx.prisma.car.create({
        data: {
          ...input,
          dealerId: dealer.id,
          status: "DRAFT",
        },
      });
    }),
});
