"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { useSellFormStore } from "@/store/sell-form-store";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { formatPriceUsd } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Car,
  ClipboardCheck,
  Camera,
  DollarSign,
  UserCheck,
  Loader2,
  Gavel,
  LogIn,
  UserPlus,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

const STEP_ICONS = [Car, ClipboardCheck, Camera, DollarSign, UserCheck];

const SOURCE_OPTIONS = [
  { value: "LOCAL", key: "sourceLocal" },
  { value: "IMPORTED_USA", key: "sourceUsa" },
  { value: "IMPORTED_GULF", key: "sourceGulf" },
  { value: "IMPORTED_EUROPE", key: "sourceEurope" },
  { value: "SALVAGE_REBUILT", key: "sourceSalvage" },
] as const;

const DAMAGE_OPTIONS = [
  { value: "scratches", key: "damageScratches" },
  { value: "dents", key: "damageDents" },
  { value: "paint", key: "damagePaint" },
  { value: "mechanical", key: "damageMechanical" },
  { value: "interior", key: "damageInterior" },
  { value: "windshield", key: "damageWindshield" },
] as const;

const YEARS = Array.from({ length: 27 }, (_, i) => String(2026 - i));

function RadioOption({
  selected,
  onClick,
  label,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-start gap-3 rounded-lg border-2 p-3 text-start transition-colors sm:p-4",
        selected
          ? "border-teal-500 bg-teal-50/50"
          : "border-muted hover:border-muted-foreground/30"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-teal-500 bg-teal-500" : "border-muted-foreground/30"
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {badge && (
            <Badge className="bg-amber-500 text-[10px] text-white">{badge}</Badge>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  );
}

export default function ValuationFormPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("sell.form");
  const router = useRouter();
  const { data: session } = useSession();
  const store = useSellFormStore();
  const utils = trpc.useUtils();

  // ── Draft persistence state ──────────────────────────────────────────
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Fetch the user's existing drafts
  const { data: drafts } = trpc.sellListings.listDrafts.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Save-draft mutation
  const saveDraftMutation = trpc.sellListings.saveDraft.useMutation({
    onSuccess: (data) => {
      if (!activeDraftId) {
        setActiveDraftId(data.id);
      }
      utils.sellListings.listDrafts.invalidate();
    },
  });

  // Load a specific draft from DB
  const { data: loadedDraft } = trpc.sellListings.getDraft.useQuery(
    { id: activeDraftId! },
    { enabled: !!activeDraftId }
  );

  // When a draft finishes loading, populate the Zustand store
  useEffect(() => {
    if (loadedDraft) {
      store.reset();
      if (loadedDraft.make) store.updateField("make", loadedDraft.make);
      if (loadedDraft.model) store.updateField("model", loadedDraft.model);
      if (loadedDraft.year) store.updateField("year", String(loadedDraft.year));
      if (loadedDraft.trim) store.updateField("trim", loadedDraft.trim);
      if (loadedDraft.mileageKm) store.updateField("mileageKm", String(loadedDraft.mileageKm));
      if (loadedDraft.source) store.updateField("source", loadedDraft.source as any);
      if (loadedDraft.accidentHistory !== undefined && loadedDraft.accidentHistory !== null)
        store.updateField("accidentHistory", loadedDraft.accidentHistory);
      if (loadedDraft.conditionDescription)
        store.updateField("additionalNotes", loadedDraft.conditionDescription);
      if (loadedDraft.conditionCheckboxes) {
        const cb = loadedDraft.conditionCheckboxes as {
          serviceRecords?: string;
          numberOfKeys?: string;
          hasDamage?: boolean;
          damageTypes?: string[];
        };
        if (cb.serviceRecords) store.updateField("serviceRecords", cb.serviceRecords as any);
        if (cb.numberOfKeys) store.updateField("numberOfKeys", cb.numberOfKeys as any);
        if (cb.hasDamage !== undefined && cb.hasDamage !== null) store.updateField("hasDamage", cb.hasDamage);
        if (cb.damageTypes) store.updateField("damageTypes", cb.damageTypes);
      }
      if (loadedDraft.images && Array.isArray(loadedDraft.images)) {
        const photos: Record<string, string> = {};
        (loadedDraft.images as string[]).forEach((url, idx) => {
          photos[`slot-${idx}`] = url;
        });
        // Set photos one-by-one via setPhoto to keep store consistent
        Object.entries(photos).forEach(([slot, url]) => store.setPhoto(slot, url));
      }
      if (loadedDraft.askingPriceUsd)
        store.updateField("askingPrice", String(loadedDraft.askingPriceUsd));
      if (loadedDraft.currentStep) store.setStep(loadedDraft.currentStep);
      if (session?.user?.id) store.updateField("userId", session.user.id);
    }
  }, [loadedDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Persist current form state to the database (only when logged in). */
  const saveCurrentDraft = (opts?: { showToast?: boolean }) => {
    if (!session?.user) return;
    saveDraftMutation.mutate(
      {
        draftId: activeDraftId || undefined,
        make: store.make || undefined,
        model: store.model || undefined,
        year: store.year ? parseInt(store.year, 10) : undefined,
        trim: store.trim || undefined,
        mileageKm: store.mileageKm ? parseInt(store.mileageKm, 10) : undefined,
        source: store.source || undefined,
        accidentHistory: store.accidentHistory ?? undefined,
        conditionCheckboxes: {
          serviceRecords: store.serviceRecords || undefined,
          numberOfKeys: store.numberOfKeys || undefined,
          hasDamage: store.hasDamage ?? undefined,
          damageTypes: store.damageTypes,
        },
        conditionDescription: store.additionalNotes || undefined,
        images: Object.values(store.photos).filter(Boolean),
        askingPriceUsd:
          store.sellingOption === "asking_price" && store.askingPrice
            ? parseFloat(store.askingPrice)
            : undefined,
        currentStep: store.currentStep,
      },
      {
        onSuccess: () => {
          if (opts?.showToast) {
            toast.success(t("draftSaved"));
          }
        },
      }
    );
  };

  /** Load a draft by id — sets activeDraftId which triggers the getDraft query. */
  const loadDraft = (draftId: string) => {
    setActiveDraftId(draftId);
  };

  // Clear draft if it belongs to a different user
  useEffect(() => {
    if (session?.user?.id) {
      if (store.userId && store.userId !== session.user.id) {
        store.reset();
        setActiveDraftId(null);
      }
      if (!store.userId) {
        store.updateField("userId", session.user.id);
      }
    }
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepLabels = [
    t("carDetails"),
    t("condition"),
    t("photos"),
    t("valuation"),
    t("account"),
  ];

  // Fetch car makes
  const { data: makes } = trpc.carMakes.list.useQuery();
  const { data: makeWithModels } = trpc.carMakes.getBySlug.useQuery(
    { slug: store.makeSlug },
    { enabled: !!store.makeSlug }
  );

  // Create listing mutation
  const createListing = trpc.sellListings.create.useMutation({
    onSuccess: () => {
      store.reset();
      setActiveDraftId(null);
      utils.sellListings.listDrafts.invalidate();
      toast.success(locale === "ar" ? "تم إرسال إعلانك بنجاح!" : "Your listing has been submitted!");
      router.push("/dashboard/selling");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const saveDraft = () => {
    saveCurrentDraft({ showToast: true });
  };

  const canProceedStep1 = store.make && store.model && store.year && store.mileageKm && store.source;
  const canProceedStep2 = store.accidentHistory !== null && store.serviceRecords && store.numberOfKeys;
  const canProceedStep3 = Object.keys(store.photos).length >= 4;
  const canProceedStep4 = store.sellingOption === "auction" || (store.sellingOption === "asking_price" && store.askingPrice);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const handleNext = () => {
    saveCurrentDraft(); // auto-save to DB on step advance
    store.nextStep();
  };

  /** Upload any data-URL photos to R2 (needed when user added photos before signing in). */
  const uploadPendingPhotos = async (): Promise<string[]> => {
    const entries = Object.entries(store.photos).filter(([, url]) => Boolean(url));
    const urls: string[] = [];

    for (const [slot, url] of entries) {
      if (url.startsWith("data:")) {
        // Convert data URL to File and upload to R2
        const res = await fetch(url);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("file", blob, `${slot}.jpg`);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Photo upload failed");
        const { url: r2Url } = await uploadRes.json();
        store.setPhoto(slot, r2Url);
        urls.push(r2Url);
      } else {
        urls.push(url);
      }
    }

    return urls;
  };

  const handleSubmit = async () => {
    // Re-upload any data URL photos to R2 first
    const hasDataUrls = Object.values(store.photos).some((url) => url.startsWith("data:"));
    let images: string[];

    if (hasDataUrls) {
      setUploadingPhotos(true);
      try {
        images = await uploadPendingPhotos();
      } catch {
        toast.error(locale === "ar" ? "فشل رفع الصور، حاول مجدداً" : "Failed to upload photos, please try again");
        setUploadingPhotos(false);
        return;
      }
      setUploadingPhotos(false);
    } else {
      images = Object.values(store.photos).filter(Boolean);
    }

    createListing.mutate({
      draftId: activeDraftId || undefined,
      make: store.make,
      model: store.model,
      year: parseInt(store.year, 10),
      trim: store.trim || undefined,
      mileageKm: parseInt(store.mileageKm, 10),
      source: store.source as "LOCAL" | "IMPORTED_USA" | "IMPORTED_GULF" | "IMPORTED_EUROPE" | "SALVAGE_REBUILT",
      accidentHistory: store.accidentHistory ?? undefined,
      conditionDescription: store.additionalNotes || undefined,
      conditionCheckboxes: store.damageTypes.length > 0 ? store.damageTypes : undefined,
      askingPriceUsd: store.sellingOption === "asking_price" ? parseFloat(store.askingPrice) : undefined,
      estimatedValueMinUsd: undefined,
      estimatedValueMaxUsd: undefined,
      images,
      isAuction: store.sellingOption === "auction",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* Header */}
      <div className="border-b bg-background px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold sm:text-2xl">
            {locale === "ar" ? "بيع سيارتك" : "Sell Your Car"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("stepOf", { current: store.currentStep, total: 5 })}
          </p>

          {/* ── Drafts picker ───────────────────────────────────── */}
          {drafts && drafts.length > 0 && !activeDraftId && (
            <div className="mb-6 mt-4">
              <h3 className="text-sm font-semibold mb-2">
                {locale === "ar" ? "متابعة مسودة" : "Continue a draft"}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => loadDraft(draft.id)}
                    className="flex-shrink-0 rounded-lg border p-3 text-start hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
                  >
                    <p className="text-sm font-medium">
                      {(draft as any).make || "Unknown"}{" "}
                      {(draft as any).model || ""}{" "}
                      {(draft as any).year || ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {locale === "ar" ? "خطوة" : "Step"}{" "}
                      {(draft as any).currentStep || 1}/5 &middot;{" "}
                      {new Date((draft as any).updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    store.reset();
                    setActiveDraftId(null);
                  }}
                  className="flex-shrink-0 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  + {locale === "ar" ? "إعلان جديد" : "New listing"}
                </button>
              </div>
            </div>
          )}

          <StepIndicator
            currentStep={store.currentStep}
            totalSteps={5}
            labels={stepLabels}
            className="mt-4"
          />
        </div>
      </div>

      {/* Form content */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* STEP 1: Car Details */}
            {store.currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">{t("carDetails")}</h2>

                {/* Make */}
                <div className="space-y-2">
                  <Label>{t("make")} *</Label>
                  <Select
                    value={store.makeSlug}
                    onValueChange={(slug) => {
                      const selected = makes?.find((m) => m.slug === slug);
                      if (selected) {
                        store.updateField("makeSlug", slug);
                        store.updateField("make", selected.nameEn);
                        store.updateField("model", "");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectMake")} />
                    </SelectTrigger>
                    <SelectContent>
                      {makes?.map((make) => (
                        <SelectItem key={make.slug} value={make.slug}>
                          {locale === "ar" ? make.nameAr : make.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label>{t("model")} *</Label>
                  <Select
                    value={store.model}
                    onValueChange={(val) => store.updateField("model", val)}
                    disabled={!store.makeSlug}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectModel")} />
                    </SelectTrigger>
                    <SelectContent>
                      {makeWithModels?.models?.map((model) => (
                        <SelectItem key={model.id} value={model.nameEn}>
                          {locale === "ar" ? model.nameAr : model.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year & Trim */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("year")} *</Label>
                    <Select
                      value={store.year}
                      onValueChange={(val) => store.updateField("year", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectYear")} />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("trim")}</Label>
                    <Input
                      value={store.trim}
                      onChange={(e) => store.updateField("trim", e.target.value)}
                      placeholder="LE, SE, XLE..."
                    />
                  </div>
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <Label>{t("mileage")} *</Label>
                  <Input
                    type="number"
                    value={store.mileageKm}
                    onChange={(e) => store.updateField("mileageKm", e.target.value)}
                    placeholder="45000"
                    min={0}
                  />
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label>{t("source")} *</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SOURCE_OPTIONS.map((opt) => (
                      <RadioOption
                        key={opt.value}
                        selected={store.source === opt.value}
                        onClick={() => store.updateField("source", opt.value)}
                        label={t(opt.key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Condition */}
            {store.currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">{t("condition")}</h2>

                {/* Accident History */}
                <div className="space-y-2">
                  <Label>{t("accidentHistory")} *</Label>
                  <div className="flex gap-3">
                    <RadioOption
                      selected={store.accidentHistory === false}
                      onClick={() => store.updateField("accidentHistory", false)}
                      label={t("accidentNo")}
                    />
                    <RadioOption
                      selected={store.accidentHistory === true}
                      onClick={() => store.updateField("accidentHistory", true)}
                      label={t("accidentYes")}
                    />
                  </div>
                  {store.accidentHistory && (
                    <Input
                      value={store.accidentDetails}
                      onChange={(e) => store.updateField("accidentDetails", e.target.value)}
                      placeholder={t("accidentDetails")}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Service Records */}
                <div className="space-y-2">
                  <Label>{t("serviceRecords")} *</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(["full", "partial", "none"] as const).map((val) => (
                      <RadioOption
                        key={val}
                        selected={store.serviceRecords === val}
                        onClick={() => store.updateField("serviceRecords", val)}
                        label={t(val === "full" ? "serviceFull" : val === "partial" ? "servicePartial" : "serviceNone")}
                      />
                    ))}
                  </div>
                </div>

                {/* Number of Keys */}
                <div className="space-y-2">
                  <Label>{t("numberOfKeys")} *</Label>
                  <div className="flex gap-3">
                    {(["1", "2"] as const).map((val) => (
                      <RadioOption
                        key={val}
                        selected={store.numberOfKeys === val}
                        onClick={() => store.updateField("numberOfKeys", val)}
                        label={val}
                      />
                    ))}
                  </div>
                </div>

                {/* Damage */}
                <div className="space-y-2">
                  <Label>{t("hasDamage")} *</Label>
                  <div className="flex gap-3">
                    <RadioOption
                      selected={store.hasDamage === false}
                      onClick={() => {
                        store.updateField("hasDamage", false);
                        store.updateField("damageTypes", []);
                      }}
                      label={locale === "ar" ? "لا" : "No"}
                    />
                    <RadioOption
                      selected={store.hasDamage === true}
                      onClick={() => store.updateField("hasDamage", true)}
                      label={locale === "ar" ? "نعم" : "Yes"}
                    />
                  </div>
                  {store.hasDamage && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">{t("damageTypes")}</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {DAMAGE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={cn(
                              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                              store.damageTypes.includes(opt.value)
                                ? "border-teal-500 bg-teal-50 text-teal-700"
                                : "border-muted text-muted-foreground hover:border-muted-foreground/30"
                            )}
                            onClick={() => store.toggleDamageType(opt.value)}
                          >
                            {t(opt.key)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label>{t("additionalNotes")}</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={store.additionalNotes}
                    onChange={(e) => store.updateField("additionalNotes", e.target.value)}
                    placeholder={t("additionalNotesPlaceholder")}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Photos */}
            {store.currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">{t("photos")}</h2>
                <PhotoUploader
                  photos={store.photos}
                  onPhotoAdd={store.setPhoto}
                  onPhotoRemove={store.removePhoto}
                  showDamageSlot={store.hasDamage === true}
                />
              </div>
            )}

            {/* STEP 4: Valuation & Pricing */}
            {store.currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("valuation")}</h2>

                {/* Let the Market Decide */}
                <div className="rounded-xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                    <Gavel className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{locale === "ar" ? "دع السوق يقرر" : "Let the Market Decide"}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {locale === "ar"
                      ? "تجار معتمدون سيقدمون عروض منافسة. ستتلقى عروض حقيقية خلال 24 ساعة."
                      : "Verified dealers will submit competing bids. You'll see real offers within 24 hours."}
                  </p>
                </div>

                {/* Selling option */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">{t("sellingOption")}</Label>
                  <div className="space-y-3">
                    <RadioOption
                      selected={store.sellingOption === "auction"}
                      onClick={() => store.updateField("sellingOption", "auction")}
                      label={t("optionAuction")}
                      description={t("optionAuctionDesc")}
                      badge={t("recommended")}
                    />
                    <RadioOption
                      selected={store.sellingOption === "asking_price"}
                      onClick={() => store.updateField("sellingOption", "asking_price")}
                      label={t("optionAskingPrice")}
                      description={t("optionAskingPriceDesc")}
                    />
                  </div>
                </div>

                {store.sellingOption === "auction" && (
                  <p className="rounded-lg bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
                    {t("auctionDuration")}
                  </p>
                )}

                {store.sellingOption === "asking_price" && (
                  <div className="space-y-2">
                    <Label>{t("askingPriceInput")}</Label>
                    <Input
                      type="number"
                      value={store.askingPrice}
                      onChange={(e) => store.updateField("askingPrice", e.target.value)}
                      placeholder="15000"
                      min={0}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Account & Submit */}
            {store.currentStep === 5 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">{t("account")}</h2>

                {!session?.user ? (
                  /* ── Not logged in: prompt to create account or sign in ── */
                  <div className="space-y-6">
                    <div className="rounded-xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                        <UserPlus className="h-6 w-6 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {locale === "ar" ? "أنشئ حسابك لنشر إعلانك" : "Create an Account to List Your Car"}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {locale === "ar"
                          ? "معلومات سيارتك محفوظة. أنشئ حساباً أو سجّل دخولك لإرسال الإعلان واستقبال عروض التجار."
                          : "Your car details are saved. Create an account or sign in to submit your listing and receive dealer offers."}
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild className="bg-teal-600 hover:bg-teal-700">
                          <a href={`/${locale}/auth/register?callbackUrl=/${locale}/sell-my-car/valuation`}>
                            <UserPlus className="me-2 h-4 w-4" />
                            {locale === "ar" ? "إنشاء حساب" : "Create Account"}
                          </a>
                        </Button>
                        <Button asChild variant="outline">
                          <a href={`/${locale}/auth/login?callbackUrl=/${locale}/sell-my-car/valuation`}>
                            <LogIn className="me-2 h-4 w-4" />
                            {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Summary (still shown so user sees their data is preserved) */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">
                        {locale === "ar" ? "ملخص الإعلان" : "Listing Summary"}
                      </h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("make")}</span>
                          <span className="font-medium">{store.make}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("model")}</span>
                          <span className="font-medium">{store.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("year")}</span>
                          <span className="font-medium">{store.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("mileage")}</span>
                          <span className="font-medium">{parseInt(store.mileageKm, 10)?.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {locale === "ar" ? "الصور" : "Photos"}
                          </span>
                          <span className="font-medium">{Object.keys(store.photos).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {locale === "ar" ? "طريقة البيع" : "Selling Method"}
                          </span>
                          <span className="font-medium">
                            {store.sellingOption === "auction" ? t("optionAuction") : formatPriceUsd(parseFloat(store.askingPrice) || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Logged in: show contact preference & submit ── */
                  <>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">{t("contactPreference")}</Label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {(["WHATSAPP", "CALL", "EMAIL"] as const).map((val) => (
                          <RadioOption
                            key={val}
                            selected={store.contactPreference === val}
                            onClick={() => store.updateField("contactPreference", val)}
                            label={t(val === "WHATSAPP" ? "contactWhatsApp" : val === "CALL" ? "contactPhone" : "contactEmail")}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">
                        {locale === "ar" ? "ملخص الإعلان" : "Listing Summary"}
                      </h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("make")}</span>
                          <span className="font-medium">{store.make}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("model")}</span>
                          <span className="font-medium">{store.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("year")}</span>
                          <span className="font-medium">{store.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("mileage")}</span>
                          <span className="font-medium">{parseInt(store.mileageKm, 10)?.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {locale === "ar" ? "الصور" : "Photos"}
                          </span>
                          <span className="font-medium">{Object.keys(store.photos).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {locale === "ar" ? "طريقة البيع" : "Selling Method"}
                          </span>
                          <span className="font-medium">
                            {store.sellingOption === "auction" ? t("optionAuction") : formatPriceUsd(parseFloat(store.askingPrice) || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {store.currentStep > 1 && (
              <Button variant="outline" onClick={store.prevStep}>
                <ArrowLeft className="me-2 h-4 w-4" />
                {locale === "ar" ? "رجوع" : "Back"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Save draft only when logged in */}
            {session?.user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={saveDraft}
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="me-2 h-4 w-4" />
                )}
                {t("saveDraft")}
              </Button>
            )}

            {store.currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (store.currentStep === 1 && !canProceedStep1) ||
                  (store.currentStep === 2 && !canProceedStep2) ||
                  (store.currentStep === 3 && !canProceedStep3) ||
                  (store.currentStep === 4 && !canProceedStep4)
                }
              >
                {locale === "ar" ? "التالي" : "Next"}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            ) : session?.user ? (
              <Button
                onClick={handleSubmit}
                disabled={createListing.isPending || uploadingPhotos}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {locale === "ar" ? "جاري رفع الصور..." : "Uploading photos..."}
                  </>
                ) : createListing.isPending ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    {t("listMyCar")}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
