"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { REGIONS } from "@/lib/constants/index";
import {
  User,
  Settings2,
  Bell,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

const NOTIFICATION_SETTINGS = [
  { key: "notifNewOffers", channels: ["email", "whatsapp", "inApp"] },
  { key: "notifNewBids", channels: ["email", "whatsapp", "inApp"] },
  { key: "notifPriceDrops", channels: ["email", "inApp"] },
  { key: "notifNewListings", channels: ["email", "inApp"] },
  { key: "notifInquiryResponses", channels: ["email", "inApp"] },
];

export default function DashboardSettingsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.settingsPage");

  const [notifPrefs, setNotifPrefs] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    NOTIFICATION_SETTINGS.forEach((ns) => {
      initial[ns.key] = {};
      ns.channels.forEach((ch) => {
        initial[ns.key][ch] = ch === "inApp"; // In-app on by default
      });
    });
    return initial;
  });

  const toggleNotif = (settingKey: string, channel: string) => {
    setNotifPrefs((prev) => ({
      ...prev,
      [settingKey]: {
        ...prev[settingKey],
        [channel]: !prev[settingKey]?.[channel],
      },
    }));
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="me-1.5 hidden h-3.5 w-3.5 sm:block" />
            {t("profile")}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm">
            <Settings2 className="me-1.5 hidden h-3.5 w-3.5 sm:block" />
            {t("preferences")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="me-1.5 hidden h-3.5 w-3.5 sm:block" />
            {t("notifications")}
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            <Shield className="me-1.5 hidden h-3.5 w-3.5 sm:block" />
            {t("security")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>{t("name")}</Label>
                <Input placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>{t("phone")}</Label>
                <Input type="tel" placeholder="+961 XX XXX XXX" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t("region")}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t("region")} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {locale === "ar" ? r.labelAr : r.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("city")}</Label>
                <Input placeholder={locale === "ar" ? "المدينة" : "City"} />
              </div>
              <Button className="mt-2">
                {locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("language")}
                </Label>
                <Select defaultValue={locale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("currency")}
                </Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="LBP">LBP (L.L.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-2">
                {locale === "ar" ? "حفظ التفضيلات" : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3">
                  <span />
                  <span className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
                    {t("channelEmail")}
                  </span>
                  <span className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
                    {t("channelWhatsApp")}
                  </span>
                  <span className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
                    {t("channelInApp")}
                  </span>
                </div>

                {NOTIFICATION_SETTINGS.map((ns) => (
                  <div
                    key={ns.key}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-sm">{t(ns.key as never)}</span>
                    {["email", "whatsapp", "inApp"].map((ch) => (
                      <div key={ch} className="flex justify-center">
                        {ns.channels.includes(ch) ? (
                          <Switch
                            checked={notifPrefs[ns.key]?.[ch] ?? false}
                            onCheckedChange={() => toggleNotif(ns.key, ch)}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Button className="mt-6">
                {locale === "ar" ? "حفظ إعدادات الإشعارات" : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("changePassword")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("currentPassword")}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{t("newPassword")}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{t("confirmNewPassword")}</Label>
                  <Input type="password" />
                </div>
                <Button>{t("updatePassword")}</Button>
              </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("connectedAccounts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                      <span className="text-lg font-bold text-red-500">G</span>
                    </div>
                    <span className="text-sm font-medium">Google</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {locale === "ar" ? "ربط" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t("deleteAccount")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("deleteAccountWarning")}</p>
                <div className="space-y-2">
                  <Label className="text-xs text-red-600">{t("confirmDeleteAccount")}</Label>
                  <Input placeholder="DELETE" />
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="me-2 h-4 w-4" />
                  {t("deleteAccount")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
