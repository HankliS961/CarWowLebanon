"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

interface WorkingHoursEntry {
  open: string;
  close: string;
}

interface SettingsForm {
  companyName: string;
  companyNameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  address: string;
  region: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  googleMapsUrl: string;
  brandsCarried: string;
  whatsappGreeting: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DEFAULT_WORKING_HOURS: Record<string, WorkingHoursEntry> = {
  Monday: { open: "09:00", close: "18:00" },
  Tuesday: { open: "09:00", close: "18:00" },
  Wednesday: { open: "09:00", close: "18:00" },
  Thursday: { open: "09:00", close: "18:00" },
  Friday: { open: "09:00", close: "18:00" },
  Saturday: { open: "09:00", close: "14:00" },
  Sunday: { open: "", close: "" },
};

/** Dealer settings page for managing company profile, contact details, and business info. */
export default function DealerSettingsPage() {
  const t = useTranslations("dealer.settings");
  const utils = trpc.useUtils();

  // Load current dealer profile
  const { data: dealer, isLoading: isLoadingProfile } = trpc.dealers.getMyProfile.useQuery(
    undefined,
    { retry: false }
  );

  const { register, handleSubmit, setValue, reset } = useForm<SettingsForm>();

  // Working hours state
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHoursEntry>>(
    DEFAULT_WORKING_HOURS
  );

  // Media state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate form when dealer data loads
  useEffect(() => {
    if (dealer) {
      reset({
        companyName: dealer.companyName ?? "",
        companyNameAr: dealer.companyNameAr ?? "",
        descriptionEn: dealer.descriptionEn ?? "",
        descriptionAr: dealer.descriptionAr ?? "",
        address: dealer.address ?? "",
        region: dealer.region ?? "",
        city: dealer.city ?? "",
        phone: dealer.phone ?? "",
        whatsapp: dealer.whatsappNumber ?? "",
        email: dealer.email ?? "",
        website: dealer.websiteUrl ?? "",
        instagram: dealer.instagramUrl ?? "",
        googleMapsUrl: dealer.googleMapsUrl ?? "",
        brandsCarried: Array.isArray(dealer.brandsCarried) ? (dealer.brandsCarried as string[]).join(", ") : "",
        whatsappGreeting: (dealer as any).whatsappGreeting ?? "",
      });

      // Load working hours from dealer profile if present
      if (dealer.workingHours && typeof dealer.workingHours === "object") {
        setWorkingHours((prev) => ({
          ...prev,
          ...(dealer.workingHours as unknown as Record<string, WorkingHoursEntry>),
        }));
      }

      // Load media URLs
      if (dealer.logoUrl) setLogoUrl(dealer.logoUrl);
      if (dealer.coverImageUrl) setCoverImageUrl(dealer.coverImageUrl);
    }
  }, [dealer, reset]);

  const updateProfile = trpc.dealers.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("saveSuccess"));
      utils.dealers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const handleWorkingHoursChange = (
    day: string,
    field: "open" | "close",
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleFileUpload = useCallback(
    async (
      file: File,
      setUrl: (url: string) => void,
      setUploading: (v: boolean) => void
    ) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const { url } = await response.json();
        setUrl(url);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, setLogoUrl, setUploadingLogo);
    e.target.value = "";
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, setCoverImageUrl, setUploadingCover);
    e.target.value = "";
  };

  const onSubmit = (data: SettingsForm) => {
    updateProfile.mutate({
      companyName: data.companyName || undefined,
      companyNameAr: data.companyNameAr || undefined,
      descriptionEn: data.descriptionEn || undefined,
      descriptionAr: data.descriptionAr || undefined,
      address: data.address || undefined,
      region: (data.region as "BEIRUT" | "MOUNT_LEBANON" | "NORTH" | "SOUTH" | "BEKAA" | "NABATIEH") || undefined,
      city: data.city || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      whatsappNumber: data.whatsapp || undefined,
      websiteUrl: data.website || undefined,
      instagramUrl: data.instagram || undefined,
      googleMapsUrl: data.googleMapsUrl || undefined,
      brandsCarried: data.brandsCarried
        ? data.brandsCarried.split(",").map((b: string) => b.trim()).filter(Boolean)
        : undefined,
      whatsappGreeting: data.whatsappGreeting || undefined,
      workingHours: workingHours,
      logoUrl: logoUrl || undefined,
      coverImageUrl: coverImageUrl || undefined,
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("company")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (English)</Label>
              <Input id="companyName" {...register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
              <Input id="companyNameAr" {...register("companyNameAr")} dir="rtl" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea id="descriptionEn" {...register("descriptionEn")} rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea id="descriptionAr" {...register("descriptionAr")} rows={3} dir="rtl" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                defaultValue={dealer?.region ?? undefined}
                onValueChange={(v) => setValue("region", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEIRUT">Beirut</SelectItem>
                  <SelectItem value="MOUNT_LEBANON">Mount Lebanon</SelectItem>
                  <SelectItem value="NORTH">North</SelectItem>
                  <SelectItem value="SOUTH">South</SelectItem>
                  <SelectItem value="BEKAA">Bekaa</SelectItem>
                  <SelectItem value="NABATIEH">Nabatieh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brandsCarried">Brands Carried</Label>
              <Input
                id="brandsCarried"
                {...register("brandsCarried")}
                placeholder="Toyota, BMW, Mercedes, Honda..."
              />
              <p className="text-xs text-muted-foreground">
                Separate brand names with commas. These will be shown on your profile.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="+961 XX XXX XXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" {...register("whatsapp")} placeholder="+961 XX XXX XXX" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="whatsappGreeting">WhatsApp Greeting Message</Label>
              <Input
                id="whatsappGreeting"
                {...register("whatsappGreeting")}
                placeholder="Hi, I saw your listing on CarSouk..."
              />
              <p className="text-xs text-muted-foreground">
                Custom message visitors will send when they click your WhatsApp button
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" {...register("instagram")} placeholder="@yourhandle" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
              <Input
                id="googleMapsUrl"
                {...register("googleMapsUrl")}
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste your Google Maps location link so visitors can find you easily
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("media")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
              {logoUrl ? (
                <div className="relative flex h-32 items-center justify-center rounded-lg border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Dealer logo"
                    className="h-full max-h-28 w-auto rounded object-contain p-2"
                  />
                  <button
                    type="button"
                    className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                    onClick={() => setLogoUrl(null)}
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5"
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drop logo or click to upload</p>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverSelect}
              />
              {coverImageUrl ? (
                <div className="relative flex h-32 items-center justify-center rounded-lg border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover image"
                    className="h-full w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                    onClick={() => setCoverImageUrl(null)}
                    aria-label="Remove cover image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5"
                  disabled={uploadingCover}
                >
                  {uploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drop cover image or click to upload</p>
                    </div>
                  )}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("workingHours")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium">{day}</div>
                  <Input
                    type="time"
                    className="w-32"
                    value={workingHours[day]?.open ?? "09:00"}
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "open", e.target.value)
                    }
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={workingHours[day]?.close ?? "18:00"}
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "close", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
