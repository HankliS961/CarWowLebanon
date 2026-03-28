"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

const POPULAR_MAKES = [
  { slug: "toyota", name: "Toyota", nameAr: "تويوتا" },
  { slug: "kia", name: "Kia", nameAr: "كيا" },
  { slug: "hyundai", name: "Hyundai", nameAr: "هيونداي" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", nameAr: "مرسيدس" },
  { slug: "bmw", name: "BMW", nameAr: "بي إم دبليو" },
  { slug: "nissan", name: "Nissan", nameAr: "نيسان" },
  { slug: "honda", name: "Honda", nameAr: "هوندا" },
  { slug: "land-rover", name: "Land Rover", nameAr: "لاند روفر" },
  { slug: "byd", name: "BYD", nameAr: "بي واي دي" },
  { slug: "chery", name: "Chery", nameAr: "شيري" },
];

export function BrowseByMakeSection() {
  const t = useTranslations("home.browseByMake");

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
          {POPULAR_MAKES.map((make) => (
            <Link
              key={make.slug}
              href={`/${make.slug}`}
              className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-200 sm:p-6"
            >
              {/* Logo placeholder circle */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-teal-600 transition-colors group-hover:bg-teal-50 sm:h-16 sm:w-16">
                {make.name.charAt(0)}
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
