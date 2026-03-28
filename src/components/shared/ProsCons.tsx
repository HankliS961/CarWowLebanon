"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface ProsConsProps {
  /** List of pros/advantages. */
  pros: string[];
  /** List of cons/disadvantages. */
  cons: string[];
  /** Additional CSS classes. */
  className?: string;
}

export function ProsCons({ pros, cons, className }: ProsConsProps) {
  const t = useTranslations("reviews");

  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-2",
        className
      )}
    >
      {/* Pros */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald">
          <Check size={16} className="shrink-0" aria-hidden="true" />
          {t("pros")}
        </h4>
        <ul className="flex flex-col gap-2" role="list">
          {pros.map((pro, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <Check
                size={14}
                className="mt-0.5 shrink-0 text-emerald"
                aria-hidden="true"
              />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-coral">
          <X size={16} className="shrink-0" aria-hidden="true" />
          {t("cons")}
        </h4>
        <ul className="flex flex-col gap-2" role="list">
          {cons.map((con, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <X
                size={14}
                className="mt-0.5 shrink-0 text-coral"
                aria-hidden="true"
              />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProsCons;
