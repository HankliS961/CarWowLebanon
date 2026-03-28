"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronDown, RotateCcw } from "lucide-react";
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
import { useLocale } from "next-intl";

export interface FilterSidebarProps {
  /** Current active filter state. */
  activeFilters: CarFilters;
  /** Callback when any filter changes. */
  onFilterChange: (filters: CarFilters) => void;
  /** Number of results matching the current filters. */
  resultCount?: number;
  /** Additional CSS classes. */
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-charcoal transition-colors hover:text-teal-500"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

interface CheckboxGroupProps {
  options: ReadonlyArray<{ value: string; labelEn: string; labelAr: string }>;
  selected: string | undefined;
  onChange: (value: string | undefined) => void;
  locale: string;
}

function CheckboxGroup({
  options,
  selected,
  onChange,
  locale,
}: CheckboxGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const isChecked = selected === option.value;
        const label =
          locale === "ar" ? option.labelAr : option.labelEn;

        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() =>
                onChange(isChecked ? undefined : option.value)
              }
              className="h-4 w-4 rounded border-border text-teal-500 focus:ring-teal-500"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

interface RangeInputProps {
  fromValue: number | undefined;
  toValue: number | undefined;
  fromPlaceholder: string;
  toPlaceholder: string;
  onFromChange: (value: number | undefined) => void;
  onToChange: (value: number | undefined) => void;
}

function RangeInput({
  fromValue,
  toValue,
  fromPlaceholder,
  toPlaceholder,
  onFromChange,
  onToChange,
}: RangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={fromValue ?? ""}
        onChange={(e) =>
          onFromChange(e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder={fromPlaceholder}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="shrink-0 text-xs text-muted-foreground">-</span>
      <input
        type="number"
        value={toValue ?? ""}
        onChange={(e) =>
          onToChange(e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder={toPlaceholder}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

export function FilterSidebar({
  activeFilters,
  onFilterChange,
  resultCount,
  className,
}: FilterSidebarProps) {
  const t = useTranslations("cars.filters");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const updateFilter = useCallback(
    (key: keyof CarFilters, value: CarFilters[keyof CarFilters]) => {
      onFilterChange({ ...activeFilters, [key]: value });
    },
    [activeFilters, onFilterChange]
  );

  const clearAll = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <aside
      className={cn(
        "sticky top-20 flex h-fit max-h-[calc(100vh-6rem)] flex-col overflow-y-auto rounded-xl border border-border bg-card p-4",
        className
      )}
      aria-label={tc("filters")}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-charcoal">
          {tc("filters")}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RotateCcw size={12} />
            {tc("resetFilters")}
          </Button>
        )}
      </div>

      {/* Result count */}
      {resultCount !== undefined && (
        <p className="mb-4 text-sm text-muted-foreground">
          {resultCount.toLocaleString()}{" "}
          {locale === "ar" ? "نتيجة" : "results"}
        </p>
      )}

      {/* Filter sections */}
      <div className="flex flex-col gap-2">
        {/* Price Range */}
        <CollapsibleSection title={t("price")}>
          <RangeInput
            fromValue={activeFilters.priceFrom}
            toValue={activeFilters.priceTo}
            fromPlaceholder={t("priceFrom")}
            toPlaceholder={t("priceTo")}
            onFromChange={(v) => updateFilter("priceFrom", v)}
            onToChange={(v) => updateFilter("priceTo", v)}
          />
        </CollapsibleSection>

        {/* Condition */}
        <CollapsibleSection title={t("condition")}>
          <CheckboxGroup
            options={CAR_CONDITIONS}
            selected={activeFilters.condition}
            onChange={(v) => updateFilter("condition", v)}
            locale={locale}
          />
        </CollapsibleSection>

        {/* Source */}
        <CollapsibleSection title={t("source")}>
          <CheckboxGroup
            options={CAR_SOURCES}
            selected={activeFilters.source}
            onChange={(v) => updateFilter("source", v)}
            locale={locale}
          />
        </CollapsibleSection>

        {/* Body Type */}
        <CollapsibleSection title={t("bodyType")}>
          <CheckboxGroup
            options={BODY_TYPES}
            selected={activeFilters.bodyType}
            onChange={(v) => updateFilter("bodyType", v)}
            locale={locale}
          />
        </CollapsibleSection>

        {/* Fuel Type */}
        <CollapsibleSection title={t("fuelType")}>
          <CheckboxGroup
            options={FUEL_TYPES}
            selected={activeFilters.fuelType}
            onChange={(v) => updateFilter("fuelType", v)}
            locale={locale}
          />
        </CollapsibleSection>

        {/* Transmission */}
        <CollapsibleSection title={t("transmission")}>
          <CheckboxGroup
            options={TRANSMISSIONS}
            selected={activeFilters.transmission}
            onChange={(v) => updateFilter("transmission", v)}
            locale={locale}
          />
        </CollapsibleSection>

        {/* Year Range */}
        <CollapsibleSection title={t("year")}>
          <RangeInput
            fromValue={activeFilters.yearFrom}
            toValue={activeFilters.yearTo}
            fromPlaceholder={t("yearFrom")}
            toPlaceholder={t("yearTo")}
            onFromChange={(v) => updateFilter("yearFrom", v)}
            onToChange={(v) => updateFilter("yearTo", v)}
          />
        </CollapsibleSection>

        {/* Region */}
        <CollapsibleSection title={t("region")} defaultOpen={false}>
          <CheckboxGroup
            options={REGIONS}
            selected={activeFilters.region}
            onChange={(v) => updateFilter("region", v)}
            locale={locale}
          />
        </CollapsibleSection>
      </div>
    </aside>
  );
}

export default FilterSidebar;
