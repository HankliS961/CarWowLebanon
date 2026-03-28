"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateLoan } from "@/lib/tools/calculations";
import { formatPriceUsd } from "@/lib/utils";
import type { LoanCalcResult } from "@/types/content";
import { DollarSign, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function LoanCalculatorForm() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [carPrice, setCarPrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(5000);
  const [loanTermYears, setLoanTermYears] = useState(5);
  const [interestRate, setInterestRate] = useState(9);
  const [result, setResult] = useState<LoanCalcResult | null>(null);

  const handleCalculate = () => {
    if (carPrice > downPayment) {
      setResult(calculateLoan({ carPrice, downPayment, loanTermYears, interestRate }));
    }
  };

  // Quick comparison across terms
  const comparisons = result
    ? [3, 5, 7].map((years) => {
        const r = calculateLoan({ carPrice, downPayment, loanTermYears: years, interestRate });
        return { years, monthlyPayment: r.monthlyPayment, totalInterest: r.totalInterest };
      })
    : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="carPrice">{isAr ? "سعر السيارة (USD)" : "Car Price (USD)"}</Label>
          <Input id="carPrice" type="number" min={1000} value={carPrice} onChange={(e) => setCarPrice(parseInt(e.target.value) || 0)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="downPayment">{isAr ? "الدفعة الأولى (USD)" : "Down Payment (USD)"}</Label>
          <Input id="downPayment" type="number" min={0} value={downPayment} onChange={(e) => setDownPayment(parseInt(e.target.value) || 0)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="loanTerm">{isAr ? "مدة القرض (سنوات)" : "Loan Term (Years)"}</Label>
          <select id="loanTerm" value={loanTermYears} onChange={(e) => setLoanTermYears(parseInt(e.target.value))} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {[1, 2, 3, 4, 5, 6, 7].map((y) => (
              <option key={y} value={y}>{y} {isAr ? "سنة" : y === 1 ? "year" : "years"}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="interestRate">{isAr ? "معدل الفائدة (%)" : "Interest Rate (%)"}</Label>
          <Input id="interestRate" type="number" min={0} max={30} step={0.5} value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "المعدل النموذجي في لبنان: 7-12%" : "Typical Lebanese bank rates: 7-12%"}
          </p>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full bg-teal-500 text-white hover:bg-teal-600 sm:w-auto">
        <DollarSign className="me-2 h-4 w-4" />
        {isAr ? "احسب القسط" : "Calculate Payment"}
      </Button>

      {result && (
        <div className="space-y-6 rounded-lg border bg-card p-6">
          {/* Main Result */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{isAr ? "القسط الشهري" : "Monthly Payment"}</p>
            <p className="text-4xl font-bold text-teal-500">{formatPriceUsd(result.monthlyPayment)}</p>
          </div>

          {/* Summary Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "أصل القرض" : "Principal"}</p>
              <p className="text-lg font-semibold text-charcoal">{formatPriceUsd(result.principal)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "إجمالي الفوائد" : "Total Interest"}</p>
              <p className="text-lg font-semibold text-coral">{formatPriceUsd(result.totalInterest)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{isAr ? "إجمالي المبلغ" : "Total Payment"}</p>
              <p className="text-lg font-semibold text-charcoal">{formatPriceUsd(result.totalPayment)}</p>
            </div>
          </div>

          {/* Term Comparison */}
          {comparisons.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-charcoal">{isAr ? "مقارنة المدد" : "Compare Terms"}</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {comparisons.map((c) => (
                  <div key={c.years} className={`rounded-lg border p-3 text-center ${c.years === loanTermYears ? "border-teal-500 bg-teal-50" : ""}`}>
                    <p className="text-xs text-muted-foreground">{c.years} {isAr ? "سنوات" : "years"}</p>
                    <p className="text-lg font-semibold text-charcoal">{formatPriceUsd(c.monthlyPayment)}<span className="text-xs text-muted-foreground">/{isAr ? "شهر" : "mo"}</span></p>
                    <p className="text-xs text-coral">{formatPriceUsd(c.totalInterest)} {isAr ? "فوائد" : "interest"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amortization Preview */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-charcoal">{isAr ? "جدول السداد (أول 12 شهر)" : "Amortization (First 12 Months)"}</h4>
            <div className="max-h-64 overflow-y-auto rounded-lg border">
              <table className="w-full text-sm" role="table">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2 text-start text-xs font-medium text-muted-foreground">{isAr ? "الشهر" : "Month"}</th>
                    <th className="px-3 py-2 text-end text-xs font-medium text-muted-foreground">{isAr ? "القسط" : "Payment"}</th>
                    <th className="px-3 py-2 text-end text-xs font-medium text-muted-foreground">{isAr ? "الأصل" : "Principal"}</th>
                    <th className="px-3 py-2 text-end text-xs font-medium text-muted-foreground">{isAr ? "الفائدة" : "Interest"}</th>
                    <th className="px-3 py-2 text-end text-xs font-medium text-muted-foreground">{isAr ? "الرصيد" : "Balance"}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.amortization.slice(0, 12).map((row) => (
                    <tr key={row.month} className={row.month % 2 === 0 ? "bg-muted/20" : ""}>
                      <td className="px-3 py-1.5 text-muted-foreground">{row.month}</td>
                      <td className="px-3 py-1.5 text-end">${row.payment.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-end text-teal-500">${row.principal.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-end text-coral">${row.interest.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-end font-medium">${row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanCalculatorForm;
