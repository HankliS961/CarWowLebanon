import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  calculateImportCost,
  calculateLoan,
  calculateFuelCost,
  calculateValuation,
  DEFAULT_FUEL_PRICES,
} from "@/lib/tools/calculations";

/** Tools router — calculators and utilities. */
export const toolsRouter = createTRPCRouter({
  /** Calculate estimated import cost for a car to Lebanon. */
  calculateImportCost: publicProcedure
    .input(
      z.object({
        originCountry: z.enum(["USA", "GULF", "EUROPE", "ASIA"]),
        carValueUsd: z.number().positive(),
        carYear: z.number().min(1990).max(2030),
        engineSize: z.enum(["UNDER_1500", "1500_2000", "2000_3000", "OVER_3000"]),
        fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"]),
        condition: z.enum(["NEW", "USED", "SALVAGE"]),
      })
    )
    .query(({ input }) => {
      return calculateImportCost(input);
    }),

  /** Calculate monthly loan payment with amortization. */
  calculateLoan: publicProcedure
    .input(
      z.object({
        carPrice: z.number().positive(),
        downPayment: z.number().min(0),
        loanTermYears: z.number().min(1).max(7),
        interestRate: z.number().min(0).max(30),
      })
    )
    .query(({ input }) => {
      return calculateLoan(input);
    }),

  /** Calculate monthly fuel costs. */
  calculateFuelCost: publicProcedure
    .input(
      z.object({
        consumptionKmPerL: z.number().positive(),
        dailyDistanceKm: z.number().positive(),
        fuelType: z.enum(["GASOLINE_95", "GASOLINE_98", "DIESEL"]),
        fuelPricePerLiter: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calculateFuelCost(input);
    }),

  /** Estimate car market value. */
  calculateValuation: publicProcedure
    .input(
      z.object({
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().min(1990).max(2030),
        mileageKm: z.number().min(0),
        condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
        source: z.enum(["LOCAL", "IMPORTED", "SALVAGE"]),
      })
    )
    .query(({ input }) => {
      return calculateValuation(input);
    }),

  /** Get current default fuel prices in Lebanon. */
  getFuelPrices: publicProcedure.query(() => {
    return DEFAULT_FUEL_PRICES;
  }),

  /** Get car makes for tool dropdowns. */
  getCarMakes: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.carMake.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameAr: true, slug: true },
    });
  }),

  /** Get car models for a given make. */
  getCarModels: publicProcedure
    .input(z.object({ makeId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.carModel.findMany({
        where: { makeId: input.makeId },
        orderBy: { nameEn: "asc" },
        select: { id: true, nameEn: true, nameAr: true, slug: true },
      });
    }),
});
