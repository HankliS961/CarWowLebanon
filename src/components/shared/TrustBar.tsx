"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import type { LucideIcon } from "lucide-react";

export interface TrustStat {
  /** Lucide icon component to display. */
  icon: LucideIcon;
  /** The stat value (e.g. "200+", "5,000+"). */
  value: string;
  /** English label. */
  label: string;
  /** Arabic label. */
  labelAr: string;
}

export interface TrustBarProps {
  /** Array of trust statistics to display. */
  stats: TrustStat[];
  /** Additional CSS classes. */
  className?: string;
}

export function TrustBar({ stats, className }: TrustBarProps) {
  const locale = useLocale();

  return (
    <section
      className={cn(
        "w-full rounded-xl bg-soft-sky/60 px-4 py-6 sm:px-6 md:py-8",
        className
      )}
      aria-label="Platform statistics"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:justify-between">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const displayLabel = locale === "ar" ? stat.labelAr : stat.label;

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <Icon
                size={28}
                className="text-teal-500"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold font-mono text-charcoal">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">
                {displayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBar;
