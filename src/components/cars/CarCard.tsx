"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { cn } from "@/lib/utils";
import { formatMileage } from "@/lib/utils";
import type { CarCardData } from "@/types";
import { Fuel, Gauge, Calendar, Settings2, MapPin, ShieldCheck } from "lucide-react";
import { SaveCarButton } from "@/components/cars/SaveCarButton";
import type { Locale } from "@/i18n/config";

export interface CarCardProps {
  car: CarCardData;
  className?: string;
  /** Render as a compact horizontal card on mobile. */
  variant?: "grid" | "horizontal";
}

export function CarCard({ car, className, variant = "grid" }: CarCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("cars.card");
  const tc = useTranslations("common");

  const dealerName = locale === "ar" ? car.dealer.companyNameAr : car.dealer.companyName;
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`;
  const detailHref = `/cars/${car.make.toLowerCase()}/${car.model.toLowerCase()}/${car.id}`;

  if (variant === "horizontal") {
    return (
      <Link
        href={detailHref}
        className={cn(
          "group flex overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md",
          className
        )}
      >
        {/* Image */}
        <div className="relative h-32 w-36 flex-shrink-0 sm:h-40 sm:w-48">
          <Image
            src={car.thumbnailUrl || "/images/car-placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 144px, 192px"
          />
          {car.isFeatured && (
            <Badge className="absolute start-2 top-2 bg-amber-500 text-white">
              {tc("featured")}
            </Badge>
          )}
          <SaveCarButton carId={car.id} variant="overlay" />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
              {title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {formatMileage(car.mileageKm)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                {car.fuelType}
              </span>
              <span className="inline-flex items-center gap-1">
                <Settings2 className="h-3 w-3" />
                {car.transmission}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <PriceDisplay priceUsd={car.priceUsd} size="sm" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={car.thumbnailUrl || "/images/car-placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Badges overlay */}
        <div className="absolute start-2 top-2 flex flex-col gap-1">
          {car.isFeatured && (
            <Badge className="bg-amber-500 text-white">{tc("featured")}</Badge>
          )}
          {car.condition === "NEW" && (
            <Badge className="bg-emerald text-white">{tc("new")}</Badge>
          )}
          {car.isNegotiable && (
            <Badge variant="secondary">{tc("negotiable")}</Badge>
          )}
        </div>
        {/* Save button */}
        <SaveCarButton carId={car.id} variant="overlay" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="line-clamp-1 text-base font-semibold text-foreground">
          {title}
        </h3>

        {/* Specs row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {car.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {formatMileage(car.mileageKm)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {car.fuelType}
          </span>
          <span className="inline-flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {car.transmission}
          </span>
        </div>

        {/* Dealer info */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          {car.dealer.isVerified && (
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
          )}
          <span className="line-clamp-1">{dealerName}</span>
          <span className="mx-0.5">-</span>
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{car.locationCity}</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3">
          <PriceDisplay priceUsd={car.priceUsd} size="md" />
        </div>
      </div>
    </Link>
  );
}

export default CarCard;
