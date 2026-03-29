"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Car, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

const BODY_TYPES = [
  { slug: "suv", key: "SUV", labelKey: "suv", gradientFrom: "#0d9488", gradientTo: "#0f766e" },
  { slug: "sedan", key: "SEDAN", labelKey: "sedan", gradientFrom: "#3b82f6", gradientTo: "#1d4ed8" },
  { slug: "hatchback", key: "HATCHBACK", labelKey: "hatchback", gradientFrom: "#a855f7", gradientTo: "#7e22ce" },
  { slug: "pickup", key: "PICKUP", labelKey: "pickup", gradientFrom: "#f59e0b", gradientTo: "#b45309" },
  { slug: "electric-cars", key: "ELECTRIC", labelKey: "electric", gradientFrom: "#10b981", gradientTo: "#047857" },
];

export function BrowseByTypeSection() {
  const t = useTranslations("home.browseByType");
  const tc = useTranslations("cars.bodyTypes");

  const { data: siteImages } = trpc.admin.getSiteImages.useQuery(
    { category: "body_type" },
    { retry: false, staleTime: 5 * 60 * 1000 },
  );

  // Build lookup: key -> imageUrl
  const imageMap = new Map(
    (siteImages ?? []).map((img) => [img.key, img.imageUrl]),
  );

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-8 text-2xl font-bold text-charcoal sm:text-3xl">
          {t("title")}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
          {BODY_TYPES.map((type) => {
            const bgImage = imageMap.get(type.key);

            return (
              <Link
                key={type.slug}
                href={`/cars?bodyType=${type.key}`}
                className="group relative flex h-32 items-end overflow-hidden rounded-xl p-4 text-white shadow-md transition-all hover:shadow-lg sm:h-40"
                style={!bgImage ? { background: `linear-gradient(135deg, ${type.gradientFrom}, ${type.gradientTo})` } : undefined}
              >
                {/* Background image when available */}
                {bgImage && (
                  <>
                    <Image
                      src={bgImage}
                      alt={tc(type.labelKey)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 20vw"
                      unoptimized
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />
                  </>
                )}

                {/* Icon (only shown when no background image) */}
                {!bgImage && (
                  <div className="absolute end-3 top-3 opacity-20 transition-opacity group-hover:opacity-30">
                    {type.slug === "pickup" ? (
                      <Truck className="h-16 w-16" />
                    ) : type.slug === "electric-cars" ? (
                      <Zap className="h-16 w-16" />
                    ) : (
                      <Car className="h-16 w-16" />
                    )}
                  </div>
                )}

                <span className="relative text-base font-semibold sm:text-lg">
                  {tc(type.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
