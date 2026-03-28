"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  Loader2,
  Search,
  Zap,
  Calendar,
  CalendarDays,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

const FREQUENCY_ICONS = {
  INSTANT: Zap,
  DAILY: Calendar,
  WEEKLY: CalendarDays,
};

export default function MyAlertsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.alertsPage");
  const td = useTranslations("dashboard");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState({
    make: "",
    model: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    region: "",
    bodyType: "",
    frequency: "INSTANT" as "INSTANT" | "DAILY" | "WEEKLY",
  });

  const { data: alerts, isLoading } = trpc.searchAlerts.list.useQuery();
  const { data: makes } = trpc.carMakes.list.useQuery();
  const utils = trpc.useUtils();

  const createAlert = trpc.searchAlerts.create.useMutation({
    onSuccess: () => {
      utils.searchAlerts.list.invalidate();
      setShowCreateDialog(false);
      setNewAlert({ make: "", model: "", priceFrom: "", priceTo: "", yearFrom: "", yearTo: "", region: "", bodyType: "", frequency: "INSTANT" });
      toast.success(locale === "ar" ? "تم إنشاء التنبيه" : "Alert created!");
    },
  });

  const toggleAlert = trpc.searchAlerts.toggle.useMutation({
    onSuccess: () => utils.searchAlerts.list.invalidate(),
  });

  const deleteAlert = trpc.searchAlerts.delete.useMutation({
    onSuccess: () => {
      utils.searchAlerts.list.invalidate();
      setDeleteId(null);
      toast.success(locale === "ar" ? "تم حذف التنبيه" : "Alert deleted");
    },
  });

  const handleCreate = () => {
    const filters: Record<string, string | number> = {};
    if (newAlert.make) filters.make = newAlert.make;
    if (newAlert.model) filters.model = newAlert.model;
    if (newAlert.priceFrom) filters.priceFrom = parseInt(newAlert.priceFrom, 10);
    if (newAlert.priceTo) filters.priceTo = parseInt(newAlert.priceTo, 10);
    if (newAlert.yearFrom) filters.yearFrom = parseInt(newAlert.yearFrom, 10);
    if (newAlert.yearTo) filters.yearTo = parseInt(newAlert.yearTo, 10);
    if (newAlert.region) filters.region = newAlert.region;
    if (newAlert.bodyType) filters.bodyType = newAlert.bodyType;

    createAlert.mutate({ filters, frequency: newAlert.frequency });
  };

  function formatFilters(filters: Record<string, unknown>): string {
    const parts: string[] = [];
    if (filters.make) parts.push(String(filters.make));
    if (filters.model) parts.push(String(filters.model));
    if (filters.yearFrom || filters.yearTo) {
      parts.push(`${filters.yearFrom || "..."}-${filters.yearTo || "..."}`);
    }
    if (filters.priceFrom || filters.priceTo) {
      parts.push(`$${filters.priceFrom || 0}-$${filters.priceTo || "..."}`);
    }
    if (filters.region) parts.push(String(filters.region));
    if (filters.bodyType) parts.push(String(filters.bodyType));
    return parts.length > 0 ? parts.join(", ") : locale === "ar" ? "جميع السيارات" : "All cars";
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t("createNew")}
        </Button>
      </div>

      {!alerts?.length ? (
        <div className="mt-12 text-center">
          <Bell className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">{td("noAlerts")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{td("noAlertsSubtitle")}</p>
          <Button className="mt-6" onClick={() => setShowCreateDialog(true)}>
            <Plus className="me-2 h-4 w-4" />
            {td("createAlert")}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {alerts.map((alert) => {
            const filters = (alert.filters ?? {}) as Record<string, unknown>;
            const FreqIcon = FREQUENCY_ICONS[alert.frequency];

            return (
              <Card key={alert.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                    <Search className="h-5 w-5 text-teal-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{formatFilters(filters)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FreqIcon className="h-3 w-3" />
                        {t(alert.frequency.toLowerCase() as "instant" | "daily" | "weekly")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t("lastTriggered")}:{" "}
                        {alert.lastTriggeredAt
                          ? new Date(alert.lastTriggeredAt).toLocaleDateString()
                          : t("never")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        alert.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {alert.isActive ? t("active") : t("paused")}
                    </Badge>
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert.mutate({ id: alert.id })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setDeleteId(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Alert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createTitle")}</DialogTitle>
            <DialogDescription>{t("createDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === "ar" ? "الشركة" : "Make"}</Label>
                <Select value={newAlert.make} onValueChange={(v) => setNewAlert((p) => ({ ...p, make: v }))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={locale === "ar" ? "أي شركة" : "Any make"} />
                  </SelectTrigger>
                  <SelectContent>
                    {makes?.map((m) => (
                      <SelectItem key={m.slug} value={m.nameEn}>
                        {locale === "ar" ? m.nameAr : m.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === "ar" ? "الموديل" : "Model"}</Label>
                <Input
                  className="h-9 text-xs"
                  value={newAlert.model}
                  onChange={(e) => setNewAlert((p) => ({ ...p, model: e.target.value }))}
                  placeholder={locale === "ar" ? "أي موديل" : "Any model"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === "ar" ? "السعر من" : "Price from"}</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  value={newAlert.priceFrom}
                  onChange={(e) => setNewAlert((p) => ({ ...p, priceFrom: e.target.value }))}
                  placeholder="$0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === "ar" ? "السعر إلى" : "Price to"}</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  value={newAlert.priceTo}
                  onChange={(e) => setNewAlert((p) => ({ ...p, priceTo: e.target.value }))}
                  placeholder={locale === "ar" ? "بلا حد" : "No limit"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("frequency")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["INSTANT", "DAILY", "WEEKLY"] as const).map((freq) => {
                  const Icon = FREQUENCY_ICONS[freq];
                  return (
                    <button
                      key={freq}
                      type="button"
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors",
                        newAlert.frequency === freq
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-muted text-muted-foreground hover:border-muted-foreground/30"
                      )}
                      onClick={() => setNewAlert((p) => ({ ...p, frequency: freq }))}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t(freq.toLowerCase() as "instant" | "daily" | "weekly")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleCreate} disabled={createAlert.isPending}>
              {createAlert.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("saveAlert")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteAlert.mutate({ id: deleteId })}
              disabled={deleteAlert.isPending}
            >
              {deleteAlert.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("deleteAlert")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
