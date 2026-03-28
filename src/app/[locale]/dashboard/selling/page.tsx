"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { formatPriceUsd } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { toast } from "sonner";
import {
  Car,
  DollarSign,
  Clock,
  Star,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Gavel,
  CheckCircle,
  XCircle,
  ImageIcon,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

function getTimeRemaining(endsAt: Date | string | null): { hours: number; minutes: number } | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

export default function MySellingPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.sellingPage");
  const td = useTranslations("dashboard");

  const [confirmDialog, setConfirmDialog] = useState<{
    type: "accept" | "cancel";
    bidId?: string;
    listingId?: string;
  } | null>(null);

  const { data: listings, isLoading } = trpc.sellListings.listMine.useQuery();
  const utils = trpc.useUtils();

  const acceptBid = trpc.sellBids.accept.useMutation({
    onSuccess: () => {
      utils.sellListings.listMine.invalidate();
      toast.success(locale === "ar" ? "تم قبول العرض!" : "Bid accepted!");
      setConfirmDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelListing = trpc.sellListings.cancel.useMutation({
    onSuccess: () => {
      utils.sellListings.listMine.invalidate();
      toast.success(locale === "ar" ? "تم إلغاء الإعلان" : "Listing cancelled");
      setConfirmDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="mt-12 text-center">
          <Car className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">{td("noListings")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{td("noListingsSubtitle")}</p>
          <Button asChild className="mt-6">
            <Link href="/sell-my-car/valuation">
              {td("sellYourCar")}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter((l) => ["PENDING_REVIEW", "LIVE"].includes(l.status));
  const completedListings = listings.filter((l) => l.status === "SOLD");
  const otherListings = listings.filter((l) => ["EXPIRED", "CANCELLED"].includes(l.status));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild size="sm">
          <Link href="/sell-my-car/valuation">
            <Car className="me-2 h-4 w-4" />
            {td("sellYourCar")}
          </Link>
        </Button>
      </div>

      {/* Active Listings */}
      <div className="mt-8 space-y-6">
        {activeListings.map((listing) => {
          const highestBid = listing.bids[0];
          const timeLeft = getTimeRemaining(listing.auctionEndsAt);
          const statusColor = STATUS_COLORS[listing.status] ?? STATUS_COLORS.PENDING;
          const images = (listing.images as string[]) ?? [];

          return (
            <Card key={listing.id} className="overflow-hidden">
              <CardHeader className="flex-row items-center gap-4 space-y-0 p-4 sm:p-6">
                {/* Car image thumbnail */}
                <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-24">
                  {images[0] ? (
                    <img src={images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {listing.year} {listing.make} {listing.model}
                      {listing.trim ? ` ${listing.trim}` : ""}
                    </CardTitle>
                    <Badge className={cn(statusColor.bg, statusColor.text, "text-[10px]")}>
                      {t(`status${listing.status.charAt(0) + listing.status.slice(1).toLowerCase().replace(/_./g, (m) => m[1].toUpperCase())}` as never)}
                    </Badge>
                  </div>

                  {listing.status === "LIVE" && timeLeft && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Clock className="me-1 inline h-3 w-3" />
                      {t("auctionEnds")}: {timeLeft.hours}{t("hours")} {timeLeft.minutes}{t("minutes")}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="border-t p-4 sm:p-6">
                {/* Bid summary */}
                {listing.bids.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                      <div>
                        <p className="text-xs font-medium text-emerald-700">{t("currentHighest")}</p>
                        <p className="font-mono text-xl font-bold text-emerald-700">
                          {formatPriceUsd(Number(highestBid.bidAmountUsd))}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-muted-foreground">{t("totalBids")}</p>
                        <p className="text-lg font-bold">{listing.bids.length}</p>
                      </div>
                    </div>

                    {/* Bid list */}
                    <div className="divide-y rounded-lg border">
                      {listing.bids.slice(0, 5).map((bid, index) => (
                        <div key={bid.id} className="flex items-center gap-3 p-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold">
                                {formatPriceUsd(Number(bid.bidAmountUsd))}
                              </span>
                              <span className="text-xs text-muted-foreground">-</span>
                              <span className="text-xs font-medium">
                                {locale === "ar" ? bid.dealer.companyNameAr : bid.dealer.companyName}
                              </span>
                              {bid.dealer.isVerified && (
                                <ShieldCheck className="h-3 w-3 text-teal-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                {Number(bid.dealer.ratingAvg).toFixed(1)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {bid.dealer.city}
                              </span>
                            </div>
                          </div>
                          {listing.status === "LIVE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() =>
                                setConfirmDialog({ type: "accept", bidId: bid.id })
                              }
                            >
                              <CheckCircle className="me-1 h-3 w-3" />
                              {t("acceptBid")}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {listing.status === "LIVE" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() =>
                            setConfirmDialog({ type: "accept", bidId: highestBid.id })
                          }
                        >
                          {t("acceptBestOffer")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setConfirmDialog({ type: "cancel", listingId: listing.id })
                          }
                        >
                          <XCircle className="me-1 h-3 w-3" />
                          {t("cancelListing")}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Gavel className="mx-auto h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-2 text-sm font-medium">{t("noBids")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("waitingForBids")}</p>
                    {listing.status === "LIVE" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-4"
                        onClick={() =>
                          setConfirmDialog({ type: "cancel", listingId: listing.id })
                        }
                      >
                        {t("cancelListing")}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completed Sales */}
      {completedListings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">{t("completedSales")}</h2>
          <div className="mt-4 space-y-3">
            {completedListings.map((listing) => {
              const acceptedBid = listing.bids.find((b) => b.status === "ACCEPTED");
              return (
                <Card key={listing.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <CheckCircle className="h-8 w-8 flex-shrink-0 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {listing.year} {listing.make} {listing.model}
                      </p>
                      {acceptedBid && (
                        <p className="text-sm text-muted-foreground">
                          {t("finalPrice")}: {formatPriceUsd(Number(acceptedBid.bidAmountUsd))} -{" "}
                          {t("soldTo")}: {locale === "ar" ? acceptedBid.dealer.companyNameAr : acceptedBid.dealer.companyName}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {t("statusSold")}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.type === "accept" ? t("confirmAccept") : t("confirmCancel")}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.type === "accept" ? t("confirmAcceptDesc") : t("confirmCancelDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant={confirmDialog?.type === "accept" ? "default" : "destructive"}
              onClick={() => {
                if (confirmDialog?.type === "accept" && confirmDialog.bidId) {
                  acceptBid.mutate({ bidId: confirmDialog.bidId });
                } else if (confirmDialog?.type === "cancel" && confirmDialog.listingId) {
                  cancelListing.mutate({ id: confirmDialog.listingId });
                }
              }}
              disabled={acceptBid.isPending || cancelListing.isPending}
            >
              {(acceptBid.isPending || cancelListing.isPending) && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {confirmDialog?.type === "accept"
                ? locale === "ar" ? "تأكيد القبول" : "Confirm Accept"
                : locale === "ar" ? "تأكيد الإلغاء" : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
