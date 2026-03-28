"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

interface SystemSettingsForm {
  exchangeRate: number;
  leadPricing: number;
  listingExpiry: number;
  auctionDuration: number;
  platformName: string;
  contactEmail: string;
}

/** Admin system settings page for platform configuration. */
export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SystemSettingsForm>({
    defaultValues: {
      exchangeRate: 89500,
      leadPricing: 10,
      listingExpiry: 60,
      auctionDuration: 168,
      platformName: "CarSouk",
      contactEmail: "admin@carsouk.com",
    },
  });

  const onSubmit = (data: SystemSettingsForm) => {
    // TODO: Save system settings
    toast.success(t("saveSuccess"));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Pricing & Exchange */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Exchange</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">{t("exchangeRate")}</Label>
              <Input
                id="exchangeRate"
                type="number"
                {...register("exchangeRate", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Current rate: 1 USD = X LBP
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadPricing">{t("leadPricing")}</Label>
              <Input
                id="leadPricing"
                type="number"
                step="0.01"
                {...register("leadPricing", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Listing & Auction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing & Auction Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="listingExpiry">{t("listingExpiry")}</Label>
              <Input
                id="listingExpiry"
                type="number"
                {...register("listingExpiry", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Listings expire after this many days
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auctionDuration">{t("auctionDuration")}</Label>
              <Input
                id="auctionDuration"
                type="number"
                {...register("auctionDuration", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Default auction duration in hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformName">{t("platformName")}</Label>
              <Input id="platformName" {...register("platformName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
