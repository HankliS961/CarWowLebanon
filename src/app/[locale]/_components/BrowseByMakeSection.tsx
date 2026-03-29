"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

/** Hardcoded fallback used when the DB query is still loading or returns nothing. */
const FALLBACK_MAKES = [
  { slug: "toyota", name: "Toyota", nameAr: "\u062A\u0648\u064A\u0648\u062A\u0627" },
  { slug: "kia", name: "Kia", nameAr: "\u0643\u064A\u0627" },
  { slug: "hyundai", name: "Hyundai", nameAr: "\u0647\u064A\u0648\u0646\u062F\u0627\u064A" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", nameAr: "\u0645\u0631\u0633\u064A\u062F\u0633" },
  { slug: "bmw", name: "BMW", nameAr: "\u0628\u064A \u0625\u0645 \u062F\u0628\u0644\u064A\u0648" },
  { slug: "nissan", name: "Nissan", nameAr: "\u0646\u064A\u0633\u0627\u0646" },
  { slug: "honda", name: "Honda", nameAr: "\u0647\u0648\u0646\u062F\u0627" },
  { slug: "land-rover", name: "Land Rover", nameAr: "\u0644\u0627\u0646\u062F \u0631\u0648\u0641\u0631" },
  { slug: "byd", name: "BYD", nameAr: "\u0628\u064A \u0648\u0627\u064A \u062F\u064A" },
  { slug: "chery", name: "Chery", nameAr: "\u0634\u064A\u0631\u064A" },
];

export function BrowseByMakeSection() {
  const t = useTranslations("home.browseByMake");

  const { data: dbMakes, isLoading } = trpc.carMakes.list.useQuery(
    { popularOnly: true },
    { retry: false, staleTime: 5 * 60 * 1000 },
  );

  // Use DB data when available, otherwise show fallback
  const makes =
    dbMakes && dbMakes.length > 0
      ? dbMakes.map((m) => ({
          id: m.id,
          slug: m.slug,
          name: m.nameEn,
          nameAr: m.nameAr,
          logoUrl: m.logoUrl,
        }))
      : FALLBACK_MAKES.map((m, i) => ({
          id: i,
          slug: m.slug,
          name: m.name,
          nameAr: m.nameAr,
          logoUrl: null as string | null,
        }));

  return (
    <section className="bg-muted/50 px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal sm:text-3xl">
            {t("title")}
          </h2>
          <Link
            href="/cars"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-500 transition-colors hover:text-teal-600"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 rtl-flip" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4 shadow-sm sm:p-6"
                >
                  <div className="h-14 w-14 animate-pulse rounded-full bg-muted sm:h-16 sm:w-16" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))
            : makes.map((make) => (
                <Link
                  key={make.slug}
                  href={`/cars?make=${make.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-200 sm:p-6"
                >
                  {/* Logo or first-letter fallback */}
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-bold text-teal-600 transition-colors group-hover:bg-teal-50 sm:h-16 sm:w-16">
                    {make.logoUrl ? (
                      <Image
                        src={make.logoUrl}
                        alt={make.name}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      make.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {make.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
