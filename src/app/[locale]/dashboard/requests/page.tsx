"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2, Search, X, Clock } from "lucide-react";
import type { Locale } from "@/i18n/config";

// ---------- Constants ----------

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2000 + 2 },
  (_, i) => 2000 + i
);

const TRANSMISSIONS = ["AUTOMATIC", "MANUAL", "CVT"] as const;

const BODY_TYPES = [
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "COUPE",
  "PICKUP",
  "VAN",
  "WAGON",
  "CONVERTIBLE",
] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  FULFILLED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// ---------- Helpers ----------

function transmissionLabel(v: string, locale: string) {
  const labels: Record<string, Record<string, string>> = {
    AUTOMATIC: { en: "Automatic", ar: "أوتوماتيك" },
    MANUAL: { en: "Manual", ar: "يدوي" },
    CVT: { en: "CVT", ar: "CVT" },
  };
  return labels[v]?.[locale] ?? v;
}

function bodyTypeLabel(v: string, locale: string) {
  const labels: Record<string, Record<string, string>> = {
    SEDAN: { en: "Sedan", ar: "سيدان" },
    SUV: { en: "SUV", ar: "SUV" },
    HATCHBACK: { en: "Hatchback", ar: "هاتشباك" },
    COUPE: { en: "Coupe", ar: "كوبيه" },
    PICKUP: { en: "Pickup", ar: "بيك أب" },
    VAN: { en: "Van", ar: "فان" },
    WAGON: { en: "Wagon", ar: "واغن" },
    CONVERTIBLE: { en: "Convertible", ar: "مكشوفة" },
  };
  return labels[v]?.[locale] ?? v;
}

// ---------- Component ----------

