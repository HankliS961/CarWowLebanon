"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gavel, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

/** Available sell listings where dealers can place bids to buy cars. */
export default function DealerAuctionsPage() {
  const t = useTranslations("dealer.auctions");
  const [bidListingId, setBidListingId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");

  const { data: listings, isLoading } = trpc.sellListings.listActive.useQuery(
    { page: 1, limit: 20 },
    { retry: false }
  );

  const createBid = trpc.sellBids.create.useMutation({
    onSuccess: () => {
      toast.success(t("bidSuccess"));
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

  const sellListings = listings?.items ?? [];

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
            : sellListings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    {listing.trim && (
                      <p className="text-sm text-muted-foreground">{listing.trim}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Mileage:</span>
                      <span>{listing.mileageKm.toLocaleString()} km</span>
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
                      onClick={() => setBidListingId(listing.id)}
                    >
                      {t("placeBid")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
        </div>
      )}

      {/* Place bid dialog */}
      <Dialog
        open={!!bidListingId}
        onOpenChange={(open) => !open && setBidListingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("placeBid")}</DialogTitle>
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
