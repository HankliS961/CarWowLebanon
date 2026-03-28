"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPriceUsd } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  Star,
  MapPin,
  ShieldCheck,
  Phone,
  Heart,
  Share2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import type { Locale } from "@/i18n/config";

export interface StickyContactDealerData {
  /** Dealer display name. */
  name: string;
  /** Dealer Arabic name. */
  nameAr?: string;
  /** Dealer logo URL. */
  logoUrl?: string;
  /** Dealer rating (out of 5). */
  rating: number;
  /** Number of reviews. */
  reviewCount: number;
  /** Dealer location. */
  location: string;
  /** Whether the dealer is verified. */
  isVerified: boolean;
  /** Dealer WhatsApp number. */
  whatsapp?: string;
  /** Dealer phone number. */
  phone?: string;
  /** Dealer slug for profile link. */
  slug: string;
}

export interface StickyContactCarData {
  /** Car title (e.g. "2024 Toyota Camry SE"). */
  title: string;
  /** Price in USD. */
  priceUsd: number;
  /** Original price for savings display. */
  originalPriceUsd?: number;
}

export interface StickyContactSidebarProps {
  /** Car data for price display. */
  car: StickyContactCarData;
  /** Dealer data for contact section. */
  dealer: StickyContactDealerData;
  /** Callback when save button is clicked. */
  onSave?: () => void;
  /** Callback when share button is clicked. */
  onShare?: () => void;
  /** Whether the car is saved. */
  isSaved?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

export function StickyContactSidebar({
  car,
  dealer,
  onSave,
  onShare,
  isSaved = false,
  className,
}: StickyContactSidebarProps) {
  const t = useTranslations("cars.detail");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const hasSavings =
    car.originalPriceUsd !== undefined &&
    car.originalPriceUsd > car.priceUsd;
  const savings = hasSavings ? car.originalPriceUsd! - car.priceUsd : 0;
  const dealerDisplayName =
    locale === "ar" && dealer.nameAr ? dealer.nameAr : dealer.name;

  return (
    <aside
      className={cn(
        "sticky top-20 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      {/* Car title + price */}
      <div>
        <h2 className="text-base font-semibold text-charcoal">{car.title}</h2>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasSavings && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPriceUsd(car.originalPriceUsd!)}
            </span>
          )}
          <span className="font-mono text-2xl font-bold text-charcoal">
            {formatPriceUsd(car.priceUsd)}
          </span>
        </div>
        {hasSavings && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-semibold text-emerald">
            <Tag size={12} />
            Save {formatPriceUsd(savings)}
          </div>
        )}
      </div>

      {/* Primary CTAs */}
      <div className="flex flex-col gap-2">
        <Button size="lg" variant="secondary" className="w-full gap-2">
          {locale === "ar" ? "احصل على عروض" : "Get Offers"}
        </Button>

        {dealer.whatsapp && (
          <WhatsAppButton
            phoneNumber={dealer.whatsapp}
            message={`Hi, I'm interested in the ${car.title} listed at ${formatPriceUsd(car.priceUsd)}`}
            size="lg"
            className="w-full"
          />
        )}

        {dealer.phone && (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <a href={`tel:${dealer.phone}`}>
              <Phone size={16} />
              {tc("call")}
            </a>
          </Button>
        )}
      </div>

      {/* Dealer info */}
      <div className="rounded-lg bg-muted/50 p-3">
        <div className="flex items-start gap-3">
          {/* Dealer logo */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-background">
            {dealer.logoUrl ? (
              <Image
                src={dealer.logoUrl}
                alt={dealerDisplayName}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                {dealerDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-charcoal">
                {dealerDisplayName}
              </span>
              {dealer.isVerified && (
                <ShieldCheck
                  size={14}
                  className="shrink-0 text-teal-500"
                  aria-label={tc("verified")}
                />
              )}
            </div>

            {/* Rating */}
            <div className="mt-0.5 flex items-center gap-1 text-xs">
              <Star
                size={12}
                className="fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              <span className="font-medium">
                {Number(dealer.rating).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({dealer.reviewCount})
              </span>
            </div>

            {/* Location */}
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={10} aria-hidden="true" />
              <span>{dealer.location}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/dealers/${dealer.slug}`}
          className="mt-3 block text-center text-xs font-medium text-teal-500 transition-colors hover:text-teal-700"
        >
          {locale === "ar"
            ? "عرض صفحة الوكيل"
            : "View Dealer Profile"}
        </Link>
      </div>

      {/* Save + Share row */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="flex-1 gap-1.5"
        >
          <Heart
            size={14}
            className={cn(
              isSaved && "fill-coral text-coral"
            )}
          />
          {tc("save")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="flex-1 gap-1.5"
        >
          <Share2 size={14} />
          {tc("share")}
        </Button>
      </div>
    </aside>
  );
}

export default StickyContactSidebar;
