"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Gavel,
  Clock,
  DollarSign,
  MapPin,
  Gauge,
  Car,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

/** Shape of a single sell listing returned by listActive (SellListing + includes). */
interface ActiveListing {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  mileageKm: number | null;
  askingPriceUsd: unknown;
  auctionEndsAt: string | Date | null;
  images: unknown;
  conditionDescription: string | null;
  conditionCheckboxes: unknown;
  accidentHistory: boolean | null;
  source: string | null;
  status: string;
  _count: { bids: number };
  seller: { name: string | null; locationRegion: string | null; locationCity: string | null } | null;
  [key: string]: unknown;
}

/** Available sell listings where dealers can place bids to buy cars. */
export default function DealerAuctionsPage() {
  const t = useTranslations("dealer.auctions");
  const [bidListingId, setBidListingId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [detailListing, setDetailListing] = useState<ActiveListing | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { data: listings, isLoading } = trpc.sellListings.listActive.useQuery(
    { page: 1, limit: 20 },
    { retry: false }
  );

  const utils = trpc.useUtils();

  const createBid = trpc.sellBids.create.useMutation({
    onSuccess: () => {
      toast.success(t("bidSuccess"));
      utils.sellListings.listActive.invalidate();
      utils.sellBids.invalidate();
      setBidListingId(null);
      setBidAmount("");
      setBidNotes("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePlaceBid = () => {
    if (!bidListingId || !bidAmount) return;
    createBid.mutate({
      sellListingId: bidListingId,
      bidAmountUsd: Number(bidAmount),
      notes: bidNotes || undefined,
    });
  };

  const openDetail = (listing: ActiveListing) => {
    setDetailListing(listing);
    setGalleryIndex(0);
  };

  const openBidFromDetail = () => {
    if (!detailListing) return;
    setBidListingId(detailListing.id);
  };

  const sellListings = listings?.items ?? [];

  // Parse images from listing (stored as Json, could be string[] or string)
  const getImages = (listing: ActiveListing): string[] => {
    const raw = listing.images;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Parse condition checkboxes
  const getConditionCheckboxes = (
    listing: ActiveListing,
  ): Record<string, boolean> => {
    const raw = (listing as Record<string, unknown>).conditionCheckboxes;
    if (raw && typeof raw === "object" && !Array.isArray(raw))
      return raw as Record<string, boolean>;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return {};
  };

  // Source label
  const sourceLabel = (source: string | null | undefined) => {
    if (!source) return "N/A";
    const map: Record<string, string> = {
      LOCAL: "Local",
      IMPORTED_USA: "Imported (USA)",
      IMPORTED_GULF: "Imported (Gulf)",
      IMPORTED_EUROPE: "Imported (Europe)",
      SALVAGE_REBUILT: "Salvage / Rebuilt",
    };
    return map[source] ?? source;
  };

  // Calculate time remaining for auction
  const getTimeLeft = (endsAt: string | Date | null) => {
    if (!endsAt) return "N/A";
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {sellListings.length === 0 && !isLoading ? (
        <EmptyState
          icon={Gavel}
          title={t("empty")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))
            : sellListings.map((listing) => {
                const images = getImages(listing);
                return (
                  <Card
                    key={listing.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => openDetail(listing)}
                  >
                    {/* Thumbnail */}
                    {images.length > 0 && (
                      <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                        <Image
                          src={images[0]}
                          alt={`${listing.year} ${listing.make} ${listing.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold">
                        {listing.year} {listing.make} {listing.model}
                      </h3>
                      {listing.trim && (
                        <p className="text-sm text-muted-foreground">
                          {listing.trim}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {(listing.mileageKm ?? 0).toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {listing.askingPriceUsd
                            ? `${t("askingPrice")}: $${Number(listing.askingPriceUsd).toLocaleString()}`
                            : t("openBidding")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("timeLeft")}: {getTimeLeft(listing.auctionEndsAt)}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {listing._count.bids} {t("currentBids")}
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBidListingId(listing.id);
                        }}
                      >
                        {t("placeBid")}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
        </div>
      )}

      {/* ───────────── Listing Detail Dialog ───────────── */}
      <Dialog
        open={!!detailListing}
        onOpenChange={(open) => !open && setDetailListing(null)}
      >
        {detailListing && (() => {
          const images = getImages(detailListing);
          const checkboxes = getConditionCheckboxes(detailListing);
          const condDesc = (detailListing as Record<string, unknown>)
            .conditionDescription as string | null | undefined;
          const accident = (detailListing as Record<string, unknown>)
            .accidentHistory as boolean | null | undefined;
          const source = (detailListing as Record<string, unknown>).source as
            | string
            | null
            | undefined;

          return (
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {detailListing.year} {detailListing.make}{" "}
                  {detailListing.model}
                  {detailListing.trim ? ` ${detailListing.trim}` : ""}
                </DialogTitle>
                <DialogDescription>
                  {t("timeLeft")}: {getTimeLeft(detailListing.auctionEndsAt)} |{" "}
                  {detailListing._count.bids} {t("currentBids")}
                </DialogDescription>
              </DialogHeader>

              {/* Photo Gallery */}
              {images.length > 0 ? (
                <div className="relative">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={images[galleryIndex]}
                      alt={`Photo ${galleryIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 672px) 100vw, 672px"
                    />
                  </div>
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80"
                        onClick={() =>
                          setGalleryIndex(
                            (galleryIndex - 1 + images.length) % images.length,
                          )
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80"
                        onClick={() =>
                          setGalleryIndex(
                            (galleryIndex + 1) % images.length,
                          )
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="mt-1 text-center text-xs text-muted-foreground">
                        {galleryIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}

              <Separator />

              {/* Car Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Make / Model:</span>
                </div>
                <span className="font-medium">
                  {detailListing.make} {detailListing.model}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Year:</span>
                </div>
                <span className="font-medium">{detailListing.year}</span>

                {detailListing.trim && (
                  <>
                    <span className="text-muted-foreground">Trim:</span>
                    <span className="font-medium">{detailListing.trim}</span>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Mileage:</span>
                </div>
                <span className="font-medium">
                  {(detailListing.mileageKm ?? 0).toLocaleString()} km
                </span>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                </div>
                <span className="font-medium">{sourceLabel(source)}</span>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("askingPrice")}:</span>
                </div>
                <span className="font-medium">
                  {detailListing.askingPriceUsd
                    ? `$${Number(detailListing.askingPriceUsd).toLocaleString()}`
                    : t("openBidding")}
                </span>

                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Accident History:
                  </span>
                </div>
                <span className="font-medium">
                  {accident === true
                    ? "Yes"
                    : accident === false
                      ? "No"
                      : "N/A"}
                </span>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Seller:</span>
                </div>
                <span className="font-medium">
                  {detailListing.seller?.name ?? "N/A"}
                </span>
              </div>

              {/* Condition Checkboxes */}
              {Object.keys(checkboxes).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Condition</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(checkboxes).map(([key, val]) => (
                        <Badge
                          key={key}
                          variant={val ? "default" : "outline"}
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Condition Description */}
              {condDesc && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-1 text-sm font-semibold">
                      Condition Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {condDesc}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Auction Info + Bid Button */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("timeLeft")}: {getTimeLeft(detailListing.auctionEndsAt)}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {detailListing._count.bids} {t("currentBids")}
                  </Badge>
                </div>
                <Button onClick={openBidFromDetail}>{t("placeBid")}</Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* ───────────── Place Bid Dialog ───────────── */}
      <Dialog
        open={!!bidListingId}
        onOpenChange={(open) => !open && setBidListingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("placeBid")}</DialogTitle>
            <DialogDescription>
              Enter your bid amount in USD.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount">{t("bidAmount")} *</Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidNotes">{t("bidNotes")}</Label>
              <Textarea
                id="bidNotes"
                value={bidNotes}
                onChange={(e) => setBidNotes(e.target.value)}
                rows={3}
                placeholder="Any notes for the seller..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidListingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBid}
              disabled={!bidAmount || createBid.isPending}
            >
              {createBid.isPending ? "Placing..." : t("submitBid")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
