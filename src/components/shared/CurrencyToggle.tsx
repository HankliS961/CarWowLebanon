"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export interface CurrencyToggleProps {
  className?: string;
}

export function CurrencyToggle({ className }: CurrencyToggleProps) {
  const { currency, toggleCurrency } = useAppStore();

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      className={cn(
        "relative inline-flex h-8 w-[72px] items-center rounded-full border border-border bg-muted p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      role="switch"
      aria-checked={currency === "LBP"}
      aria-label={`Currency: ${currency}. Click to switch.`}
    >
      <span
        className={cn(
          "absolute inset-y-0.5 w-[34px] rounded-full bg-teal-500 transition-all duration-200",
          currency === "LBP" ? "inset-inline-start-[calc(100%-36px)]" : "inset-inline-start-0.5"
        )}
      />
      <span
        className={cn(
          "relative z-10 flex-1 text-center text-xs font-semibold transition-colors",
          currency === "USD" ? "text-white" : "text-muted-foreground"
        )}
      >
        USD
      </span>
      <span
        className={cn(
          "relative z-10 flex-1 text-center text-xs font-semibold transition-colors",
          currency === "LBP" ? "text-white" : "text-muted-foreground"
        )}
      >
        LBP
      </span>
    </button>
  );
}

export default CurrencyToggle;
