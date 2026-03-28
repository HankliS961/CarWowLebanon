"use client";

import { useTranslations, useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { formatPriceUsd } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Star,
  ShieldCheck,
  Trophy,
  Zap,
  Clock,
  MessageSquare,
  Package,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

export function OffersDashboardClient() {
  const t = useTranslations("getOffers.dashboardPage");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const { data: configs, isLoading } = trpc.configurations.listMine.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-4 h-32 w-full" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (!configs || configs.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-charcoal">
          {locale === "ar" ? "لا توجد طلبات بعد" : "No configurations yet"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "ar"
            ? "ابدأ بتحديد مواصفات سيارتك لتلقي عروض من الوكلاء"
            : "Start by configuring your ideal car to receive dealer offers"}
        </p>
        <Button asChild className="mt-6 bg-amber-500 text-white hover:bg-amber-600">
          <Link href="/get-offers/configure">
            {locale === "ar" ? "ابدأ الآن" : "Start Now"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="mb-8 text-2xl font-bold text-charcoal sm:text-3xl">
          {locale === "ar" ? "عروضك" : "Your Offers"}
        </h1>

        {configs.map((config) => {
          const offers = config.offers || [];
          const totalDealers = 10; // Estimated dealers that received request
          const bestPriceOffer = offers.length > 0 ? offers[0] : null;

          return (
            <div key={config.id} className="mb-8 rounded-xl border bg-card shadow-sm">
              {/* Configuration summary */}
              <div className="border-b p-5">
                <h2 className="text-lg font-semibold text-charcoal">{t("configTitle")}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {config.make && <Badge variant="outline">{config.make}</Badge>}
                  {config.model && <Badge variant="outline">{config.model}</Badge>}
                  {config.year && <Badge variant="outline">{config.year}</Badge>}
                  {config.bodyType && <Badge variant="outline">{config.bodyType}</Badge>}
                  <Badge variant="secondary">
                    ${Number(config.budgetMinUsd).toLocaleString()} - $
                    {Number(config.budgetMaxUsd).toLocaleString()}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("offersReceived", { count: offers.length, total: totalDealers })}
                </p>
              </div>

              {/* Offers list */}
              {offers.length > 0 ? (
                <div className="divide-y">
                  {offers.map((offer, i) => {
                    const dealer = offer.dealer;
                    const dealerName =
                      locale === "ar"
                        ? dealer.companyNameAr || dealer.companyName
                        : dealer.companyName;
                    const price = Number(offer.priceOfferedUsd);

                    // Auto-assign badges
                    const isBestPrice = i === 0;
                    const isFastest =
                      offer.deliveryTimeDays !== null &&
                      offers.every(
                        (o) =>
                          o.deliveryTimeDays === null ||
                          (offer.deliveryTimeDays ?? 999) <= (o.deliveryTimeDays ?? 999)
                      );
                    const isTopRated = Number(dealer.ratingAvg) >= 4.5;

                    return (
                      <div key={offer.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
                        {/* Dealer info */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                            {dealerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-semibold">
                                {dealerName}
                              </span>
                              {dealer.isVerified && (
                                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{Number(dealer.ratingAvg).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price + badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isBestPrice && (
                            <Badge className="bg-emerald text-white">
                              <Trophy className="me-1 h-3 w-3" />
                              {t("bestPrice")}
                            </Badge>
                          )}
                          {isFastest && offer.deliveryTimeDays !== null && (
                            <Badge className="bg-blue-500 text-white">
                              <Zap className="me-1 h-3 w-3" />
                              {t("fastest")}
                            </Badge>
                          )}
                          {isTopRated && (
                            <Badge className="bg-amber-500 text-white">
                              <Star className="me-1 h-3 w-3" />
                              {t("topRated")}
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-end">
                          <span className="font-mono text-xl font-bold text-charcoal">
                            {formatPriceUsd(price)}
                          </span>
                          {offer.deliveryTimeDays !== null && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              <Clock className="me-1 inline h-3 w-3" />
                              {t("deliveryDays", { days: offer.deliveryTimeDays })}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 sm:flex-shrink-0">
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {t("message")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                  {t("noOffers")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
