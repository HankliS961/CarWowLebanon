"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { SpecsGrid } from "@/components/shared/SpecsGrid";
import { StickyContactSidebar } from "@/components/cars/StickyContactSidebar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceUsd, formatMileage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Check,
  AlertTriangle,
  ShieldCheck,
  Flag,
  Share2,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

// Type matches the return of trpc cars.getById
interface CarDetailData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  condition: string;
  source: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  mileageKm: number;
  priceUsd: unknown; // Prisma Decimal
  originalPriceUsd: unknown;
  thumbnailUrl: string | null;
  images: unknown; // JSON
  descriptionEn: string | null;
  descriptionAr: string | null;
  features: unknown; // JSON
  colorExterior: string | null;
  colorInterior: string | null;
  engineSize: string | null;
  horsepower: number | null;
  drivetrain: string | null;
  customsPaid: boolean | null;
  accidentHistory: boolean | null;
  isNegotiable: boolean;
  locationCity: string;
  locationRegion: string;
  dealer: {
    id: string;
    companyName: string;
    companyNameAr: string | null;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    ratingAvg: unknown;
    reviewCount: number;
    phone: string | null;
    whatsappNumber: string | null;
    city: string;
    region: string;
  } | null;
}

export function CarDetailClient({
  car,
  locale,
}: {
  car: CarDetailData;
  locale: string;
}) {
  const t = useTranslations("cars.detail");
  const tc = useTranslations("common");
  const loc = useLocale() as Locale;

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = (car.images as string[] | null) || [];
  const allImages = images.length > 0 ? images : car.thumbnailUrl ? [car.thumbnailUrl] : [];
  const price = car.priceUsd as unknown as number;
  const originalPrice = car.originalPriceUsd as unknown as number | null;
  const features = (car.features as string[] | null) || [];
  const description = loc === "ar" ? car.descriptionAr : car.descriptionEn;
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`;

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Cars", labelAr: "سيارات", href: "/cars" },
    { label: car.make, labelAr: car.make, href: `/${car.make.toLowerCase()}` },
    { label: car.model, labelAr: car.model, href: `/${car.make.toLowerCase()}/${car.model.toLowerCase()}` },
    { label: title, labelAr: title },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4">
        <BreadcrumbNav items={breadcrumbs} className="py-3" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Gallery + Content */}
          <div className="flex-1">
            {/* Image gallery */}
            <div className="overflow-hidden rounded-xl">
              {/* Main image */}
              <div
                className="relative aspect-[16/10] w-full cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                {allImages.length > 0 ? (
                  <Image
                    src={allImages[galleryIndex]}
                    alt={`${title} - Photo ${galleryIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    No photos
                  </div>
                )}

                {/* Condition badges */}
                <div className="absolute start-3 top-3 flex gap-2">
                  {car.condition === "NEW" && (
                    <Badge className="bg-emerald text-white">{tc("new")}</Badge>
                  )}
                  {car.isNegotiable && (
                    <Badge variant="secondary">{tc("negotiable")}</Badge>
                  )}
                </div>

                {/* Image counter */}
                {allImages.length > 1 && (
                  <span className="absolute bottom-3 end-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                    {galleryIndex + 1} / {allImages.length}
                  </span>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={cn(
                        "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                        i === galleryIndex ? "border-teal-500" : "border-transparent"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile price bar */}
            <div className="mt-4 lg:hidden">
              <h1 className="text-xl font-bold text-charcoal">{title}</h1>
              <div className="mt-2">
                <PriceDisplay
                  priceUsd={price}
                  originalPriceUsd={originalPrice ?? undefined}
                  size="lg"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {car.dealer?.whatsappNumber && (
                  <WhatsAppButton
                    phoneNumber={car.dealer.whatsappNumber}
                    message={`Hi, I'm interested in the ${title} listed at ${formatPriceUsd(price)}`}
                    className="flex-1"
                  />
                )}
                {car.dealer?.phone && (
                  <Button asChild variant="outline" className="flex-1 gap-1.5">
                    <a href={`tel:${car.dealer.phone}`}>
                      <Phone className="h-4 w-4" />
                      {tc("call")}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Specs grid */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-charcoal">{t("specs")}</h2>
              <SpecsGrid
                specs={{
                  transmission: car.transmission,
                  fuelType: car.fuelType,
                  mileageKm: car.mileageKm,
                  horsepower: car.horsepower ?? undefined,
                  engineSize: car.engineSize ?? undefined,
                  drivetrain: car.drivetrain ?? undefined,
                }}
                variant="expanded"
              />
            </div>

            {/* Full specifications table */}
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-charcoal">{t("specs")}</h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <tbody>
                    {(
                      [
                        { label: loc === "ar" ? "الشركة" : "Make", value: car.make },
                        { label: loc === "ar" ? "الموديل" : "Model", value: car.model },
                        { label: loc === "ar" ? "السنة" : "Year", value: String(car.year) },
                        ...(car.trim ? [{ label: loc === "ar" ? "الفئة" : "Trim", value: car.trim }] : []),
                        { label: loc === "ar" ? "نوع الهيكل" : "Body Type", value: car.bodyType },
                        { label: loc === "ar" ? "الكيلومتراج" : "Mileage", value: formatMileage(car.mileageKm) },
                        { label: loc === "ar" ? "الوقود" : "Fuel", value: car.fuelType },
                        { label: loc === "ar" ? "الناقل" : "Transmission", value: car.transmission },
                        ...(car.drivetrain ? [{ label: loc === "ar" ? "نظام الدفع" : "Drivetrain", value: car.drivetrain }] : []),
                        ...(car.engineSize ? [{ label: loc === "ar" ? "المحرك" : "Engine", value: car.engineSize }] : []),
                        ...(car.horsepower ? [{ label: loc === "ar" ? "القوة" : "Horsepower", value: `${car.horsepower} hp` }] : []),
                        ...(car.colorExterior ? [{ label: loc === "ar" ? "اللون الخارجي" : "Exterior Color", value: car.colorExterior }] : []),
                        ...(car.colorInterior ? [{ label: loc === "ar" ? "اللون الداخلي" : "Interior Color", value: car.colorInterior }] : []),
                        { label: loc === "ar" ? "الحالة" : "Condition", value: car.condition },
                        { label: loc === "ar" ? "المصدر" : "Source", value: car.source },
                        { label: loc === "ar" ? "المنطقة" : "Region", value: `${car.locationCity}, ${car.locationRegion}` },
                      ] as Array<{ label: string; value: string }>
                    ).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="px-4 py-2.5 font-medium text-muted-foreground">{row.label}</td>
                        <td className="px-4 py-2.5 text-end font-medium text-foreground">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-charcoal">{t("features")}</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 text-emerald" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-charcoal">{t("description")}</h2>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-line">{description}</p>
                </div>
              </div>
            )}

            {/* Import info */}
            {(car.source !== "LOCAL" || car.customsPaid !== null || car.accidentHistory !== null) && (
              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-amber-800">
                  {loc === "ar" ? "معلومات الاستيراد" : "Import Information"}
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{loc === "ar" ? "المصدر:" : "Source:"}</span>
                    <span className="font-medium">{car.source}</span>
                  </div>
                  {car.customsPaid !== null && (
                    <div className="flex items-center gap-2">
                      {car.customsPaid ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-emerald" />
                          <span className="text-emerald">{t("customsPaid")}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-coral" />
                          <span className="text-coral">{t("customsNotPaid")}</span>
                        </>
                      )}
                    </div>
                  )}
                  {car.accidentHistory !== null && (
                    <div className="flex items-center gap-2">
                      {car.accidentHistory ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-coral" />
                          <span className="text-coral">{t("hasAccidents")}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 text-emerald" />
                          <span className="text-emerald">{t("noAccidents")}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Report listing */}
            <div className="mt-8 flex justify-end">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <Flag className="h-3 w-3" />
                {t("reportListing")}
              </Button>
            </div>
          </div>

          {/* Right: Sticky sidebar (desktop) */}
          {car.dealer && (
            <div className="hidden w-80 flex-shrink-0 lg:block">
              <StickyContactSidebar
                car={{
                  title,
                  priceUsd: price,
                  originalPriceUsd: originalPrice ?? undefined,
                }}
                dealer={{
                  name: car.dealer.companyName,
                  nameAr: car.dealer.companyNameAr ?? undefined,
                  logoUrl: car.dealer.logoUrl ?? undefined,
                  rating: (car.dealer.ratingAvg as unknown as number) || 0,
                  reviewCount: car.dealer.reviewCount,
                  location: `${car.dealer.city}, ${car.dealer.region}`,
                  isVerified: car.dealer.isVerified,
                  whatsapp: car.dealer.whatsappNumber ?? undefined,
                  phone: car.dealer.phone ?? undefined,
                  slug: car.dealer.slug,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setGalleryIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
            className="absolute start-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative h-[80vh] w-[90vw] max-w-4xl">
            <Image
              src={allImages[galleryIndex]}
              alt={`${title} - Photo ${galleryIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            type="button"
            onClick={() => setGalleryIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
            className="absolute end-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <span className="absolute bottom-4 text-sm text-white/70">
            {galleryIndex + 1} / {allImages.length}
          </span>
        </div>
      )}

      {/* Mobile fixed bottom bar */}
      {car.dealer && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="font-mono text-lg font-bold text-charcoal">
                {formatPriceUsd(price)}
              </span>
            </div>
            {car.dealer.whatsappNumber && (
              <WhatsAppButton
                phoneNumber={car.dealer.whatsappNumber}
                message={`Hi, I'm interested in the ${title}`}
                size="md"
              />
            )}
            {car.dealer.phone && (
              <Button asChild variant="outline" size="default">
                <a href={`tel:${car.dealer.phone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
