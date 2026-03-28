/**
 * Calculation engines for CarSouk interactive tools.
 * Pure functions with no side effects — usable on both client and server.
 */

import type {
  ImportCostInput,
  ImportCostResult,
  LoanCalcInput,
  LoanCalcResult,
  FuelCalcInput,
  FuelCalcResult,
  ValuationInput,
  ValuationResult,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Import Cost Calculator
// ---------------------------------------------------------------------------

/** Lebanese customs duty rate by engine size. */
function getCustomsDutyRate(
  engineSize: ImportCostInput["engineSize"],
  fuelType: ImportCostInput["fuelType"]
): number {
  if (fuelType === "ELECTRIC") return 0.05;
  switch (engineSize) {
    case "UNDER_1500":
      return 0.15;
    case "1500_2000":
      return 0.2;
    case "2000_3000":
      return 0.35;
    case "OVER_3000":
      return 0.5;
    default:
      return 0.2;
  }
}

/** Shipping estimate by origin country (USD). */
function getShippingEstimate(origin: ImportCostInput["originCountry"], carValue: number): number {
  const baseRanges: Record<ImportCostInput["originCountry"], [number, number]> = {
    USA: [1500, 3000],
    GULF: [800, 1200],
    EUROPE: [1200, 2000],
    ASIA: [1800, 2500],
  };
  const [min, max] = baseRanges[origin];
  // Scale within range based on car value
  const ratio = Math.min(carValue / 50000, 1);
  return Math.round(min + (max - min) * ratio);
}

/** Age surcharge for cars older than 10 years. */
function getAgeSurcharge(carYear: number, carValue: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - carYear;
  if (age <= 10) return 0;
  // 2% extra per year beyond 10, up to 20%
  const extraRate = Math.min((age - 10) * 0.02, 0.2);
  return Math.round(carValue * extraRate);
}

export function calculateImportCost(input: ImportCostInput): ImportCostResult {
  const customsDutyRate = getCustomsDutyRate(input.engineSize, input.fuelType);
  const customsDuty = Math.round(input.carValueUsd * customsDutyRate);

  const salvageSurcharge =
    input.condition === "SALVAGE"
      ? Math.round(input.carValueUsd * 0.15)
      : 0;

  const ageSurcharge = getAgeSurcharge(input.carYear, input.carValueUsd);

  const vatRate = 0.11;
  const taxableBase = input.carValueUsd + customsDuty + salvageSurcharge + ageSurcharge;
  const vat = Math.round(taxableBase * vatRate);

  const registrationFee = input.condition === "NEW" ? 500 : 300;
  const inspectionFee = 150;
  const shippingEstimate = getShippingEstimate(input.originCountry, input.carValueUsd);

  const totalLandedCost =
    input.carValueUsd +
    customsDuty +
    salvageSurcharge +
    ageSurcharge +
    vat +
    registrationFee +
    inspectionFee +
    shippingEstimate;

  const breakdown = [
    { label: "Vehicle Price", labelAr: "سعر السيارة", amount: input.carValueUsd, percentage: (input.carValueUsd / totalLandedCost) * 100 },
    { label: "Customs Duty", labelAr: "الرسوم الجمركية", amount: customsDuty, percentage: (customsDuty / totalLandedCost) * 100 },
    ...(salvageSurcharge > 0
      ? [{ label: "Salvage Surcharge", labelAr: "رسوم السالفج", amount: salvageSurcharge, percentage: (salvageSurcharge / totalLandedCost) * 100 }]
      : []),
    ...(ageSurcharge > 0
      ? [{ label: "Age Surcharge", labelAr: "رسوم العمر", amount: ageSurcharge, percentage: (ageSurcharge / totalLandedCost) * 100 }]
      : []),
    { label: "VAT (11%)", labelAr: "ضريبة القيمة المضافة (11%)", amount: vat, percentage: (vat / totalLandedCost) * 100 },
    { label: "Registration Fee", labelAr: "رسوم التسجيل", amount: registrationFee, percentage: (registrationFee / totalLandedCost) * 100 },
    { label: "Inspection Fee", labelAr: "رسوم الفحص", amount: inspectionFee, percentage: (inspectionFee / totalLandedCost) * 100 },
    { label: "Shipping Estimate", labelAr: "تقدير الشحن", amount: shippingEstimate, percentage: (shippingEstimate / totalLandedCost) * 100 },
  ];

  return {
    carValue: input.carValueUsd,
    customsDuty,
    customsDutyRate,
    vat,
    vatRate,
    registrationFee,
    inspectionFee,
    shippingEstimate,
    salvageSurcharge,
    ageSurcharge,
    totalLandedCost,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Loan Calculator
// ---------------------------------------------------------------------------

export function calculateLoan(input: LoanCalcInput): LoanCalcResult {
  const principal = input.carPrice - input.downPayment;
  const monthlyRate = input.interestRate / 100 / 12;
  const termMonths = input.loanTermYears * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  // Generate amortization schedule
  const amortization: LoanCalcResult["amortization"] = [];
  let balance = principal;
  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    amortization.push({
      month,
      payment: Math.round(monthlyPayment),
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: Math.round(principal),
    amortization,
  };
}

// ---------------------------------------------------------------------------
// Fuel Cost Calculator
// ---------------------------------------------------------------------------

/** Current Lebanese fuel prices in USD per liter (approximate). */
export const DEFAULT_FUEL_PRICES: Record<FuelCalcInput["fuelType"], number> = {
  GASOLINE_95: 0.95,
  GASOLINE_98: 1.05,
  DIESEL: 0.85,
};

export function calculateFuelCost(input: FuelCalcInput): FuelCalcResult {
  const litersPerDay = input.dailyDistanceKm / input.consumptionKmPerL;
  const dailyCost = litersPerDay * input.fuelPricePerLiter;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;
  const costPerKm = input.fuelPricePerLiter / input.consumptionKmPerL;
  const litersPerMonth = litersPerDay * 30;

  return {
    dailyCost: Math.round(dailyCost * 100) / 100,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    yearlyCost: Math.round(yearlyCost * 100) / 100,
    costPerKm: Math.round(costPerKm * 1000) / 1000,
    litersPerMonth: Math.round(litersPerMonth * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Car Valuation Estimator
// ---------------------------------------------------------------------------

/**
 * Simple depreciation-based valuation model.
 * In production this would use real marketplace data.
 */

/** Base MSRP estimates by make tier (rough). */
const MAKE_TIERS: Record<string, number> = {
  toyota: 30000,
  honda: 28000,
  hyundai: 25000,
  kia: 24000,
  nissan: 27000,
  mitsubishi: 26000,
  mg: 20000,
  chery: 18000,
  bmw: 50000,
  mercedes: 55000,
  audi: 48000,
  lexus: 45000,
  porsche: 80000,
  "land rover": 65000,
};

function getBaseMsrp(make: string): number {
  return MAKE_TIERS[make.toLowerCase()] || 28000;
}

/** Annual depreciation curve (percentage of original value remaining). */
function getDepreciationFactor(yearsOld: number): number {
  // Aggressive first-year, then gradual
  if (yearsOld <= 0) return 1.0;
  if (yearsOld === 1) return 0.8;
  if (yearsOld === 2) return 0.72;
  if (yearsOld === 3) return 0.65;
  if (yearsOld === 4) return 0.58;
  if (yearsOld === 5) return 0.52;
  // After 5 years: ~5% per year
  return Math.max(0.15, 0.52 - (yearsOld - 5) * 0.05);
}

function conditionMultiplier(
  condition: ValuationInput["condition"]
): number {
  switch (condition) {
    case "EXCELLENT":
      return 1.1;
    case "GOOD":
      return 1.0;
    case "FAIR":
      return 0.85;
    case "POOR":
      return 0.7;
  }
}

function sourceMultiplier(source: ValuationInput["source"]): number {
  switch (source) {
    case "LOCAL":
      return 1.0;
    case "IMPORTED":
      return 0.95;
    case "SALVAGE":
      return 0.65;
  }
}

function mileageAdjustment(mileageKm: number, yearsOld: number): number {
  const expectedMileage = yearsOld * 15000; // 15k km/year average
  const diff = mileageKm - expectedMileage;
  // +/- 2% per 10,000 km above/below expected
  return 1 - (diff / 10000) * 0.02;
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const currentYear = new Date().getFullYear();
  const yearsOld = currentYear - input.year;
  const baseMsrp = getBaseMsrp(input.make);

  const depreciatedValue = baseMsrp * getDepreciationFactor(yearsOld);
  const adjusted =
    depreciatedValue *
    conditionMultiplier(input.condition) *
    sourceMultiplier(input.source) *
    mileageAdjustment(input.mileageKm, yearsOld);

  const mid = Math.round(Math.max(adjusted, 1500));
  const low = Math.round(mid * 0.85);
  const high = Math.round(mid * 1.15);

  // Confidence based on how much data we have (simulated)
  const confidence: ValuationResult["confidence"] =
    yearsOld <= 8 ? "HIGH" : yearsOld <= 15 ? "MEDIUM" : "LOW";

  // Trend (simplified — newer popular models trend up)
  const trend: ValuationResult["trend"] =
    yearsOld <= 3 ? "STABLE" : yearsOld <= 7 ? "DOWN" : "DOWN";

  return {
    estimatedLow: low,
    estimatedMid: mid,
    estimatedHigh: high,
    confidence,
    trend,
    similarCount: Math.floor(Math.random() * 30) + 5,
  };
}
