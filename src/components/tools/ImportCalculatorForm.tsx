"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateImportCost } from "@/lib/tools/calculations";
import { formatPriceUsd } from "@/lib/utils";
import type { ImportCostInput, ImportCostResult } from "@/types/content";
import { Calculator, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function ImportCalculatorForm() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [form, setForm] = useState<ImportCostInput>({
    originCountry: "USA",
    carValueUsd: 25000,
    carYear: 2022,
    engineSize: "1500_2000",
    fuelType: "GASOLINE",
    condition: "USED",
  });
  const [result, setResult] = useState<ImportCostResult | null>(null);

  const handleCalculate = () => {
    setResult(calculateImportCost(form));
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="originCountry">{isAr ? "بلد المنشأ" : "Origin Country"}</Label>
          <select
            id="originCountry"
            value={form.originCountry}
            onChange={(e) => setForm({ ...form, originCountry: e.target.value as ImportCostInput["originCountry"] })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="USA">{isAr ? "الولايات المتحدة" : "USA"}</option>
            <option value="GULF">{isAr ? "الخليج (الإمارات/السعودية/الكويت)" : "Gulf (UAE/KSA/Kuwait)"}</option>
            <option value="EUROPE">{isAr ? "أوروبا" : "Europe"}</option>
            <option value="ASIA">{isAr ? "آسيا" : "Asia"}</option>
          </select>
        </div>

        <div>
          <Label htmlFor="carValue">{isAr ? "قيمة السيارة (USD)" : "Car Value (USD)"}</Label>
          <Input
            id="carValue"
            type="number"
            min={1000}
            value={form.carValueUsd}
            onChange={(e) => setForm({ ...form, carValueUsd: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="carYear">{isAr ? "سنة الصنع" : "Car Year"}</Label>
          <Input
            id="carYear"
            type="number"
            min={1990}
            max={2030}
            value={form.carYear}
            onChange={(e) => setForm({ ...form, carYear: parseInt(e.target.value) || 2022 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="engineSize">{isAr ? "حجم المحرك" : "Engine Size"}</Label>
          <select
            id="engineSize"
            value={form.engineSize}
            onChange={(e) => setForm({ ...form, engineSize: e.target.value as ImportCostInput["engineSize"] })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="UNDER_1500">{isAr ? "أقل من 1.5 لتر" : "< 1.5L"}</option>
            <option value="1500_2000">1.5 - 2.0L</option>
            <option value="2000_3000">2.0 - 3.0L</option>
            <option value="OVER_3000">{isAr ? "أكثر من 3.0 لتر" : "3.0L+"}</option>
          </select>
        </div>

        <div>
          <Label htmlFor="fuelType">{isAr ? "نوع الوقود" : "Fuel Type"}</Label>
          <select
            id="fuelType"
            value={form.fuelType}
            onChange={(e) => setForm({ ...form, fuelType: e.target.value as ImportCostInput["fuelType"] })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="GASOLINE">{isAr ? "بنزين" : "Gasoline"}</option>
            <option value="DIESEL">{isAr ? "ديزل" : "Diesel"}</option>
            <option value="HYBRID">{isAr ? "هايبرد" : "Hybrid"}</option>
            <option value="ELECTRIC">{isAr ? "كهربائية" : "Electric"}</option>
          </select>
        </div>

        <div>
          <Label htmlFor="condition">{isAr ? "الحالة" : "Condition"}</Label>
          <select
            id="condition"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value as ImportCostInput["condition"] })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="NEW">{isAr ? "جديدة" : "New"}</option>
            <option value="USED">{isAr ? "مستعملة" : "Used"}</option>
            <option value="SALVAGE">{isAr ? "سالفج" : "Salvage"}</option>
          </select>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full bg-teal-500 text-white hover:bg-teal-600 sm:w-auto">
        <Calculator className="me-2 h-4 w-4" />
        {isAr ? "احسب التكلفة" : "Calculate Cost"}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-6 rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold text-charcoal">
            {isAr ? "تفاصيل التكلفة" : "Cost Breakdown"}
          </h3>

          {/* Breakdown Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full" role="table">
              <tbody>
                {result.breakdown.map((item, index) => (
                  <tr key={item.label} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {isAr ? item.labelAr : item.label}
                    </td>
                    <td className="px-4 py-2.5 text-end text-sm font-medium text-foreground">
                      {formatPriceUsd(item.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-end text-xs text-muted-foreground w-20">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-teal-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-charcoal">
                    {isAr ? "التكلفة الإجمالية" : "Total Landed Cost"}
                  </td>
                  <td className="px-4 py-3 text-end text-lg font-bold text-teal-500" colSpan={2}>
                    {formatPriceUsd(result.totalLandedCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Visual Breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
              {isAr ? "توزيع التكلفة" : "Cost Composition"}
            </h4>
            <div className="flex h-6 overflow-hidden rounded-full">
              {result.breakdown.map((item, index) => {
                const colors = [
                  "bg-teal-500",
                  "bg-amber-500",
                  "bg-coral",
                  "bg-blue-500",
                  "bg-emerald",
                  "bg-purple-500",
                  "bg-orange-500",
                  "bg-pink-500",
                ];
                return (
                  <div
                    key={item.label}
                    className={`${colors[index % colors.length]} transition-all`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${isAr ? item.labelAr : item.label}: ${formatPriceUsd(item.amount)}`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {result.breakdown.map((item, index) => {
                const colors = [
                  "bg-teal-500",
                  "bg-amber-500",
                  "bg-coral",
                  "bg-blue-500",
                  "bg-emerald",
                  "bg-purple-500",
                  "bg-orange-500",
                  "bg-pink-500",
                ];
                return (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs">
                    <span className={`h-2.5 w-2.5 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-muted-foreground">{isAr ? item.labelAr : item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-lg bg-teal-50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr ? "ابحث عن سيارات مشابهة على كارسوق" : "Search similar cars on CarSouk"}
            </p>
            <Button asChild size="sm" className="mt-2 bg-teal-500 text-white hover:bg-teal-600">
              <Link href="/cars">
                {isAr ? "تصفح السيارات" : "Browse Cars"}
                <ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportCalculatorForm;
