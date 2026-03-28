"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Car, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const BODY_TYPES = [
  { slug: "suv", labelKey: "suv", color: "from-teal-500 to-teal-700" },
  { slug: "sedan", labelKey: "sedan", color: "from-blue-500 to-blue-700" },
  { slug: "hatchback", labelKey: "hatchback", color: "from-purple-500 to-purple-700" },
  { slug: "pickup", labelKey: "pickup", color: "from-amber-500 to-amber-700" },
  { slug: "electric-cars", labelKey: "electric", color: "from-emerald-500 to-emerald-700" },
];

export function BrowseByTypeSection() {
  const t = useTranslations("home.browseByType");
  const tc = useTranslations("cars.bodyTypes");

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-8 text-2xl font-bold text-charcoal sm:text-3xl">
          {t("title")}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
          {BODY_TYPES.map((type) => (
            <Link
              key={type.slug}
              href={`/${type.slug}`}
              className={cn(
                "group relative flex h-32 items-end overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white shadow-md transition-all hover:shadow-lg sm:h-40",
                type.color
              )}
            >
              {/* Icon */}
              <div className="absolute end-3 top-3 opacity-20 transition-opacity group-hover:opacity-30">
                {type.slug === "pickup" ? (
                  <Truck className="h-16 w-16" />
                ) : type.slug === "electric-cars" ? (
                  <Zap className="h-16 w-16" />
                ) : (
                  <Car className="h-16 w-16" />
                )}
              </div>
              <span className="relative text-base font-semibold sm:text-lg">
                {tc(type.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
