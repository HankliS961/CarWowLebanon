"use client";

import { useState } from "react";
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminCarRequestsPage() {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const utils = trpc.useUtils();

  const { data: requests, isLoading } =
    trpc.admin.listCarRequestsPending.useQuery(undefined, { retry: false });

  const approveMutation = trpc.admin.approveCarRequest.useMutation({
    onSuccess: () => {
      toast.success("Request approved and dealers notified");
      utils.admin.listCarRequestsPending.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.admin.rejectCarRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected");
      utils.admin.listCarRequestsPending.invalidate();
      setRejectId(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id });
  };

  const handleReject = () => {
    if (!rejectId) return;
    rejectMutation.mutate({
      id: rejectId,
      reason: rejectReason.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Car Requests"
        description="Review and approve buyer car requests before they go live to dealers."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No pending requests"
          description="All car requests have been reviewed. New requests from buyers will appear here."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Request details */}
                  <div className="flex-1 space-y-3">
                    {/* Car info */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {request.make} {request.model}
                      </h3>
                      <Badge variant="secondary">
                        {request.yearFrom === request.yearTo
                          ? request.yearFrom
                          : `${request.yearFrom} - ${request.yearTo}`}
                      </Badge>
                      {request.transmission && (
                        <Badge variant="outline">{request.transmission}</Badge>
                      )}
                      {request.bodyType && (
                        <Badge variant="outline">
                          {request.bodyType.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>

                    {/* Buyer info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {request.buyer.name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {request.buyer.name}
                        </span>
                      )}
                      {request.buyer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {request.buyer.email}
                        </span>
                      )}
                      {request.buyer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {request.buyer.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        &ldquo;{request.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="me-1.5 h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectId(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="me-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Car Request</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)..."
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
