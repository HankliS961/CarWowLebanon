"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateFuelCost, DEFAULT_FUEL_PRICES } from "@/lib/tools/calculations";
import { formatPriceUsd } from "@/lib/utils";
import type { FuelCalcResult } from "@/types/content";
import { Fuel, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function FuelCalculatorForm() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [consumptionKmPerL, setConsumption] = useState(12);
  const [dailyDistanceKm, setDailyDistance] = useState(40);
  const [fuelType, setFuelType] = useState<"GASOLINE_95" | "GASOLINE_98" | "DIESEL">("GASOLINE_95");
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICES.GASOLINE_95);
  const [result, setResult] = useState<FuelCalcResult | null>(null);

  const handleFuelTypeChange = (type: "GASOLINE_95" | "GASOLINE_98" | "DIESEL") => {
    setFuelType(type);
    setFuelPrice(DEFAULT_FUEL_PRICES[type]);
  };

  const handleCalculate = () => {
    setResult(calculateFuelCost({ consumptionKmPerL, dailyDistanceKm, fuelType, fuelPricePerLiter: fuelPrice }));
  };

  // Compare all fuel types
  const comparisons = result
    ? (["GASOLINE_95", "GASOLINE_98", "DIESEL"] as const).map((ft) => ({
        type: ft,
        label: ft === "GASOLINE_95" ? (isAr ? "بنزين 95" : "Gasoline 95") : ft === "GASOLINE_98" ? (isAr ? "بنزين 98" : "Gasoline 98") : (isAr ? "ديزل" : "Diesel"),
        result: calculateFuelCost({ consumptionKmPerL, dailyDistanceKm, fuelType: ft, fuelPricePerLiter: DEFAULT_FUEL_PRICES[ft] }),
      }))
    : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="consumption">{isAr ? "استهلاك الوقود (كم/لتر)" : "Fuel Consumption (km/L)"}</Label>
          <Input id="consumption" type="number" min={1} max={50} step={0.5} value={consumptionKmPerL} onChange={(e) => setConsumption(parseFloat(e.target.value) || 12)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="dailyDistance">{isAr ? "المسافة اليومية (كم)" : "Daily Distance (km)"}</Label>
          <Input id="dailyDistance" type="number" min={1} max={500} value={dailyDistanceKm} onChange={(e) => setDailyDistance(parseInt(e.target.value) || 40)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="fuelType">{isAr ? "نوع الوقود" : "Fuel Type"}</Label>
          <select id="fuelType" value={fuelType} onChange={(e) => handleFuelTypeChange(e.target.value as typeof fuelType)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="GASOLINE_95">{isAr ? "بنزين 95" : "Gasoline 95"}</option>
            <option value="GASOLINE_98">{isAr ? "بنزين 98" : "Gasoline 98"}</option>
            <option value="DIESEL">{isAr ? "ديزل" : "Diesel"}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="fuelPrice">{isAr ? "سعر اللتر (USD)" : "Fuel Price per Liter (USD)"}</Label>
          <Input id="fuelPrice" type="number" min={0.1} max={5} step={0.01} value={fuelPrice} onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0.95)} className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">{isAr ? "أسعار لبنان الحالية محدثة تلقائيا" : "Current Lebanese prices auto-populated"}</p>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full bg-teal-500 text-white hover:bg-teal-600 sm:w-auto">
        <Fuel className="me-2 h-4 w-4" />
        {isAr ? "احسب التكلفة" : "Calculate Cost"}
      </Button>

      {result && (
        <div className="space-y-6 rounded-lg border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "شهريا" : "Monthly"}</p>
              <p className="text-2xl font-bold text-teal-500">{formatPriceUsd(result.monthlyCost)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "سنويا" : "Yearly"}</p>
              <p className="text-2xl font-bold text-charcoal">{formatPriceUsd(result.yearlyCost)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "لكل كم" : "Per km"}</p>
              <p className="text-2xl font-bold text-charcoal">${result.costPerKm.toFixed(3)}</p>
            </div>
          </div>

          {/* Comparison Table */}
          {comparisons.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-charcoal">{isAr ? "مقارنة أنواع الوقود" : "Fuel Type Comparison"}</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {comparisons.map((c) => (
                  <div key={c.type} className={`rounded-lg border p-3 text-center ${c.type === fuelType ? "border-teal-500 bg-teal-50" : ""}`}>
                    <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                    <p className="text-lg font-semibold text-charcoal">{formatPriceUsd(c.result.monthlyCost)}<span className="text-xs text-muted-foreground">/{isAr ? "شهر" : "mo"}</span></p>
                    <p className="text-xs text-muted-foreground">{c.result.litersPerMonth.toFixed(0)} {isAr ? "لتر/شهر" : "L/mo"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/cars">{isAr ? "تصفح سيارات اقتصادية" : "Browse Fuel-Efficient Cars"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuelCalculatorForm;
