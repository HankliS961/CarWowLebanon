"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car } from "lucide-react";
import type { Locale } from "@/i18n/config";

interface MakeModel {
  id: number | string;
  nameEn: string;
  nameAr: string | null;
  slug: string;
}

interface MakeData {
  id: number | string;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  logoUrl?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  models: MakeModel[];
}

interface ListingsData {
  cars: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    trim: string | null;
    priceUsd: unknown;
    mileageKm: number;
    bodyType: string;
    fuelType: string;
    transmission: string;
    condition: string;
    thumbnailUrl: string | null;
    locationCity: string;
    locationRegion: string;
    isFeatured: boolean;
    isNegotiable: boolean;
    dealer: {
      id: string;
      companyName: string;
      companyNameAr: string | null;
      slug: string;
      isVerified: boolean;
    } | null;
  }>;
  total: number;
}

export function BrandHubClient({
  make,
  listings,
  locale,
}: {
  make: MakeData;
  listings: ListingsData;
  locale: string;
}) {
  const t = useTranslations("common");
  const loc = useLocale() as Locale;

  const brandName = loc === "ar" ? (make.nameAr ?? make.nameEn) : make.nameEn;
  const description = loc === "ar" ? make.descriptionAr : make.descriptionEn;

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: brandName, labelAr: brandName },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-charcoal px-4 py-12 text-white sm:py-16">
        <div className="container mx-auto max-w-7xl">
          <BreadcrumbNav
            items={breadcrumbs.map((b) => ({ ...b, label: b.label, labelAr: b.labelAr }))}
            className="mb-6 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-white"
          />
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
              {brandName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{brandName}</h1>
              {description && (
                <p className="mt-2 max-w-2xl text-base text-teal-100">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Popular models */}
        {make.models.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-charcoal">
              {loc === "ar" ? `موديلات ${brandName}` : `${brandName} Models`}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {make.models.map((model) => {
                const modelName = loc === "ar" ? (model.nameAr ?? model.nameEn) : model.nameEn;
                return (
                  <Link
                    key={model.id}
                    href={`/${make.slug}/${model.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-teal-500 group-hover:bg-teal-50">
                      <Car className="h-5 w-5" />
                    </div>
                    <span className="text-center text-sm font-medium text-foreground">
                      {modelName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Latest listings */}
        {listings.cars.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">
                {loc === "ar" ? `سيارات ${brandName} للبيع` : `${brandName} Cars for Sale`}
              </h2>
              <Link
                href={`/cars?make=${make.nameEn.toLowerCase()}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600"
              >
                {t("viewAll")}
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.cars.map((car) => (
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
                />
              ))}
            </div>
            {listings.total > 6 && (
              <div className="mt-6 text-center">
                <Button asChild variant="outline">
                  <Link href={`/cars?make=${make.nameEn.toLowerCase()}`}>
                    {loc === "ar"
                      ? `عرض جميع سيارات ${brandName} (${listings.total})`
                      : `View all ${listings.total} ${brandName} cars`}
                    <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
                  </Link>
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
