"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  /** English label. */
  label: string;
  /** Arabic label. */
  labelAr: string;
  /** URL path (omit for current page / last item). */
  href?: string;
}

export interface BreadcrumbNavProps {
  /** Ordered list of breadcrumb items. Last item is the current page. */
  items: BreadcrumbItem[];
  /** Additional CSS classes. */
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const locale = useLocale();

  if (items.length === 0) return null;

  // Build JSON-LD BreadcrumbList structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: locale === "ar" ? item.labelAr : item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className={cn("flex items-center text-sm", className)}
      >
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const displayLabel =
              locale === "ar" ? item.labelAr : item.label;

            return (
              <li
                key={index}
                className="flex items-center gap-1"
              >
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-muted-foreground rtl-flip"
                    aria-hidden="true"
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    className="text-muted-foreground"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {displayLabel}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-foreground transition-colors hover:text-teal-500"
                  >
                    {displayLabel}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default BreadcrumbNav;
