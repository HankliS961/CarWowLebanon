import { z } from "zod";

/** Car listing form validation schema. */
export const carListingSchema = z.object({
  condition: z.enum(["NEW", "USED", "CERTIFIED_PREOWNED"]),
  source: z.enum([
    "LOCAL",
    "IMPORTED_USA",
    "IMPORTED_GULF",
    "IMPORTED_EUROPE",
    "SALVAGE_REBUILT",
  ]),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(2030),
  trim: z.string().optional(),
  bodyType: z.enum([
    "SEDAN",
    "SUV",
    "HATCHBACK",
    "PICKUP",
    "COUPE",
    "CONVERTIBLE",
    "VAN",
    "WAGON",
  ]),
  mileageKm: z.number().min(0, "Mileage must be positive"),
  fuelType: z.enum([
    "GASOLINE",
    "DIESEL",
    "HYBRID",
    "ELECTRIC",
    "PLUG_IN_HYBRID",
  ]),
  transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT"]),
  drivetrain: z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]).optional(),
  engineSize: z.string().optional(),
  horsepower: z.number().optional(),
  colorExterior: z.string().optional(),
  colorInterior: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  priceUsd: z.number().positive("Price must be positive"),
  priceLbp: z.number().optional(),
  isNegotiable: z.boolean().default(false),
  locationRegion: z.enum([
    "BEIRUT",
    "MOUNT_LEBANON",
    "NORTH",
    "SOUTH",
    "BEKAA",
    "NABATIEH",
  ]),
  locationCity: z.string().min(1, "City is required"),
  features: z.array(z.string()).default([]),
  customsPaid: z.boolean().optional(),
  accidentHistory: z.boolean().optional(),
});

/** Car search filters schema. */
export const carSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  condition: z.enum(["NEW", "USED", "CERTIFIED_PREOWNED"]).optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  region: z.string().optional(),
  source: z.string().optional(),
  sort: z
    .enum(["newest", "oldest", "priceLow", "priceHigh", "mileageLow", "yearNew"])
    .default("newest"),
  page: z.number().min(1).default(1),
});

export type CarListingInput = z.infer<typeof carListingSchema>;
export type CarSearchInput = z.infer<typeof carSearchSchema>;
