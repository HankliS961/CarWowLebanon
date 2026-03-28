"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateValuation } from "@/lib/tools/calculations";
import { formatPriceUsd } from "@/lib/utils";
import type { ValuationResult } from "@/types/content";
import { Tag, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function ValuationForm() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Corolla");
  const [year, setYear] = useState(2020);
  const [mileageKm, setMileageKm] = useState(60000);
  const [condition, setCondition] = useState<"EXCELLENT" | "GOOD" | "FAIR" | "POOR">("GOOD");
  const [source, setSource] = useState<"LOCAL" | "IMPORTED" | "SALVAGE">("LOCAL");
  const [result, setResult] = useState<ValuationResult | null>(null);

  const handleCalculate = () => {
    setResult(calculateValuation({ make, model, year, mileageKm, condition, source }));
  };

  const TrendIcon = result?.trend === "UP" ? TrendingUp : result?.trend === "DOWN" ? TrendingDown : Minus;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="make">{isAr ? "الماركة" : "Make"}</Label>
          <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} className="mt-1" placeholder="e.g. Toyota" />
        </div>
        <div>
          <Label htmlFor="model">{isAr ? "الموديل" : "Model"}</Label>
          <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1" placeholder="e.g. Corolla" />
        </div>
        <div>
          <Label htmlFor="year">{isAr ? "سنة الصنع" : "Year"}</Label>
          <Input id="year" type="number" min={1990} max={2030} value={year} onChange={(e) => setYear(parseInt(e.target.value) || 2020)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="mileage">{isAr ? "الكيلومتراج" : "Mileage (km)"}</Label>
          <Input id="mileage" type="number" min={0} value={mileageKm} onChange={(e) => setMileageKm(parseInt(e.target.value) || 0)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="condition">{isAr ? "الحالة" : "Condition"}</Label>
          <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="EXCELLENT">{isAr ? "ممتازة" : "Excellent"}</option>
            <option value="GOOD">{isAr ? "جيدة" : "Good"}</option>
            <option value="FAIR">{isAr ? "مقبولة" : "Fair"}</option>
            <option value="POOR">{isAr ? "ضعيفة" : "Poor"}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="source">{isAr ? "المصدر" : "Source"}</Label>
          <select id="source" value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="LOCAL">{isAr ? "محلية" : "Local"}</option>
            <option value="IMPORTED">{isAr ? "مستوردة" : "Imported"}</option>
            <option value="SALVAGE">{isAr ? "سالفج" : "Salvage"}</option>
          </select>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full bg-teal-500 text-white hover:bg-teal-600 sm:w-auto">
        <Tag className="me-2 h-4 w-4" />
        {isAr ? "قيّم سيارتي" : "Estimate Value"}
      </Button>

      {result && (
        <div className="space-y-6 rounded-lg border bg-card p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{isAr ? "القيمة السوقية المقدرة" : "Estimated Market Value"}</p>
            <p className="mt-1 text-4xl font-bold text-teal-500">{formatPriceUsd(result.estimatedMid)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatPriceUsd(result.estimatedLow)} — {formatPriceUsd(result.estimatedHigh)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant={result.confidence === "HIGH" ? "default" : "secondary"} className={result.confidence === "HIGH" ? "bg-emerald text-white" : ""}>
              {isAr ? `ثقة ${result.confidence === "HIGH" ? "عالية" : result.confidence === "MEDIUM" ? "متوسطة" : "منخفضة"}` : `${result.confidence} Confidence`}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendIcon className="h-3.5 w-3.5" />
              {isAr ? (result.trend === "UP" ? "صاعد" : result.trend === "DOWN" ? "هابط" : "مستقر") : result.trend}
            </Badge>
            <Badge variant="outline">
              {isAr ? `بناء على ${result.similarCount} سيارة مشابهة` : `Based on ${result.similarCount} similar cars`}
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/sell-my-car">{isAr ? "بيع سيارتي" : "List Your Car"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
            </Button>
            <Button asChild size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
              <Link href="/cars">{isAr ? "تصفح سيارات مشابهة" : "Browse Similar Cars"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValuationForm;
