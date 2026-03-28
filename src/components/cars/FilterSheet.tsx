"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CAR_CONDITIONS,
  CAR_SOURCES,
  REGIONS,
} from "@/lib/constants";
import type { CarFilters } from "@/types";
import type { Locale } from "@/i18n/config";

export interface FilterSheetProps {
  /** Whether the sheet is open. */
  isOpen: boolean;
  /** Callback to close the sheet. */
  onClose: () => void;
  /** Current active filter state. */
  activeFilters: CarFilters;
  /** Callback when any filter changes. */
  onFilterChange: (filters: CarFilters) => void;
  /** Number of results matching the current filters. */
  resultCount?: number;
  /** Additional CSS classes. */
  className?: string;
}

interface CheckboxGroupProps {
  title: string;
  options: ReadonlyArray<{ value: string; labelEn: string; labelAr: string }>;
  selected: string | undefined;
  onChange: (value: string | undefined) => void;
  locale: string;
}

function SheetCheckboxGroup({
  title,
  options,
  selected,
  onChange,
  locale,
}: CheckboxGroupProps) {
  return (
    <div className="border-b border-border pb-4">
      <h3 className="mb-2 text-sm font-semibold text-charcoal">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isChecked = selected === option.value;
          const label = locale === "ar" ? option.labelAr : option.labelEn;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(isChecked ? undefined : option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isChecked
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-border bg-background text-muted-foreground hover:border-teal-300"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RangeInputProps {
  title: string;
  fromValue: number | undefined;
  toValue: number | undefined;
  fromPlaceholder: string;
  toPlaceholder: string;
  onFromChange: (value: number | undefined) => void;
  onToChange: (value: number | undefined) => void;
}

function SheetRangeInput({
  title,
  fromValue,
  toValue,
  fromPlaceholder,
  toPlaceholder,
  onFromChange,
  onToChange,
}: RangeInputProps) {
  return (
    <div className="border-b border-border pb-4">
      <h3 className="mb-2 text-sm font-semibold text-charcoal">{title}</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={fromValue ?? ""}
          onChange={(e) =>
            onFromChange(e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder={fromPlaceholder}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="shrink-0 text-xs text-muted-foreground">-</span>
        <input
          type="number"
          value={toValue ?? ""}
          onChange={(e) =>
            onToChange(e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder={toPlaceholder}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function FilterSheet({
  isOpen,
  onClose,
  activeFilters,
  onFilterChange,
  resultCount,
  className,
}: FilterSheetProps) {
  const t = useTranslations("cars.filters");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const updateFilter = (
    key: keyof CarFilters,
    value: CarFilters[keyof CarFilters]
  ) => {
    onFilterChange({ ...activeFilters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== undefined && v !== ""
  );

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-2xl bg-background shadow-xl animate-slide-up",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={tc("filters")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-charcoal">
              {tc("filters")}
            </h2>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="gap-1 text-xs text-muted-foreground"
              >
                <RotateCcw size={12} />
                {tc("resetFilters")}
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={tc("close")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Price Range */}
            <SheetRangeInput
              title={t("price")}
              fromValue={activeFilters.priceFrom}
              toValue={activeFilters.priceTo}
              fromPlaceholder={t("priceFrom")}
              toPlaceholder={t("priceTo")}
              onFromChange={(v) => updateFilter("priceFrom", v)}
              onToChange={(v) => updateFilter("priceTo", v)}
            />

            {/* Condition */}
            <SheetCheckboxGroup
              title={t("condition")}
              options={CAR_CONDITIONS}
              selected={activeFilters.condition}
              onChange={(v) => updateFilter("condition", v)}
              locale={locale}
            />

            {/* Source */}
            <SheetCheckboxGroup
              title={t("source")}
              options={CAR_SOURCES}
              selected={activeFilters.source}
              onChange={(v) => updateFilter("source", v)}
              locale={locale}
            />

            {/* Body Type */}
            <SheetCheckboxGroup
              title={t("bodyType")}
              options={BODY_TYPES}
              selected={activeFilters.bodyType}
              onChange={(v) => updateFilter("bodyType", v)}
              locale={locale}
            />

            {/* Fuel Type */}
            <SheetCheckboxGroup
              title={t("fuelType")}
              options={FUEL_TYPES}
              selected={activeFilters.fuelType}
              onChange={(v) => updateFilter("fuelType", v)}
              locale={locale}
            />

            {/* Transmission */}
            <SheetCheckboxGroup
              title={t("transmission")}
              options={TRANSMISSIONS}
              selected={activeFilters.transmission}
              onChange={(v) => updateFilter("transmission", v)}
              locale={locale}
            />

            {/* Year Range */}
            <SheetRangeInput
              title={t("year")}
              fromValue={activeFilters.yearFrom}
              toValue={activeFilters.yearTo}
              fromPlaceholder={t("yearFrom")}
              toPlaceholder={t("yearTo")}
              onFromChange={(v) => updateFilter("yearFrom", v)}
              onToChange={(v) => updateFilter("yearTo", v)}
            />

            {/* Region */}
            <SheetCheckboxGroup
              title={t("region")}
              options={REGIONS}
              selected={activeFilters.region}
              onChange={(v) => updateFilter("region", v)}
              locale={locale}
            />
          </div>
        </div>

        {/* Footer with result count */}
        <div className="border-t px-4 py-3">
          <Button onClick={onClose} className="w-full" size="lg">
            {locale === "ar"
              ? `عرض ${resultCount?.toLocaleString() ?? ""} نتيجة`
              : `Show ${resultCount?.toLocaleString() ?? ""} Results`}
          </Button>
        </div>
      </div>
    </>
  );
}

export default FilterSheet;
