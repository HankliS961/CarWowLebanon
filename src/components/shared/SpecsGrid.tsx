"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatMileage } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Gauge,
  Fuel,
  Cog,
  Zap,
  Car,
  CircleDot,
} from "lucide-react";

export interface SpecsData {
  transmission?: string;
  fuelType?: string;
  mileageKm?: number;
  horsepower?: number;
  engineSize?: string;
  drivetrain?: string;
}

export interface SpecsGridProps {
  /** Vehicle specifications data. */
  specs: SpecsData;
  /** Layout variant. */
  variant?: "compact" | "expanded";
  /** Additional CSS classes. */
  className?: string;
}

interface SpecItem {
  icon: React.ElementType;
  value: string;
  labelKey: string;
  fallbackLabel: string;
}

export function SpecsGrid({
  specs,
  variant = "compact",
  className,
}: SpecsGridProps) {
  const t = useTranslations("cars.detail");

  const items: SpecItem[] = [];

  if (specs.transmission) {
    items.push({
      icon: Cog,
      value: specs.transmission,
      labelKey: "transmission",
      fallbackLabel: "Transmission",
    });
  }
  if (specs.fuelType) {
    items.push({
      icon: Fuel,
      value: specs.fuelType,
      labelKey: "fuel",
      fallbackLabel: "Fuel",
    });
  }
  if (specs.mileageKm !== undefined) {
    items.push({
      icon: Gauge,
      value: formatMileage(specs.mileageKm),
      labelKey: "mileage",
      fallbackLabel: "Mileage",
    });
  }
  if (specs.horsepower) {
    items.push({
      icon: Zap,
      value: `${specs.horsepower} hp`,
      labelKey: "horsepower",
      fallbackLabel: "Power",
    });
  }
  if (specs.engineSize) {
    items.push({
      icon: CircleDot,
      value: specs.engineSize,
      labelKey: "engine",
      fallbackLabel: "Engine",
    });
  }
  if (specs.drivetrain) {
    items.push({
      icon: Car,
      value: specs.drivetrain,
      labelKey: "drivetrain",
      fallbackLabel: "Drivetrain",
    });
  }

  if (items.length === 0) return null;

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "grid gap-3",
        isCompact
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
      role="list"
      aria-label="Vehicle specifications"
    >
      {items.map((item) => {
        const Icon = item.icon;
        let label: string;
        try {
          label = t(item.labelKey);
        } catch {
          label = item.fallbackLabel;
        }

        return (
          <div
            key={item.labelKey}
            className={cn(
              "flex items-center gap-2 rounded-lg",
              isCompact ? "gap-1.5" : "bg-muted/50 p-3"
            )}
            role="listitem"
          >
            <Icon
              size={isCompact ? 14 : 18}
              className="shrink-0 text-teal-500"
              aria-hidden="true"
            />
            <div className={cn("flex flex-col", isCompact && "gap-0")}>
              <span
                className={cn(
                  "font-medium text-charcoal",
                  isCompact ? "text-xs" : "text-sm"
                )}
              >
                {item.value}
              </span>
              {!isCompact && (
                <span className="text-xs text-muted-foreground">{label}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SpecsGrid;
