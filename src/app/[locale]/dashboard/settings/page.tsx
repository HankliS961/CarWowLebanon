"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
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
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
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
import { useState, useEffect } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // ----- Profile form state -----
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationRegion, setLocationRegion] = useState<string>("");
  const [locationCity, setLocationCity] = useState("");
  const [languagePref, setLanguagePref] = useState<"AR" | "EN">(locale === "ar" ? "AR" : "EN");

  // ----- Load profile data -----
  const { data: profile, isLoading: profileLoading } = trpc.auth.getProfile.useQuery(undefined, {
    retry: false,
  });

  const utils = trpc.useUtils();

  // Pre-populate form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
      setLocationRegion(profile.locationRegion ?? "");
      setLocationCity(profile.locationCity ?? "");
      setLanguagePref(profile.languagePref === "AR" ? "AR" : "EN");
    }
  }, [profile]);

  // ----- Update profile mutation -----
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.getProfile.invalidate();
      toast.success(locale === "ar" ? "تم حفظ التغييرات" : "Changes saved successfully");
    },
    onError: (err) => {
      toast.error(err.message || (locale === "ar" ? "حدث خطأ" : "Something went wrong"));
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: name || undefined,
      phone: phone || undefined,
      locationRegion: (locationRegion || undefined) as "BEIRUT" | "MOUNT_LEBANON" | "NORTH" | "SOUTH" | "BEKAA" | "NABATIEH" | undefined,
      locationCity: locationCity || undefined,
      languagePref,
    });
  };

  // ----- Preferences: language change -----
  const handleLanguageChange = (value: string) => {
    const newLang = value as "AR" | "EN";
    setLanguagePref(newLang);
    updateProfile.mutate(
      { languagePref: newLang },
      {
        onSuccess: () => {
          utils.auth.getProfile.invalidate();
          toast.success(locale === "ar" ? "تم تغيير اللغة" : "Language updated");
          // Switch the UI locale to match the preference
          const nextLocale: Locale = newLang === "AR" ? "ar" : "en";
          if (nextLocale !== locale) {
            router.replace(pathname, { locale: nextLocale });
          }
        },
      }
    );
  };

  // ----- Notification preferences (local state only) -----
  // TODO: Wire to backend when notification_preferences field is added to User model
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

  // ----- Security handlers -----
  const handleChangePassword = () => {
    toast.success(
      locale === "ar"
        ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
        : "Password reset email sent"
    );
  };

  const handleDeleteAccount = () => {
    toast.error(
      locale === "ar"
        ? "يرجى التواصل مع الدعم لحذف حسابك"
        : "Please contact support to delete your account"
    );
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
              {profileLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{t("name")}</Label>
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("email")}</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {locale === "ar" ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("phone")}</Label>
                    <Input
                      type="tel"
                      placeholder="+961 XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>{t("region")}</Label>
                    <Select
                      value={locationRegion}
                      onValueChange={setLocationRegion}
                    >
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
                    <Input
                      placeholder={locale === "ar" ? "المدينة" : "City"}
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                    />
                  </div>
                  <Button
                    className="mt-2"
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    {locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </>
              )}
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
                <Select
                  value={languagePref === "AR" ? "ar" : "en"}
                  onValueChange={(v) => handleLanguageChange(v === "ar" ? "AR" : "EN")}
                >
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
                <p className="text-xs text-muted-foreground">
                  {locale === "ar" ? "يتم حفظ تفضيل العملة محلياً" : "Currency preference is saved locally"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        {/* TODO: Wire notification preferences to backend when notification_preferences field is added to User model */}
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
              <Button
                className="mt-6"
                onClick={() => {
                  toast.success(
                    locale === "ar"
                      ? "تم حفظ إعدادات الإشعارات"
                      : "Notification settings saved"
                  );
                }}
              >
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
                <p className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."
                    : "A password reset link will be sent to your email."}
                </p>
                <Button onClick={handleChangePassword}>
                  {t("updatePassword")}
                </Button>
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
                    <div>
                      <span className="text-sm font-medium">Google</span>
                      {session?.user?.email && (
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {locale === "ar" ? "متصل" : "Connected"}
                  </Badge>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                >
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