export default function CarRequestsPage() {
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";

  // ---- Form state ----
  const [makeSlug, setMakeSlug] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [transmission, setTransmission] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [notes, setNotes] = useState("");

  // ---- tRPC queries ----
  const utils = trpc.useUtils();

  const { data: makes, isLoading: makesLoading } =
    trpc.carMakes.list.useQuery();

  const { data: makeData } = trpc.carMakes.getBySlug.useQuery(
    { slug: makeSlug },
    { enabled: !!makeSlug }
  );

  const {
    data: myRequests,
    isLoading: requestsLoading,
  } = trpc.carRequests.listMine.useQuery();

  // ---- Mutations ----
  const createMutation = trpc.carRequests.create.useMutation({
    onSuccess: () => {
      toast.success(
        isAr
          ? "تم إرسال طلبك بنجاح! بانتظار الموافقة (عادةً أقل من 5 دقائق)"
          : "Request submitted! Awaiting approval (usually under 5 minutes)",
        { duration: 6000 }
      );
      utils.carRequests.listMine.invalidate();
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const cancelMutation = trpc.carRequests.cancel.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم إلغاء الطلب" : "Request cancelled");
      utils.carRequests.listMine.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // ---- Derived data ----
  const selectedMake = useMemo(() => {
    if (!makeSlug || !makes) return null;
    return makes.find((m) => m.slug === makeSlug) ?? null;
  }, [makeSlug, makes]);

  const models = makeData?.models ?? [];

  // ---- Handlers ----
  function resetForm() {
    setMakeSlug("");
    setModel("");
    setYearFrom("");
    setYearTo("");
    setTransmission("");
    setBodyType("");
    setNotes("");
  }

  function handleMakeChange(slug: string) {
    setMakeSlug(slug);
    setModel(""); // Reset model when make changes
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMake || !model) {
      toast.error(isAr ? "يرجى اختيار الشركة المصنعة والموديل" : "Please select a make and model");
      return;
    }
    if (!yearFrom || !yearTo) {
      toast.error(isAr ? "يرجى تحديد نطاق السنة" : "Please select year range");
      return;
    }
    if (Number(yearFrom) > Number(yearTo)) {
      toast.error(isAr ? "سنة البداية يجب أن تكون أقل من سنة النهاية" : "Year From must be less than or equal to Year To");
      return;
    }

    const makeName = isAr
      ? selectedMake.nameAr || selectedMake.nameEn
      : selectedMake.nameEn;

    createMutation.mutate({
      make: makeName,
      model,
      yearFrom: Number(yearFrom),
      yearTo: Number(yearTo),
      transmission:
        transmission && transmission !== "__any"
          ? (transmission as "AUTOMATIC" | "MANUAL" | "CVT")
          : undefined,
      bodyType:
        bodyType && bodyType !== "__any"
          ? (bodyType as
              | "SEDAN"
              | "SUV"
              | "HATCHBACK"
              | "PICKUP"
              | "COUPE"
              | "CONVERTIBLE"
              | "VAN"
              | "WAGON")
          : undefined,
      notes: notes.trim() || undefined,
    });
  }

  function handleCancel(id: string) {
    const confirmed = window.confirm(
      isAr ? "هل أنت متأكد من إلغاء هذا الطلب؟" : "Are you sure you want to cancel this request?"
    );
    if (confirmed) {
      cancelMutation.mutate({ id });
    }
  }

  // ---- Loading state ----
  if (requestsLoading) {
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
      <PageHeader
        title={isAr ? "طلبات السيارات" : "Car Requests"}
        description={
          isAr
            ? "انشر السيارة التي تبحث عنها ودع التجار يجدونها لك"
            : "Post what car you're looking for and let dealers find it for you"
        }
      />

      <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50/50 p-4">
        <p className="text-sm text-teal-800">
          {isAr
            ? "لم تجد السيارة التي تبحث عنها في نتائج البحث؟ أخبرنا بما تريد وسنعرض طلبك على الوكلاء المعتمدين ليتواصلوا معك مباشرة. يتم مراجعة الطلبات من قبل الإدارة قبل نشرها."
            : "Couldn't find the car you're looking for in our search results? Tell us what you want and we'll share your request with verified dealers who can reach out to you directly. Requests are reviewed by our team before being published."}
        </p>
      </div>

      {/* ---- Create Request Form ---- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {isAr ? "طلب جديد" : "New Request"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Make + Model */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isAr ? "الشركة المصنعة" : "Make"}</Label>
                <Select value={makeSlug} onValueChange={handleMakeChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        makesLoading
                          ? isAr
                            ? "جاري التحميل..."
                            : "Loading..."
                          : isAr
                            ? "اختر الشركة المصنعة"
                            : "Select make"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {makes?.map((make) => (
                      <SelectItem key={make.slug} value={make.slug}>
                        {isAr ? make.nameAr || make.nameEn : make.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "الموديل" : "Model"}</Label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={!makeSlug}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !makeSlug
                          ? isAr
                            ? "اختر الشركة أولاً"
                            : "Select make first"
                          : isAr
                            ? "اختر الموديل"
                            : "Select model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem
                        key={m.id}
                        value={isAr ? m.nameAr || m.nameEn : m.nameEn}
                      >
                        {isAr ? m.nameAr || m.nameEn : m.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Year From + Year To */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isAr ? "من سنة" : "Year From"}</Label>
                <Select value={yearFrom} onValueChange={setYearFrom}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isAr ? "من سنة" : "From"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "إلى سنة" : "Year To"}</Label>
                <Select value={yearTo} onValueChange={setYearTo}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isAr ? "إلى سنة" : "To"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Transmission + Body Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  {isAr ? "ناقل الحركة" : "Transmission"}{" "}
                  <span className="text-muted-foreground">
                    ({isAr ? "اختياري" : "optional"})
                  </span>
                </Label>
                <Select value={transmission} onValueChange={setTransmission}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isAr ? "أي ناقل حركة" : "Any"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">
                      {isAr ? "أي ناقل حركة" : "Any"}
                    </SelectItem>
                    {TRANSMISSIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {transmissionLabel(t, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {isAr ? "نوع الهيكل" : "Body Type"}{" "}
                  <span className="text-muted-foreground">
                    ({isAr ? "اختياري" : "optional"})
                  </span>
                </Label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isAr ? "أي نوع" : "Any"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">
                      {isAr ? "أي نوع" : "Any"}
                    </SelectItem>
                    {BODY_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bodyTypeLabel(bt, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>
                {isAr ? "ملاحظات" : "Notes"}{" "}
                <span className="text-muted-foreground">
                  ({isAr ? "اختياري" : "optional"})
                </span>
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isAr
                    ? "أي متطلبات محددة..."
                    : "Any specific requirements..."
                }
                maxLength={500}
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {isAr ? "إرسال الطلب" : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ---- My Requests List ---- */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          {isAr ? "طلباتي" : "My Requests"}
        </h2>

        {!myRequests?.length ? (
          <div className="mt-4">
            <EmptyState
              icon={Search}
              title={
                isAr
                  ? "لا توجد طلبات بعد"
                  : "No requests yet"
              }
              description={
                isAr
                  ? "أنشئ طلبك الأول أعلاه وسنبلغ التجار"
                  : "Create your first request above and we'll notify dealers"
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {myRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {req.make} {req.model}{" "}
                          {req.yearFrom === req.yearTo
                            ? req.yearFrom
                            : `${req.yearFrom}-${req.yearTo}`}
                        </h3>
                        <Badge
                          className={
                            STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-600"
                          }
                        >
                          {req.status === "ACTIVE"
                            ? isAr
                              ? "نشط"
                              : "Active"
                            : req.status === "PENDING_REVIEW"
                              ? isAr
                                ? "قيد المراجعة"
                                : "Pending Review"
                              : req.status === "EXPIRED"
                                ? isAr
                                  ? "منتهي"
                                  : "Expired"
                                : req.status === "FULFILLED"
                                  ? isAr
                                    ? "تم التلبية"
                                    : "Fulfilled"
                                  : isAr
                                    ? "ملغي"
                                    : "Cancelled"}
                        </Badge>
                      </div>

                      {/* Meta info */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {req.status === "ACTIVE" && req.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {isAr ? "ينتهي:" : "Expires:"}{" "}
                            {new Date(req.expiresAt).toLocaleDateString(
                              locale === "ar" ? "ar-LB" : "en-US"
                            )}
                          </span>
                        )}
                        {req.transmission && (
                          <span>
                            {transmissionLabel(req.transmission, locale)}
                          </span>
                        )}
                        {req.bodyType && (
                          <span>
                            {bodyTypeLabel(req.bodyType, locale)}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {req.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {req.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: cancel button */}
                    {req.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={cancelMutation.isPending}
                        onClick={() => handleCancel(req.id)}
                      >
                        <X className="me-1 h-4 w-4" />
                        {isAr ? "إلغاء" : "Cancel"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
