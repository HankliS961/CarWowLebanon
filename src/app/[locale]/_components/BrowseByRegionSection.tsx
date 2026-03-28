"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin } from "lucide-react";
import { REGIONS } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

const REGION_SLUGS: Record<string, string> = {
  BEIRUT: "beirut",
  MOUNT_LEBANON: "mount-lebanon",
  NORTH: "north",
  SOUTH: "south",
  BEKAA: "bekaa",
  NABATIEH: "nabatieh",
};

export function BrowseByRegionSection() {
  const t = useTranslations("home.browseByRegion");
  const locale = useLocale() as Locale;

  return (
    <section className="bg-muted/50 px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-8 text-2xl font-bold text-charcoal sm:text-3xl">
          {t("title")}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:gap-6">
          {REGIONS.map((region) => {
            const slug = REGION_SLUGS[region.value];
            const label = locale === "ar" ? region.labelAr : region.labelEn;

            return (
              <Link
                key={region.value}
                href={`/cars/${slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-500 transition-colors group-hover:bg-teal-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
