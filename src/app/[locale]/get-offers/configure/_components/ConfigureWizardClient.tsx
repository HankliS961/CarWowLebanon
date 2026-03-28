"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BODY_TYPES, REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

const POPULAR_MAKES = [
  "Toyota", "Kia", "Hyundai", "Mercedes-Benz", "BMW",
  "Nissan", "Honda", "Land Rover", "BYD", "Chery",
  "Volkswagen", "Audi", "Porsche", "Lexus", "Mazda",
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const PAYMENT_OPTIONS = [
  { value: "CASH", labelKey: "cash" },
  { value: "FINANCE", labelKey: "finance" },
  { value: "NOT_SURE", labelKey: "notSure" },
] as const;

interface WizardState {
  make: string;
  model: string;
  year: number | undefined;
  bodyType: string;
  trim: string;
  preferredColor: string;
  budgetMin: number | undefined;
  budgetMax: number | undefined;
  financePreference: "CASH" | "FINANCE" | "NOT_SURE";
  region: string;
  notes: string;
}

export function ConfigureWizardClient() {
  const t = useTranslations("getOffers.wizard");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<WizardState>({
    make: "",
    model: "",
    year: undefined,
    bodyType: "",
    trim: "",
    preferredColor: "",
    budgetMin: undefined,
    budgetMax: undefined,
    financePreference: "NOT_SURE",
    region: "",
    notes: "",
  });

  const update = (field: keyof WizardState, value: unknown) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const createConfig = trpc.configurations.create.useMutation({
    onSuccess: () => {
      router.push("/get-offers/dashboard");
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const steps = [
    { titleKey: "step1Title" },
    { titleKey: "step2Title" },
    { titleKey: "step3Title" },
    { titleKey: "step4Title" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return state.make !== "";
      case 1:
        return true; // All optional
      case 2:
        return state.budgetMin !== undefined && state.budgetMax !== undefined;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    createConfig.mutate({
      make: state.make || undefined,
      model: state.model || undefined,
      year: state.year,
      bodyType: state.bodyType as "SEDAN" | "SUV" | "HATCHBACK" | "PICKUP" | "COUPE" | "CONVERTIBLE" | "VAN" | "WAGON" | undefined || undefined,
      preferredColor: state.preferredColor || undefined,
      budgetMinUsd: state.budgetMin || 0,
      budgetMaxUsd: state.budgetMax || 100000,
      financePreference: state.financePreference,
      locationRegion: state.region as "BEIRUT" | "MOUNT_LEBANON" | "NORTH" | "SOUTH" | "BEKAA" | "NABATIEH" | undefined || undefined,
      notes: state.notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    i < currentStep
                      ? "bg-teal-500 text-white"
                      : i === currentStep
                        ? "bg-teal-500 text-white ring-4 ring-teal-100"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 hidden h-0.5 w-12 sm:block lg:w-20",
                      i < currentStep ? "bg-teal-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {t(steps[currentStep].titleKey)}
          </p>
        </div>

        {/* Step content */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {/* Step 1: Select car */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectMake")}</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {POPULAR_MAKES.map((make) => (
                    <button
                      key={make}
                      type="button"
                      onClick={() => update("make", make)}
                      className={cn(
                        "rounded-lg border p-3 text-center text-xs font-medium transition-all",
                        state.make === make
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "hover:border-teal-200"
                      )}
                    >
                      {make}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectModel")}</label>
                <Input
                  value={state.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder={t("selectModel")}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectYear")}</label>
                <select
                  value={state.year ?? ""}
                  onChange={(e) => update("year", e.target.value ? Number(e.target.value) : undefined)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t("selectYear")}</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectBodyType")}</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => update("bodyType", state.bodyType === type.value ? "" : type.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        state.bodyType === type.value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "hover:border-teal-200"
                      )}
                    >
                      {locale === "ar" ? type.labelAr : type.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure details */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectTrim")}</label>
                <Input
                  value={state.trim}
                  onChange={(e) => update("trim", e.target.value)}
                  placeholder={t("selectTrim")}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectColor")}</label>
                <Input
                  value={state.preferredColor}
                  onChange={(e) => update("preferredColor", e.target.value)}
                  placeholder={t("selectColor")}
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget & Location */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium">{t("budgetRange")}</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={state.budgetMin ?? ""}
                    onChange={(e) => update("budgetMin", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Min USD"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={state.budgetMax ?? ""}
                    onChange={(e) => update("budgetMax", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Max USD"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("paymentPreference")}</label>
                <div className="flex gap-3">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("financePreference", option.value)}
                      className={cn(
                        "flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-all",
                        state.financePreference === option.value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "hover:border-teal-200"
                      )}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("selectRegion")}</label>
                <select
                  value={state.region}
                  onChange={(e) => update("region", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t("selectRegion")}</option>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {locale === "ar" ? r.labelAr : r.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t("notes")}</label>
                <textarea
                  value={state.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder={t("notes")}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Step 4: Submit */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal">
                {locale === "ar" ? "مراجعة طلبك" : "Review Your Request"}
              </h3>
              <div className="w-full max-w-sm rounded-lg bg-muted/50 p-4 text-start text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{locale === "ar" ? "الشركة" : "Make"}</span>
                  <span className="font-medium">{state.make || "-"}</span>
                </div>
                {state.model && (
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">{locale === "ar" ? "الموديل" : "Model"}</span>
                    <span className="font-medium">{state.model}</span>
                  </div>
                )}
                {state.year && (
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">{locale === "ar" ? "السنة" : "Year"}</span>
                    <span className="font-medium">{state.year}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">{locale === "ar" ? "الميزانية" : "Budget"}</span>
                  <span className="font-medium">
                    ${state.budgetMin?.toLocaleString()} - ${state.budgetMax?.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("loginRequired")}
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="me-1 h-4 w-4 rtl-flip" />
            {t("previous")}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={!canProceed()}
            >
              {t("next")}
              <ChevronRight className="ms-1 h-4 w-4 rtl-flip" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {tc("loading")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
