import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, dealerProcedure } from "../trpc";
import { notifyPriceDrop } from "@/lib/notifications/create";
import { sendPriceDropEmail } from "@/lib/notifications/email";
import { indexCar, removeCar, searchCars } from "@/lib/meilisearch";
import { logDealerListingCreated, logDealerListingSold } from "@/lib/market-data/log-price";
import { TIER_LIMITS } from "@/lib/constants";

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

  /** List cars for the currently logged-in dealer (all statuses). */
  listForDealer: dealerProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "ACTIVE", "SOLD", "EXPIRED"]).optional(),
        sort: z.enum(["newest", "oldest", "priceLow", "priceHigh", "mileageLow", "yearNew"]).default("newest"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, status } = input;
      const skip = (page - 1) * limit;

      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const where = {
        dealerId: dealer.id,
        ...(status && { status }),
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
        status: z.enum(["DRAFT", "ACTIVE"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { status, ...rest } = input;

      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          id: true,
          subscriptionTier: true,
          _count: {
            select: {
              cars: { where: { status: { in: ["ACTIVE", "DRAFT"] } } },
            },
          },
        },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      // Enforce listing limit based on subscription tier
      const limits = TIER_LIMITS[dealer.subscriptionTier as keyof typeof TIER_LIMITS];
      if (dealer._count.cars >= limits.maxListings) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You've reached your ${limits.maxListings} listing limit. Upgrade your plan to add more listings.`,
        });
      }

      const car = await ctx.prisma.car.create({
        data: {
          ...rest,
          dealerId: dealer.id,
          status: status || "ACTIVE",
        },
      });

      // Fire-and-forget: index in Meilisearch
      indexCar(car).catch(console.error);

      // Fire-and-forget: log market price data for new active listing
      if (car.status === "ACTIVE" && input.priceUsd) {
        logDealerListingCreated(ctx.prisma, {
          make: input.make,
          model: input.model,
          year: input.year,
          trim: input.trim,
          mileageKm: input.mileageKm,
          condition: input.condition,
          carSource: input.source,
          askingPriceUsd: input.priceUsd,
          region: input.locationRegion,
          carListingId: car.id,
        }).catch(console.error);
      }

      return car;
    }),

  /** Update a car listing (dealer only). */
  update: dealerProcedure
    .input(
      z.object({
        carId: z.string().uuid(),
        make: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        year: z.number().min(1900).max(2030).optional(),
        trim: z.string().optional(),
        condition: z.enum(["NEW", "USED", "CERTIFIED_PREOWNED"]).optional(),
        source: z.enum(["LOCAL", "IMPORTED_USA", "IMPORTED_GULF", "IMPORTED_EUROPE", "SALVAGE_REBUILT"]).optional(),
        bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "PICKUP", "COUPE", "CONVERTIBLE", "VAN", "WAGON"]).optional(),
        fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC", "PLUG_IN_HYBRID"]).optional(),
        transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT"]).optional(),
        drivetrain: z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]).optional(),
        mileageKm: z.number().min(0).optional(),
        engineSize: z.string().optional(),
        horsepower: z.number().optional(),
        colorExterior: z.string().optional(),
        colorInterior: z.string().optional(),
        features: z.array(z.string()).optional(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        priceUsd: z.number().positive().optional(),
        priceLbp: z.number().optional(),
        originalPriceUsd: z.number().positive().optional(),
        isNegotiable: z.boolean().optional(),
        images: z.array(z.string()).optional(),
        thumbnailUrl: z.string().optional(),
        locationRegion: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]).optional(),
        locationCity: z.string().min(1).optional(),
        customsPaid: z.boolean().optional(),
        accidentHistory: z.boolean().optional(),
        status: z.enum(["DRAFT", "ACTIVE", "SOLD", "EXPIRED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { carId, ...data } = input;

      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: carId },
        select: { dealerId: true, priceUsd: true, make: true, model: true, year: true },
      });

      if (!car) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
      }

      if (car.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this car listing" });
      }

      const updatedCar = await ctx.prisma.car.update({
        where: { id: carId },
        data,
      });

      // Fire-and-forget: if price dropped, notify users who saved this car
      if (input.priceUsd && input.priceUsd < Number(car.priceUsd)) {
        const carTitle = `${car.year} ${car.make} ${car.model}`;
        const savedBy = await ctx.prisma.savedCar.findMany({
          where: { carId },
          include: { user: true },
        });

        for (const saved of savedBy) {
          notifyPriceDrop({
            userId: saved.userId,
            carTitle,
            oldPrice: Number(car.priceUsd),
            newPrice: input.priceUsd,
            carId,
          }).catch(console.error);

          if (saved.user.email) {
            sendPriceDropEmail(
              saved.user.email,
              carTitle,
              Number(car.priceUsd),
              input.priceUsd,
              carId,
            ).catch(console.error);
          }
        }
      }

      // Fire-and-forget: re-index in Meilisearch
      indexCar(updatedCar).catch(console.error);

      return updatedCar;
    }),

  /** Delete a car listing (dealer only). */
  delete: dealerProcedure
    .input(z.object({ carId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: input.carId },
        select: { dealerId: true },
      });

      if (!car) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
      }

      if (car.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this car listing" });
      }

      const deletedCar = await ctx.prisma.car.delete({
        where: { id: input.carId },
      });

      // Fire-and-forget: remove from Meilisearch index
      removeCar(input.carId).catch(console.error);

      return deletedCar;
    }),

  /** Update listing status (dealer only). */
  updateStatus: dealerProcedure
    .input(
      z.object({
        carId: z.string().uuid(),
        status: z.enum(["DRAFT", "ACTIVE", "SOLD", "EXPIRED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!dealer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dealer profile not found" });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: input.carId },
        select: {
          dealerId: true,
          make: true,
          model: true,
          year: true,
          trim: true,
          mileageKm: true,
          condition: true,
          source: true,
          priceUsd: true,
          locationRegion: true,
        },
      });

      if (!car) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
      }

      if (car.dealerId !== dealer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this car listing" });
      }

      const statusUpdatedCar = await ctx.prisma.car.update({
        where: { id: input.carId },
        data: { status: input.status },
      });

      // Fire-and-forget: re-index in Meilisearch (status change affects search visibility)
      indexCar(statusUpdatedCar).catch(console.error);

      // Fire-and-forget: log market price data when listing is marked as sold
      if (input.status === "SOLD" && car.priceUsd) {
        logDealerListingSold(ctx.prisma, {
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim,
          mileageKm: car.mileageKm,
          condition: car.condition,
          carSource: car.source,
          finalPriceUsd: Number(car.priceUsd),
          region: car.locationRegion,
          carListingId: input.carId,
        }).catch(console.error);
      }

      return statusUpdatedCar;
    }),

  /** Full-text search via Meilisearch with Prisma fallback. */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        make: z.string().optional(),
        model: z.string().optional(),
        yearMin: z.number().optional(),
        yearMax: z.number().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        mileageMax: z.number().optional(),
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
      // ── Build Meilisearch filter string ──────────────────────────────
      const filterParts: string[] = ['status = "ACTIVE"'];

      if (input.make) filterParts.push(`make = "${input.make}"`);
      if (input.model) filterParts.push(`model = "${input.model}"`);
      if (input.condition) filterParts.push(`condition = "${input.condition}"`);
      if (input.bodyType) filterParts.push(`bodyType = "${input.bodyType}"`);
      if (input.fuelType) filterParts.push(`fuelType = "${input.fuelType}"`);
      if (input.transmission) filterParts.push(`transmission = "${input.transmission}"`);
      if (input.region) filterParts.push(`locationRegion = "${input.region}"`);
      if (input.source) filterParts.push(`source = "${input.source}"`);
      if (input.yearMin) filterParts.push(`year >= ${input.yearMin}`);
      if (input.yearMax) filterParts.push(`year <= ${input.yearMax}`);
      if (input.priceMin) filterParts.push(`priceUsd >= ${input.priceMin}`);
      if (input.priceMax) filterParts.push(`priceUsd <= ${input.priceMax}`);
      if (input.mileageMax) filterParts.push(`mileageKm <= ${input.mileageMax}`);

      // ── Sort mapping ────────────────────────────────────────────────
      const sortMap: Record<string, string[]> = {
        newest: ["createdAt:desc"],
        oldest: ["createdAt:asc"],
        priceLow: ["priceUsd:asc"],
        priceHigh: ["priceUsd:desc"],
        mileageLow: ["mileageKm:asc"],
        yearNew: ["year:desc"],
      };

      // ── Try Meilisearch first (fall back to Prisma on any error) ────
      try {
        const meiliResult = await searchCars({
          query: input.query,
          filters: filterParts.join(" AND "),
          sort: sortMap[input.sort],
          page: input.page,
          hitsPerPage: input.limit,
        });

        if (meiliResult) {
          return {
            cars: meiliResult.hits,
            total: (meiliResult as any).totalHits ?? (meiliResult as any).estimatedTotalHits ?? 0,
            page: input.page,
            totalPages: (meiliResult as any).totalPages ?? Math.ceil(((meiliResult as any).totalHits ?? (meiliResult as any).estimatedTotalHits ?? 0) / input.limit),
          };
        }
      } catch (error) {
        // Meilisearch unavailable — fall through to Prisma
        console.warn("[Search] Meilisearch failed, falling back to Prisma:", (error as Error).message);
      }

      // ── Fallback: Prisma-based query (Meilisearch not configured) ──
      const { page, limit, sort, query: _query, ...filters } = input;
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
        ...(filters.yearMin || filters.yearMax
          ? {
              year: {
                ...(filters.yearMin && { gte: filters.yearMin }),
                ...(filters.yearMax && { lte: filters.yearMax }),
              },
            }
          : {}),
        ...(filters.priceMin || filters.priceMax
          ? {
              priceUsd: {
                ...(filters.priceMin && { gte: filters.priceMin }),
                ...(filters.priceMax && { lte: filters.priceMax }),
              },
            }
          : {}),
        ...(filters.mileageMax
          ? { mileageKm: { lte: filters.mileageMax } }
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
});
