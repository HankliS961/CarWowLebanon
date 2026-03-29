"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, CheckCircle, XCircle, Ban, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

type DealerTab = "PENDING" | "ACTIVE" | "SUSPENDED";

/** Admin dealer management page with approval queue, active dealers, and suspended dealers. */
export default function AdminDealersPage() {
  const t = useTranslations("admin.dealers");
  const [activeTab, setActiveTab] = useState<DealerTab>("PENDING");
  const [reviewDealer, setReviewDealer] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendDealer, setSuspendDealer] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

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
                          <TableCell>
                            <StatusBadge status={dealer.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
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
    </div>
  );
}
