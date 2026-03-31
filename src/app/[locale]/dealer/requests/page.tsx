"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { Link } from "@/i18n/routing";
import { trpc } from "@/lib/trpc/client";

/** Format a region enum value for display (e.g. MOUNT_LEBANON -> Mount Lebanon). */
function formatRegion(region: string): string {
  return region
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Calculate days remaining until a date. Returns 0 if already past. */
function daysUntil(date: Date | string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Dealer Buyer Requests page — shows active buyer car requests from the database. */
export default function DealerRequestsPage() {
  const locale = useLocale();
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [respondTo, setRespondTo] = useState<{
    id: string;
    make: string;
    model: string;
    buyerName: string | null;
  } | null>(null);
  const [message, setMessage] = useState("");

  // Fetch dealer profile to check subscription tier
  const { data: dealer, isLoading: dealerLoading } =
    trpc.dealers.getMyProfile.useQuery(undefined, { retry: false });

  const isFree = dealer?.subscriptionTier === "FREE";

  // Fetch active buyer requests (only when dealer is BRONZE+)
  const { data, isLoading: requestsLoading } =
    trpc.carRequests.listActive.useQuery(
      { page, limit: 20 },
      { enabled: !!dealer && !isFree, retry: false }
    );

  const respondMutation = trpc.carRequests.respond.useMutation({
    onSuccess: () => {
      toast.success("Buyer has been notified!");
      setRespondTo(null);
      setMessage("");
      utils.carRequests.listActive.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send response");
    },
  });

  function handleRespond() {
    if (!respondTo || !message.trim()) return;
    respondMutation.mutate({
      requestId: respondTo.id,
      message: message.trim(),
    });
  }

  const isLoading = dealerLoading || requestsLoading;
  const requests = data?.requests ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Buyer Requests" />

      {/* Loading skeleton while dealer profile is fetched */}
      {dealerLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade gate for FREE dealers */}
      {!dealerLoading && isFree && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Upgrade to View Buyer Requests
            </h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Buyer Requests is available on Bronze plan and above. Upgrade your
              subscription to see what buyers are looking for and respond
              directly.
            </p>
            <Link href="/dealer/subscription">
              <Button>Upgrade Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Request list for BRONZE+ dealers */}
      {!dealerLoading && !isFree && (
        <>
          {/* Loading skeleton while requests load */}
          {requestsLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="mb-3 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-2 h-4 w-1/2 rounded bg-muted" />
                    <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!requestsLoading && requests.length === 0 && (
            <EmptyState
              icon={ShoppingBag}
              title="No Buyer Requests"
              description="There are no active buyer car requests at the moment. Check back later for new requests from buyers looking for specific cars."
            />
          )}

          {/* Request cards grid */}
          {!requestsLoading && requests.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => {
                  const remaining = daysUntil(request.expiresAt);

                  return (
                    <Card key={request.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold leading-tight">
                              {request.make} {request.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {request.yearFrom === request.yearTo
                                ? request.yearFrom
                                : `${request.yearFrom}–${request.yearTo}`}
                            </p>
                          </div>
                          <Badge
                            variant={remaining <= 3 ? "destructive" : "secondary"}
                            className="shrink-0"
                          >
                            <Clock className="me-1 h-3 w-3" />
                            {remaining === 0
                              ? "Expires today"
                              : `${remaining}d left`}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2 pb-3">
                        {/* Transmission & Body Type */}
                        {(request.transmission || request.bodyType) && (
                          <div className="flex flex-wrap gap-1.5">
                            {request.transmission && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {request.transmission.toLowerCase()}
                              </Badge>
                            )}
                            {request.bodyType && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {request.bodyType.toLowerCase()}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Buyer info */}
                        {request.buyer.name && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{request.buyer.name}</span>
                          </div>
                        )}

                        {request.buyer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <a
                              href={`tel:${request.buyer.phone}`}
                              className="text-primary hover:underline"
                              dir="ltr"
                            >
                              {request.buyer.phone}
                            </a>
                          </div>
                        )}

                        {(request.buyer.locationRegion || request.buyer.locationCity) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>
                              {request.buyer.locationCity
                                ? `${request.buyer.locationCity}, `
                                : ""}
                              {request.buyer.locationRegion
                                ? formatRegion(request.buyer.locationRegion)
                                : ""}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <p className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
                            {request.notes}
                          </p>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() =>
                            setRespondTo({
                              id: request.id,
                              make: request.make,
                              model: request.model,
                              buyerName: request.buyer.name,
                            })
                          }
                        >
                          <MessageSquare className="me-2 h-4 w-4" />
                          Respond
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={20}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Respond Dialog */}
      <Dialog
        open={!!respondTo}
        onOpenChange={(open) => {
          if (!open) {
            setRespondTo(null);
            setMessage("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Respond to Request
            </DialogTitle>
            <DialogDescription>
              Send a message to{" "}
              {respondTo?.buyerName || "the buyer"} about their{" "}
              {respondTo?.make} {respondTo?.model} request. They will receive a
              notification with your dealership info.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="respond-message">Your Message</Label>
            <Textarea
              id="respond-message"
              placeholder="e.g. We have a matching vehicle in stock. Contact us for details and pricing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-end text-xs text-muted-foreground">
              {message.length}/1000
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRespondTo(null);
                setMessage("");
              }}
              disabled={respondMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!message.trim() || respondMutation.isPending}
            >
              {respondMutation.isPending && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
