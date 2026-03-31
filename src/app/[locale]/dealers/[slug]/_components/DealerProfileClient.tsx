"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { CarCard } from "@/components/cars/CarCard";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Star,
  MapPin,
  ShieldCheck,
  Phone,
  Globe,
  Instagram,
  Clock,
  Car,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

interface DealerData {
  id: string;
  companyName: string;
  companyNameAr: string | null;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  address: string | null;
  region: string;
  city: string;
  phone: string | null;
  whatsappNumber: string | null;
  whatsappGreeting: string | null;
  email: string | null;
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  workingHours: unknown;
  brandsCarried: unknown;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAvg: unknown;
  reviewCount: number;
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
  }>;
  reviews: Array<{
    id: string;
    ratingOverall: number;
    title: string | null;
    body: string | null;
    createdAt: Date;
    buyer: { name: string | null; image: string | null };
  }>;
  _count: { cars: number };
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getLocationUrl(dealer: DealerData): string | null {
  if (dealer.googleMapsUrl) return dealer.googleMapsUrl;
  if (dealer.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address + ", " + dealer.city + ", Lebanon")}`;
  }
  return null;
}

export function DealerProfileClient({
  dealer,
  locale,
}: {
  dealer: DealerData;
  locale: string;
}) {
  const t = useTranslations("dealers");
  const tc = useTranslations("common");
  const loc = useLocale() as Locale;
  const reviewsRef = useRef<HTMLDivElement>(null);

  const name = loc === "ar" ? (dealer.companyNameAr || dealer.companyName) : dealer.companyName;
  const description = loc === "ar" ? dealer.descriptionAr : dealer.descriptionEn;
  const rating = Number(dealer.ratingAvg) || 0;
  const brands = (dealer.brandsCarried as string[] | null) || [];
  const locationUrl = getLocationUrl(dealer);
  const wh = (dealer.workingHours as Record<string, { open: string; close: string }> | null) ?? {};

  const sortedCars = [...dealer.cars].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Cover + Profile */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-br from-teal-600 to-charcoal sm:h-56">
          {dealer.coverImageUrl && (
            <Image
              src={dealer.coverImageUrl}
              alt={name}
              fill
              className="object-cover opacity-70"
              sizes="100vw"
            />
          )}
        </div>

        {/* Profile overlay */}
        <div className="container mx-auto max-w-7xl px-4">
          <div className="relative -mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Logo */}
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border-4 border-background bg-background shadow-md sm:h-28 sm:w-28">
              {dealer.logoUrl ? (
                <Image
                  src={dealer.logoUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-muted-foreground">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-charcoal sm:text-3xl">{name}</h1>
                {dealer.isVerified && (
                  <ShieldCheck className="h-5 w-5 text-teal-500" aria-label={t("verified")} />
                )}
                {dealer.isFeatured && (
                  <Badge className="bg-amber-500 text-white">{t("featured")}</Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="inline-flex items-center gap-1 transition-colors hover:text-teal-500"
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-charcoal">{rating.toFixed(1)}</span>
                  ({dealer.reviewCount} {t("reviews")})
                </button>
                {locationUrl ? (
                  <a
                    href={locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-teal-500"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {dealer.city}, {dealer.region}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {dealer.city}, {dealer.region}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" />
                  {dealer._count.cars} {t("carsInStock")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col gap-8 pt-6 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {/* Contact buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              {dealer.whatsappNumber && (
                <WhatsAppButton
                  phoneNumber={dealer.whatsappNumber}
                  message={dealer.whatsappGreeting || (loc === "ar" ? "مرحباً، أتصفح معرضكم على CarSouk." : "Hi, I'm browsing your inventory on CarSouk.")}
                  size="md"
                />
              )}
              {dealer.phone && (
                <Button asChild variant="outline" className="gap-1.5">
                  <a href={`tel:${dealer.phone}`}>
                    <Phone className="h-4 w-4" />
                    {tc("call")}
                  </a>
                </Button>
              )}
              {dealer.websiteUrl && (
                <Button asChild variant="outline" className="gap-1.5">
                  <a href={dealer.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    {loc === "ar" ? "الموقع" : "Website"}
                  </a>
                </Button>
              )}
              {dealer.instagramUrl && (
                <Button asChild variant="outline" className="gap-1.5">
                  <a href={dealer.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mb-6">
                <p className="text-sm leading-relaxed text-foreground">{description}</p>
              </div>
            )}

            {/* Brands carried */}
            {brands.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-charcoal">
                  {loc === "ar" ? "الشركات المتوفرة" : "Brands Carried"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <Badge key={brand} variant="outline">{brand}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory heading */}
            <div className="mb-6 border-b pb-3">
              <span className="relative text-sm font-medium text-teal-500">
                {loc === "ar"
                  ? `المعروض (${dealer._count.cars})`
                  : `Inventory (${dealer._count.cars})`}
                <span className="absolute inset-x-0 bottom-[-13px] h-0.5 bg-teal-500" />
              </span>
            </div>

            {/* Inventory content */}
            {sortedCars.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={{
                      ...car,
                      priceUsd: car.priceUsd as unknown as number,
                      dealer: {
                        companyName: dealer.companyName,
                        companyNameAr: dealer.companyNameAr ?? "",
                        slug: dealer.slug,
                        isVerified: dealer.isVerified,
                      },
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {loc === "ar" ? "لا توجد سيارات متاحة حالياً" : "No cars currently available"}
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 lg:w-72">
            <div className="sticky top-20 rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-charcoal">
                {loc === "ar" ? "معلومات التواصل" : "Contact Info"}
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                {dealer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    {locationUrl ? (
                      <a
                        href={locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:underline"
                      >
                        {dealer.address}
                      </a>
                    ) : (
                      <span>{dealer.address}</span>
                    )}
                  </div>
                )}
                {dealer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${dealer.phone}`} className="text-teal-500 hover:underline" dir="ltr">
                      {dealer.phone}
                    </a>
                  </div>
                )}
                {dealer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">@</span>
                    <a href={`mailto:${dealer.email}`} className="text-teal-500 hover:underline">
                      {dealer.email}
                    </a>
                  </div>
                )}
              </div>
              {Object.keys(wh).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="mb-3 text-sm font-semibold text-charcoal">
                    {loc === "ar" ? "ساعات العمل" : "Working Hours"}
                  </h3>
                  <div className="flex flex-col gap-1.5 text-sm">
                    {DAYS_OF_WEEK.map((day) => {
                      const hours = wh[day];
                      const isClosed = !hours?.open && !hours?.close;
                      return (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className={isClosed ? "text-muted-foreground" : "font-medium"}>
                            {isClosed ? (loc === "ar" ? "مغلق" : "Closed") : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Reviews Section */}
      <div ref={reviewsRef} id="reviews" className="container mx-auto max-w-7xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-bold">
          {loc === "ar" ? "التقييمات" : "Reviews"} ({dealer.reviewCount})
        </h2>
        {dealer.reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dealer.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {review.buyer.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{review.buyer.name || "Anonymous"}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < review.ratingOverall
                              ? "fill-amber-400 text-amber-400"
                              : "fill-neutral-200 text-neutral-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.title && (
                  <h4 className="mt-2 text-sm font-semibold">{review.title}</h4>
                )}
                {review.body && (
                  <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {loc === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}
          </p>
        )}
      </div>
    </div>
  );
}
