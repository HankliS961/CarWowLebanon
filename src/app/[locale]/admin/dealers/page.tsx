"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, CheckCircle, XCircle, Ban, FileText, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

type DealerTab = "PENDING" | "ACTIVE" | "SUSPENDED";
type SubscriptionTier = "FREE" | "BRONZE" | "SILVER" | "GOLD";

const TIER_STYLES: Record<SubscriptionTier, string> = {
  FREE: "border-muted-foreground/40 text-muted-foreground bg-transparent",
  BRONZE: "border-amber-700/40 text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30",
  SILVER: "border-slate-400/40 text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/30",
  GOLD: "border-yellow-500/40 text-yellow-800 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-950/30",
};

function TierBadge({ tier }: { tier: SubscriptionTier }) {
  return (
    <Badge variant="outline" className={TIER_STYLES[tier]}>
      {tier}
    </Badge>
  );
}

/** Admin dealer management page with approval queue, active dealers, and suspended dealers. */
export default function AdminDealersPage() {
  const t = useTranslations("admin.dealers");
  const [activeTab, setActiveTab] = useState<DealerTab>("PENDING");
  const [reviewDealer, setReviewDealer] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendDealer, setSuspendDealer] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [tierDealer, setTierDealer] = useState<string | null>(null);
  const [tierValue, setTierValue] = useState<SubscriptionTier>("FREE");
  const [tierExpiry, setTierExpiry] = useState("");

  const utils = trpc.useUtils();

  const { data: dealersData, isLoading } = trpc.admin.listAllDealers.useQuery(
    { page: 1, limit: 50 },
    { retry: false }
  );

  const verifyDealer = trpc.admin.verifyDealer.useMutation({
    onSuccess: () => {
      toast.success(t("approveSuccess"));
      utils.admin.listAllDealers.invalidate();
      setReviewDealer(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectDealerMutation = trpc.admin.rejectDealer.useMutation({
    onSuccess: () => {
      toast.success(t("rejectSuccess"));
      utils.admin.listAllDealers.invalidate();
      setReviewDealer(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const suspendDealerMutation = trpc.admin.suspendDealer.useMutation({
    onSuccess: () => {
      toast.success("Dealer suspended successfully");
      utils.admin.listAllDealers.invalidate();
      setSuspendDealer(null);
      setSuspendReason("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setDealerTierMutation = trpc.admin.setDealerTier.useMutation({
    onSuccess: () => {
      toast.success("Subscription tier updated");
      utils.admin.listAllDealers.invalidate();
      setTierDealer(null);
      setTierValue("FREE");
      setTierExpiry("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const allDealers = dealersData?.dealers ?? [];

  // Filter dealers by tab status
  const dealerList = allDealers.filter((dealer) => dealer.status === activeTab);

  const handleApprove = (dealerId: string) => {
    verifyDealer.mutate({ dealerId });
  };

  const handleReject = () => {
    if (!reviewDealer || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectDealerMutation.mutate({ dealerId: reviewDealer, reason: rejectReason });
  };

  const handleSuspend = () => {
    if (!suspendDealer || !suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    suspendDealerMutation.mutate({ dealerId: suspendDealer, reason: suspendReason });
  };

  const openTierDialog = (dealerId: string, currentTier: SubscriptionTier) => {
    setTierDealer(dealerId);
    setTierValue(currentTier);
    setTierExpiry("");
  };

  const handleSetTier = () => {
    if (!tierDealer) return;
    setDealerTierMutation.mutate({
      dealerId: tierDealer,
      tier: tierValue,
      expiresAt: tierExpiry || null,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DealerTab)}>
        <TabsList>
          <TabsTrigger value="PENDING">{t("tabs.pending")}</TabsTrigger>
          <TabsTrigger value="ACTIVE">{t("tabs.active")}</TabsTrigger>
          <TabsTrigger value="SUSPENDED">{t("tabs.suspended")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            {dealerList.length === 0 && !isLoading ? (
              <div className="p-6">
                <EmptyState
                  icon={Building2}
                  title="No dealers found"
                  description={`No ${activeTab.toLowerCase()} dealers at the moment.`}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="hidden md:table-cell">Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Listings</TableHead>
                    <TableHead className="hidden lg:table-cell">Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <div className="h-10 animate-pulse rounded bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))
                    : dealerList.map((dealer) => (
                        <TableRow key={dealer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{dealer.companyName}</p>
                              <p className="text-xs text-muted-foreground">
                                {dealer.companyNameAr}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {dealer.region.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {Number(dealer.ratingAvg).toFixed(1)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dealer._count.cars}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <TierBadge tier={dealer.subscriptionTier as SubscriptionTier} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={dealer.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {activeTab === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(dealer.id)}
                                    disabled={verifyDealer.isPending}
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    {t("approve")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setReviewDealer(dealer.id)}
                                  >
                                    <XCircle className="mr-1 h-3 w-3" />
                                    {t("reject")}
                                  </Button>
                                </>
                              )}
                              {activeTab === "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSuspendDealer(dealer.id)}
                                  disabled={suspendDealerMutation.isPending}
                                >
                                  <Ban className="mr-1 h-3 w-3" />
                                  {t("suspend")}
                                </Button>
                              )}
                              {activeTab === "SUSPENDED" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(dealer.id)}
                                  disabled={verifyDealer.isPending}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Reactivate
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openTierDialog(
                                    dealer.id,
                                    dealer.subscriptionTier as SubscriptionTier,
                                  )
                                }
                              >
                                <Crown className="mr-1 h-3 w-3" />
                                Set Tier
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={!!reviewDealer} onOpenChange={(open) => !open && setReviewDealer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("reject")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("rejectReason")}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDealer(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectDealerMutation.isPending || !rejectReason.trim()}
            >
              {rejectDealerMutation.isPending ? "Rejecting..." : t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend dialog */}
      <Dialog open={!!suspendDealer} onOpenChange={(open) => !open && setSuspendDealer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Dealer</DialogTitle>
          </DialogHeader>
          <Textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Reason for suspension..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDealer(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspendDealerMutation.isPending || !suspendReason.trim()}
            >
              {suspendDealerMutation.isPending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Tier dialog */}
      <Dialog
        open={!!tierDealer}
        onOpenChange={(open) => {
          if (!open) {
            setTierDealer(null);
            setTierValue("FREE");
            setTierExpiry("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Subscription Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tier-select">Tier</Label>
              <Select
                value={tierValue}
                onValueChange={(v) => setTierValue(v as SubscriptionTier)}
              >
                <SelectTrigger id="tier-select">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="BRONZE">BRONZE</SelectItem>
                  <SelectItem value="SILVER">SILVER</SelectItem>
                  <SelectItem value="GOLD">GOLD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-expiry">Expiration (optional)</Label>
              <Input
                id="tier-expiry"
                type="date"
                value={tierExpiry}
                onChange={(e) => setTierExpiry(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDealer(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSetTier}
              disabled={setDealerTierMutation.isPending}
            >
              {setDealerTierMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
