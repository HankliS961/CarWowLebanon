"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { trpc } from "@/lib/trpc/client";
import { CarCard } from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { ArrowRight } from "lucide-react";

export function FeaturedCarsSection() {
  const t = useTranslations("home.featured");
  const { data, isLoading } = trpc.cars.getFeatured.useQuery({ limit: 6 });

  return (
    <section className="px-4 py-12 sm:py-16">
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

        {/* Horizontal scrollable on mobile, grid on desktop */}
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CarCardSkeleton
                  key={i}
                  className="w-72 flex-shrink-0 sm:w-auto"
                />
              ))
            : data?.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    trim: car.trim,
                    priceUsd: car.priceUsd as unknown as number,
                    mileageKm: car.mileageKm,
                    bodyType: car.bodyType,
                    fuelType: car.fuelType,
                    transmission: car.transmission,
                    condition: car.condition,
                    thumbnailUrl: car.thumbnailUrl,
                    locationCity: car.locationCity,
                    locationRegion: car.locationRegion,
                    isFeatured: car.isFeatured,
                    isNegotiable: car.isNegotiable,
                    dealer: {
                      companyName: car.dealer?.companyName ?? "",
                      companyNameAr: car.dealer?.companyNameAr ?? "",
                      slug: car.dealer?.slug ?? "",
                      isVerified: car.dealer?.isVerified ?? false,
                    },
                  }}
                  className="w-72 flex-shrink-0 sm:w-auto"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
