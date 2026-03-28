/**
 * Car valuation estimate engine.
 * Calculates an estimated price range based on make/model/year/mileage/condition.
 *
 * This uses a lookup table of base prices for common makes in Lebanon,
 * with depreciation curves based on age and mileage.
 */

/** Base MSRP values in USD for popular makes in the Lebanese market. */
const BASE_PRICES: Record<string, number> = {
  toyota: 25000,
  kia: 22000,
  hyundai: 21000,
  nissan: 23000,
  honda: 24000,
  mercedes: 45000,
  bmw: 42000,
  audi: 40000,
  volkswagen: 28000,
  ford: 26000,
  chevrolet: 24000,
  mazda: 25000,
  mitsubishi: 22000,
  suzuki: 18000,
  subaru: 28000,
  jeep: 35000,
  "land rover": 55000,
  "range rover": 65000,
  lexus: 45000,
  porsche: 75000,
  byd: 20000,
  chery: 16000,
  geely: 17000,
  mg: 18000,
  peugeot: 22000,
  renault: 20000,
  volvo: 38000,
};

/** Depreciation rate per year (percentage of value lost). */
function yearlyDepreciation(age: number): number {
  if (age <= 0) return 0;
  if (age === 1) return 0.15; // 15% first year
  if (age === 2) return 0.25; // cumulative 25% by year 2
  if (age === 3) return 0.33;
  if (age === 4) return 0.40;
  if (age === 5) return 0.46;
  if (age <= 7) return 0.46 + (age - 5) * 0.05;
  if (age <= 10) return 0.56 + (age - 7) * 0.04;
  if (age <= 15) return 0.68 + (age - 10) * 0.03;
  return Math.min(0.85, 0.83 + (age - 15) * 0.01);
}

/** Mileage adjustment factor. Average is ~15,000 km/year. */
function mileageAdjustment(mileageKm: number, age: number): number {
  if (age <= 0) return 1.0;
  const expectedMileage = age * 15000;
  const ratio = mileageKm / expectedMileage;

  if (ratio < 0.5) return 1.05; // Very low mileage premium
  if (ratio < 0.8) return 1.02;
  if (ratio <= 1.2) return 1.0; // Average range
  if (ratio <= 1.5) return 0.95;
  if (ratio <= 2.0) return 0.90;
  return 0.82; // Very high mileage
}

/** Source adjustment factor for Lebanon market. */
function sourceAdjustment(
  source: "LOCAL" | "IMPORTED_USA" | "IMPORTED_GULF" | "IMPORTED_EUROPE" | "SALVAGE_REBUILT"
): number {
  switch (source) {
    case "LOCAL":
      return 1.0;
    case "IMPORTED_USA":
      return 0.85; // USA imports typically have flood/accident risk perception
    case "IMPORTED_GULF":
      return 0.92; // Gulf imports generally well-maintained
    case "IMPORTED_EUROPE":
      return 0.95; // European imports valued well
    case "SALVAGE_REBUILT":
      return 0.60; // Significant discount for salvage
    default:
      return 1.0;
  }
}

/** Condition adjustment based on damage and accident history. */
function conditionAdjustment(params: {
  accidentHistory?: boolean;
  hasDamage?: boolean;
  serviceRecords?: "full" | "partial" | "none";
}): number {
  let factor = 1.0;

  if (params.accidentHistory) {
    factor *= 0.88;
  }
  if (params.hasDamage) {
    factor *= 0.93;
  }
  if (params.serviceRecords === "full") {
    factor *= 1.03;
  } else if (params.serviceRecords === "none") {
    factor *= 0.95;
  }

  return factor;
}

export interface ValuationInput {
  make: string;
  model?: string;
  year: number;
  mileageKm: number;
  source: "LOCAL" | "IMPORTED_USA" | "IMPORTED_GULF" | "IMPORTED_EUROPE" | "SALVAGE_REBUILT";
  accidentHistory?: boolean;
  hasDamage?: boolean;
  serviceRecords?: "full" | "partial" | "none";
}

export interface ValuationResult {
  minUsd: number;
  midUsd: number;
  maxUsd: number;
}

/**
 * Calculate an estimated valuation range for a vehicle.
 * Returns a low/mid/high price range in USD.
 */
export function estimateCarValue(input: ValuationInput): ValuationResult {
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.year;

  // Get base price from lookup table (case-insensitive)
  const makeKey = input.make.toLowerCase().trim();
  const basePrice = BASE_PRICES[makeKey] ?? 22000; // Default fallback

  // Apply depreciation based on age
  const depRate = yearlyDepreciation(age);
  const depreciatedValue = basePrice * (1 - depRate);

  // Apply mileage adjustment
  const mileageFactor = mileageAdjustment(input.mileageKm, age);

  // Apply source adjustment
  const sourceFactor = sourceAdjustment(input.source);

  // Apply condition adjustment
  const condFactor = conditionAdjustment({
    accidentHistory: input.accidentHistory,
    hasDamage: input.hasDamage,
    serviceRecords: input.serviceRecords,
  });

  // Calculate mid-point estimate
  const midEstimate = depreciatedValue * mileageFactor * sourceFactor * condFactor;

  // Create a range: -10% to +10% of mid estimate
  const minEstimate = midEstimate * 0.90;
  const maxEstimate = midEstimate * 1.10;

  // Round to nearest 100
  const round100 = (n: number) => Math.round(n / 100) * 100;

  // Ensure minimum value of $500
  return {
    minUsd: Math.max(500, round100(minEstimate)),
    midUsd: Math.max(600, round100(midEstimate)),
    maxUsd: Math.max(700, round100(maxEstimate)),
  };
}
