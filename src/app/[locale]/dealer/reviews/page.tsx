"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

type ReviewTab = "all" | "pendingResponse" | "responded";

/** Dealer reviews management page showing overall rating and individual reviews with response capability. */
export default function DealerReviewsPage() {
  const t = useTranslations("dealer.reviews");
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<ReviewTab>("all");
  const [page, setPage] = useState(1);
  const [respondTo, setRespondTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  // Fetch dealer profile for overall rating
  const { data: dealer } = trpc.dealers.getMyProfile.useQuery(undefined, {
    retry: false,
  });

  // Fetch reviews for the current dealer
  const { data: reviewsData, isLoading } = trpc.reviews.getForDealer.useQuery(
    { page, limit: 10 },
    { retry: false }
  );

  const reviews = reviewsData?.reviews ?? [];
  const totalReviews = reviewsData?.total ?? 0;
  const totalPages = reviewsData?.totalPages ?? 1;

  const respondMutation = trpc.reviews.respondToReview.useMutation({
    onSuccess: () => {
      toast.success("Response sent successfully");
      utils.reviews.invalidate();
      setRespondTo(null);
      setResponseText("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send response");
    },
  });

  const handleSendResponse = () => {
    if (!responseText.trim() || !respondTo) return;
    respondMutation.mutate({
      reviewId: respondTo,
      response: responseText,
    });
  };

  // Filter reviews based on active tab
  const filteredReviews = reviews.filter((review) => {
    if (activeTab === "pendingResponse") return !review.dealerResponse;
    if (activeTab === "responded") return !!review.dealerResponse;
    return true;
  });

  const overallRating = dealer?.ratingAvg ? Number(dealer.ratingAvg).toFixed(1) : "N/A";

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Rating summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("overallRating")} value={overallRating} icon={Star} />
        <MetricCard title={t("totalReviews")} value={totalReviews} icon={MessageSquare} />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as ReviewTab);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="pendingResponse">{t("tabs.pendingResponse")}</TabsTrigger>
          <TabsTrigger value="responded">{t("tabs.responded")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t("empty")}
              description={t("emptyDescription")}
            />
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.buyer?.name || "Anonymous Buyer"}
                          </span>
                          {renderStars(review.ratingOverall)}
                        </div>
                        {review.title && (
                          <h4 className="mt-1 font-medium">{review.title}</h4>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {review.body || "No comment provided"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Price Fairness: {review.ratingPriceFairness}/5</span>
                          <span>Communication: {review.ratingCommunication}/5</span>
                          <span>Honesty: {review.ratingHonesty}/5</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!review.dealerResponse && (
                        <Button
                          size="sm"
                          onClick={() => setRespondTo(review.id)}
                        >
                          {t("respondToReview")}
                        </Button>
                      )}
                    </div>
                    {review.dealerResponse && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Dealer Response:
                        </p>
                        <p className="mt-1 text-sm">{review.dealerResponse}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <DataTablePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalReviews}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response dialog */}
      <Dialog open={!!respondTo} onOpenChange={(open) => !open && setRespondTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("respondToReview")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={t("responsePlaceholder")}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondTo(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={!responseText.trim() || respondMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {respondMutation.isPending ? "Sending..." : t("sendResponse")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
