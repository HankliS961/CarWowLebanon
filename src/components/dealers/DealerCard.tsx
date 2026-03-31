"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DealerCardData } from "@/types";
import { Star, MapPin, ShieldCheck, Car } from "lucide-react";
import type { Locale } from "@/i18n/config";

export interface DealerCardProps {
  dealer: DealerCardData;
  className?: string;
}

export function DealerCard({ dealer, className }: DealerCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("dealers");

  const name = locale === "ar" ? dealer.companyNameAr : dealer.companyName;

  return (
    <Link
      href={`/dealers/${dealer.slug}`}
      className={cn(
        "group flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Logo */}
      <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-muted bg-muted">
        {dealer.logoUrl ? (
          <Image
            src={dealer.logoUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name & badges */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        {dealer.isVerified && (
          <ShieldCheck className="h-4 w-4 text-teal-500" aria-label={t("verified")} />
        )}
      </div>

      {dealer.isFeatured && (
        <Badge className="mt-1 bg-amber-500 text-white">{t("featured")}</Badge>
      )}

      {/* Rating */}
      <div className="mt-2 flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold">{Number(dealer.ratingAvg).toFixed(1)}</span>
        <span className="text-muted-foreground">({dealer.reviewCount})</span>
      </div>

      {/* Location */}
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        <span>{dealer.city}, {dealer.region}</span>
      </div>

      {/* Cars count */}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Car className="h-3.5 w-3.5" />
        <span>
          {dealer.carsCount} {t("carsInStock")}
        </span>
      </div>
    </Link>
  );
}

export default DealerCard;
