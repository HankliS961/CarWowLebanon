"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
}

/** Dealer settings page for managing company profile, contact details, and business info. */
export default function DealerSettingsPage() {
  const t = useTranslations("dealer.settings");

  const { register, handleSubmit, setValue } = useForm<SettingsForm>();

  const updateProfile = trpc.dealers.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("saveSuccess"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: SettingsForm) => {
    updateProfile.mutate({
      descriptionEn: data.descriptionEn,
      descriptionAr: data.descriptionAr,
      whatsappNumber: data.whatsapp,
      websiteUrl: data.website || undefined,
      instagramUrl: data.instagram || undefined,
    });
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
              <Select onValueChange={(v) => setValue("region", v)}>
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
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("media")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <p className="text-sm text-muted-foreground">Drop logo or click to upload</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <p className="text-sm text-muted-foreground">Drop cover image or click to upload</p>
              </div>
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
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium">{day}</div>
                  <Input type="time" className="w-32" defaultValue="09:00" />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input type="time" className="w-32" defaultValue="18:00" />
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
