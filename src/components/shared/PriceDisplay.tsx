"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatPriceUsd, formatPriceLbp } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { EXCHANGE_RATE_USD_LBP } from "@/lib/constants";

export interface PriceDisplayProps {
  /** Price in USD. */
  priceUsd: number;
  /** Original price in USD (shown as strikethrough when present). */
  originalPriceUsd?: number;
  /** Explicit LBP price. If omitted, calculated from USD * exchange rate. */
  priceLbp?: number;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes. */
  className?: string;
}

const sizeMap = {
  sm: {
    primary: "text-base font-bold",
    original: "text-xs",
    secondary: "text-xs",
    badge: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    primary: "text-xl font-bold",
    original: "text-sm",
    secondary: "text-sm",
    badge: "text-xs px-2 py-0.5",
  },
  lg: {
    primary: "text-3xl font-bold",
    original: "text-base",
    secondary: "text-base",
    badge: "text-sm px-2.5 py-1",
  },
};

export function PriceDisplay({
  priceUsd,
  originalPriceUsd,
  priceLbp,
  size = "md",
  className,
}: PriceDisplayProps) {
  const { currency } = useAppStore();
  const styles = sizeMap[size];

  const savings = originalPriceUsd ? originalPriceUsd - priceUsd : 0;
  const computedLbp = priceLbp ?? priceUsd * EXCHANGE_RATE_USD_LBP;
  const originalLbp = originalPriceUsd
    ? originalPriceUsd * EXCHANGE_RATE_USD_LBP
    : undefined;

  const displayPrice =
    currency === "USD" ? formatPriceUsd(priceUsd) : formatPriceLbp(computedLbp);

  const displayOriginal =
    originalPriceUsd && currency === "USD"
      ? formatPriceUsd(originalPriceUsd)
      : originalLbp && currency === "LBP"
        ? formatPriceLbp(originalLbp)
        : null;

  const displaySavings =
    savings > 0
      ? currency === "USD"
        ? formatPriceUsd(savings)
        : formatPriceLbp(savings * EXCHANGE_RATE_USD_LBP)
      : null;

  const secondaryPrice =
    currency === "USD"
      ? `≈ ${formatPriceLbp(computedLbp)}`
      : `≈ ${formatPriceUsd(priceUsd)}`;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-baseline gap-2">
        {displayOriginal && (
          <span
            className={cn(
              styles.original,
              "text-muted-foreground line-through"
            )}
          >
            {displayOriginal}
          </span>
        )}
        <span className={cn(styles.primary, "font-mono text-charcoal")}>
          {displayPrice}
        </span>
        {displaySavings && (
          <span
            className={cn(
              styles.badge,
              "inline-flex items-center rounded-full bg-emerald/10 font-semibold text-emerald"
            )}
          >
            Save {displaySavings}
          </span>
        )}
      </div>
      <span className={cn(styles.secondary, "mt-0.5 text-muted-foreground")}>
        {secondaryPrice}
      </span>
    </div>
  );
}

export default PriceDisplay;
