"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatPriceUsd } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Star, Clock, MessageCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

export type OfferBadge = "best-price" | "fastest" | "top-rated" | "best-value";

export interface OfferData {
  /** Unique offer ID. */
  id: string;
  /** Dealer display name. */
  dealerName: string;
  /** Dealer star rating (out of 5). */
  dealerRating: number;
  /** Offered price in USD. */
  price: number;
  /** Estimated delivery in days. */
  deliveryDays: number;
  /** List of included extras. */
  extras: string[];
  /** Optional badge indicating why this offer stands out. */
  badge?: OfferBadge;
  /** Dealer WhatsApp number. */
  whatsappNumber?: string;
}

export interface OfferCardProps {
  /** Offer data. */
  offer: OfferData;
  /** Callback when "Details" is clicked. */
  onViewDetails?: (offerId: string) => void;
  /** Callback when "Message" is clicked. */
  onMessage?: (offerId: string) => void;
  /** Additional CSS classes. */
  className?: string;
}

const badgeConfig: Record<
  OfferBadge,
  { label: string; colorClass: string }
> = {
  "best-price": {
    label: "Best Price",
    colorClass: "bg-emerald/10 text-emerald border-emerald/20",
  },
  fastest: {
    label: "Fastest",
    colorClass: "bg-amber/10 text-amber-700 border-amber/20",
  },
  "top-rated": {
    label: "Top Rated",
    colorClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  "best-value": {
    label: "Best Value",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function OfferCard({
  offer,
  onViewDetails,
  onMessage,
  className,
}: OfferCardProps) {
  const t = useTranslations("common");

  const badge = offer.badge ? badgeConfig[offer.badge] : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5",
        badge && "border-s-4",
        offer.badge === "best-price" && "border-s-emerald",
        offer.badge === "fastest" && "border-s-amber-500",
        offer.badge === "top-rated" && "border-s-teal-500",
        offer.badge === "best-value" && "border-s-blue-500",
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <Badge
          className={cn(
            "absolute top-3 end-3 border text-xs",
            badge.colorClass
          )}
        >
          {badge.label}
        </Badge>
      )}

      {/* Dealer info */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-charcoal">
          {offer.dealerName}
        </span>
        <div className="flex items-center gap-0.5">
          <Star
            size={12}
            className="fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-muted-foreground">
            {offer.dealerRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="text-2xl font-bold font-mono text-charcoal">
          {formatPriceUsd(offer.price)}
        </span>
      </div>

      {/* Delivery */}
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock size={14} className="shrink-0" aria-hidden="true" />
        <span>
          {offer.deliveryDays === 0
            ? "Available Now"
            : `${offer.deliveryDays} day${offer.deliveryDays === 1 ? "" : "s"} delivery`}
        </span>
      </div>

      {/* Extras */}
      {offer.extras.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-1.5">
          {offer.extras.map((extra, i) => (
            <li
              key={i}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {extra}
            </li>
          ))}
        </ul>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMessage?.(offer.id)}
          className="gap-1.5"
        >
          <MessageCircle size={14} />
          {t("email")}
        </Button>

        {offer.whatsappNumber && (
          <WhatsAppButton
            phoneNumber={offer.whatsappNumber}
            message={`Hi, I'm interested in your offer for ${formatPriceUsd(offer.price)}`}
            size="sm"
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails?.(offer.id)}
          className="gap-1.5 ms-auto"
        >
          <Eye size={14} />
          Details
        </Button>
      </div>
    </div>
  );
}

export default OfferCard;
