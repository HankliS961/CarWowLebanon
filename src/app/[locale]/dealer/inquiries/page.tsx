"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

type InquiryTab = "all" | "NEW" | "VIEWED" | "RESPONDED" | "CONVERTED" | "CLOSED";

/** Dealer inquiry inbox with filtering, status management, and reply functionality. */
export default function DealerInquiriesPage() {
  const t = useTranslations("dealer.inquiries");
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<InquiryTab>("all");
  const [page, setPage] = useState(1);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [viewInquiry, setViewInquiry] = useState<any>(null);

  const statusFilter = activeTab === "all" ? undefined : activeTab;

  const { data: inquiries, isLoading } = trpc.inquiries.listForDealer.useQuery(
    { page, limit: 20, status: statusFilter as "NEW" | "VIEWED" | "RESPONDED" | "CONVERTED" | "CLOSED" | undefined },
    { retry: false }
  );

  const inquiryList = inquiries ?? [];

  const markViewedMutation = trpc.inquiries.markViewed.useMutation({
    onSuccess: () => {
      toast.success("Inquiry marked as viewed");
      utils.inquiries.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark inquiry as viewed");
    },
  });

  const respondMutation = trpc.inquiries.respond.useMutation({
    onSuccess: () => {
      toast.success("Response sent successfully");
      utils.inquiries.invalidate();
      setReplyTo(null);
      setReplyText("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send response");
    },
  });

  const handleMarkViewed = (inquiryId: string) => {
    markViewedMutation.mutate({ inquiryId });
  };

  const handleSendResponse = () => {
    if (!replyText.trim() || !replyTo) return;
    respondMutation.mutate({
      inquiryId: replyTo,
      response: replyText,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as InquiryTab);
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="NEW">{t("tabs.new")}</TabsTrigger>
          <TabsTrigger value="VIEWED">{t("tabs.viewed")}</TabsTrigger>
          <TabsTrigger value="RESPONDED">{t("tabs.responded")}</TabsTrigger>
          <TabsTrigger value="CONVERTED">{t("tabs.converted")}</TabsTrigger>
          <TabsTrigger value="CLOSED">{t("tabs.closed")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            {inquiryList.length === 0 && !isLoading ? (
              <div className="p-6">
                <EmptyState
                  icon={MessageSquare}
                  title={t("empty")}
                  description={t("emptyDescription")}
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead className="hidden md:table-cell">Message</TableHead>
                      <TableHead>Date</TableHead>
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
                      : inquiryList.map((inquiry) => (
                          <TableRow
                            key={inquiry.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setViewInquiry(inquiry)}
                          >
                            <TableCell>
                              <p className="font-medium">
                                {inquiry.buyer.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {inquiry.buyer.email}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {inquiry.car.year} {inquiry.car.make} {inquiry.car.model}
                              </p>
                            </TableCell>
                            <TableCell className="hidden max-w-[200px] md:table-cell">
                              <p className="truncate text-sm text-muted-foreground">
                                {inquiry.message ?? "No message"}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={inquiry.status} />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                {inquiry.status === "NEW" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkViewed(inquiry.id)}
                                    disabled={markViewedMutation.isPending}
                                  >
                                    {t("markViewed")}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => setReplyTo(inquiry.id)}
                                >
                                  {t("respond")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                <DataTablePagination
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil(inquiryList.length / 20))}
                  onPageChange={setPage}
                  totalItems={inquiryList.length}
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* View inquiry detail dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={(open) => !open && setViewInquiry(null)}>
        <DialogContent className="max-w-lg">
          {viewInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewInquiry.car.year} {viewInquiry.car.make} {viewInquiry.car.model}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Buyer info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{viewInquiry.buyer.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{viewInquiry.buyer.email}</p>
                  </div>
                  <StatusBadge status={viewInquiry.status} />
                </div>

                <hr />

                {/* Full message */}
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Buyer Message</p>
                  <div className="mt-1 rounded-md bg-muted/50 p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {viewInquiry.message || "No message provided"}
                    </p>
                  </div>
                </div>

                {/* Contact preference */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Preferred contact: <strong>{viewInquiry.preferredContact}</strong></span>
                  <span>{new Date(viewInquiry.createdAt).toLocaleString()}</span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 pt-2">
                  {viewInquiry.status === "NEW" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleMarkViewed(viewInquiry.id);
                        setViewInquiry(null);
                      }}
                      disabled={markViewedMutation.isPending}
                    >
                      {t("markViewed")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setReplyTo(viewInquiry.id);
                      setViewInquiry(null);
                    }}
                  >
                    <Send className="me-2 h-4 w-4" />
                    {t("respond")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply dialog */}
      <Dialog open={!!replyTo} onOpenChange={(open) => !open && setReplyTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("respond")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t("responsePlaceholder")}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={!replyText.trim() || respondMutation.isPending}
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
