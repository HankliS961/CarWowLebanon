"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarCard } from "@/components/cars/CarCard";
import { trpc } from "@/lib/trpc/client";
import { Heart, Search, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

type SortOption = "date" | "price" | "year";

export default function SavedCarsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.savedPage");
  const td = useTranslations("dashboard");
  const [sort, setSort] = useState<SortOption>("date");

  const { data: savedCars, isLoading } = trpc.savedCars.list.useQuery();
  const utils = trpc.useUtils();

  const toggleSave = trpc.savedCars.toggle.useMutation({
    onSuccess: () => {
      utils.savedCars.list.invalidate();
    },
  });

  const sortedCars = savedCars?.slice().sort((a, b) => {
    if (sort === "price") return Number(a.car.priceUsd) - Number(b.car.priceUsd);
    if (sort === "year") return b.car.year - a.car.year;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {sortedCars && sortedCars.length > 0 && (
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t("sortDate")}</SelectItem>
              <SelectItem value="price">{t("sortPrice")}</SelectItem>
              <SelectItem value="year">{t("sortYear")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {!sortedCars?.length ? (
        <div className="mt-12 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">{td("noSavedCars")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{td("noSavedCarsSubtitle")}</p>
          <Button asChild className="mt-6">
            <Link href="/cars">
              <Search className="me-2 h-4 w-4" />
              {td("browseCars")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCars.map((saved) => (
            <div key={saved.id} className="relative">
              <CarCard
                car={{
                  id: saved.car.id,
                  make: saved.car.make,
                  model: saved.car.model,
                  year: saved.car.year,
                  trim: saved.car.trim,
                  priceUsd: Number(saved.car.priceUsd),
                  mileageKm: saved.car.mileageKm,
                  bodyType: saved.car.bodyType,
                  fuelType: saved.car.fuelType,
                  transmission: saved.car.transmission,
                  condition: saved.car.condition,
                  thumbnailUrl: saved.car.thumbnailUrl,
                  locationCity: saved.car.locationCity,
                  locationRegion: saved.car.locationRegion,
                  isFeatured: saved.car.isFeatured,
                  isNegotiable: saved.car.isNegotiable,
                  dealer: {
                    companyName: saved.car.dealer.companyName,
                    companyNameAr: saved.car.dealer.companyNameAr,
                    slug: saved.car.dealer.slug,
                    isVerified: saved.car.dealer.isVerified,
                  },
                }}
              />
              {/* Price drop badge */}
              {saved.car.originalPriceUsd &&
                Number(saved.car.originalPriceUsd) > Number(saved.car.priceUsd) && (
                  <span className="absolute start-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {t("priceDrop")}
                  </span>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
