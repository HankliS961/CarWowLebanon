"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Car, AlertTriangle, Star, CheckCircle, Trash2, AlertOctagon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { formatPriceUsd } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

type ListingTab = "all" | "flagged" | "featured";

export default function AdminListingsPage() {
  const t = useTranslations("admin.listings");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ListingTab>("all");
  const [page, setPage] = useState(1);

  // Warn dialog state
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [warnCarId, setWarnCarId] = useState<string | null>(null);
  const [warnCarTitle, setWarnCarTitle] = useState("");
  const [warnReason, setWarnReason] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading: allLoading } = trpc.cars.list.useQuery(
    { page, limit: 25, sort: "newest" },
    { enabled: activeTab !== "flagged", retry: false }
  );

  const { data: nonActiveData } = trpc.admin.getListingsFlagged.useQuery(
    undefined,
    { enabled: activeTab === "all", retry: false }
  );

  const { data: flaggedData, isLoading: flaggedLoading } = trpc.admin.getListingsFlagged.useQuery(
    undefined,
    { enabled: activeTab === "flagged", retry: false }
  );

  const moderateListing = trpc.admin.moderateListing.useMutation({
    onSuccess: (_data, variables) => {
      const actionMessages: Record<string, { title: string; desc: string }> = {
        APPROVE: { title: "Listing Approved", desc: "The listing has been restored to active status." },
        REMOVE: { title: "Listing Removed", desc: "The listing has been set to expired and is no longer visible." },
        WARN: { title: "Dealer Warned", desc: "The listing has been moved to drafts. The dealer has been notified to fix it." },
        REVOKE_WARN: { title: "Warning Revoked", desc: "The listing has been restored to active status." },
      };
      const msg = actionMessages[variables.action];
      toast.success(msg?.title ?? "Action completed", { description: msg?.desc });
      utils.cars.list.invalidate();
      utils.admin.getListingsFlagged.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = activeTab === "flagged" ? flaggedLoading : allLoading;

  const allCars = data?.cars ?? [];
  const totalPages = activeTab === "flagged" ? 1 : (data?.totalPages ?? 1);
  const total = activeTab === "flagged" ? (flaggedData?.length ?? 0) : (data?.total ?? 0);

  const filteredCars = (() => {
    if (activeTab === "flagged") return flaggedData ?? [];
    if (activeTab === "featured") return allCars.filter((car) => car.isFeatured === true);
    const nonActive = nonActiveData ?? [];
    return [...allCars, ...nonActive];
  })();

  const handleModerate = (carId: string, action: "APPROVE" | "REMOVE" | "WARN" | "REVOKE_WARN", reason?: string) => {
    moderateListing.mutate({ carId, action, reason });
  };

  const openWarnDialog = (carId: string, carTitle: string) => {
    setWarnCarId(carId);
    setWarnCarTitle(carTitle);
    setWarnReason("");
    setWarnDialogOpen(true);
  };

  const submitWarn = () => {
    if (!warnCarId) return;
    handleModerate(warnCarId, "WARN", warnReason || undefined);
    setWarnDialogOpen(false);
    setWarnCarId(null);
    setWarnReason("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ListingTab); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="flagged">
            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
            {t("tabs.flagged")}
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="mr-1 h-3.5 w-3.5" />
            {t("tabs.featured")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            {filteredCars.length === 0 && !isLoading ? (
              <div className="p-6">
                <EmptyState icon={Car} title="No listings found" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="hidden md:table-cell">Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}>
                              <div className="h-10 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))
                      : filteredCars.map((car) => (
                          <TableRow key={car.id}>
                            <TableCell>
                              <a
                                href={`/${locale}/cars/${encodeURIComponent(car.make.toLowerCase())}/${encodeURIComponent(car.model.toLowerCase())}/${car.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                {car.year} {car.make} {car.model}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              {car.trim && (
                                <p className="text-xs text-muted-foreground">{car.trim}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{car.dealer.companyName}</p>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPriceUsd(Number(car.priceUsd))}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {car.viewsCount}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={car.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {/* Approve: restore flagged/warned/drafted listings */}
                                {car.status !== "ACTIVE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => handleModerate(car.id, "APPROVE")}
                                    disabled={moderateListing.isPending}
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    {t("keep")}
                                  </Button>
                                )}
                                {/* Warn: opens dialog for reason */}
                                {car.status === "ACTIVE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                    onClick={() => openWarnDialog(car.id, `${car.year} ${car.make} ${car.model}`)}
                                    disabled={moderateListing.isPending}
                                  >
                                    <AlertOctagon className="mr-1 h-3 w-3" />
                                    {t("warnDealer")}
                                  </Button>
                                )}
                                {/* Remove */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleModerate(car.id, "REMOVE")}
                                  disabled={moderateListing.isPending}
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  {t("remove")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={total}
                  pageSize={25}
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warn Dialog */}
      <Dialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warn Dealer</DialogTitle>
            <DialogDescription>
              The listing <strong>{warnCarTitle}</strong> will be moved to drafts.
              The dealer will receive a notification and can fix the issue then resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="warn-reason">What&apos;s wrong with this listing?</Label>
            <Textarea
              id="warn-reason"
              placeholder="e.g. Incorrect price, misleading photos, missing details..."
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={submitWarn}
              disabled={moderateListing.isPending}
            >
              <AlertOctagon className="mr-1 h-4 w-4" />
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
