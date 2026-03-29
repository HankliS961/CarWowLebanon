"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import {
  Heart,
  MessageSquare,
  Settings2,
  Bell,
  Search,
  DollarSign,
  Car,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getNotificationHref } from "@/lib/notifications/href";

export default function DashboardPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard");
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;

  const { data: savedCars } = trpc.savedCars.list.useQuery();
  const { data: alerts } = trpc.searchAlerts.list.useQuery();
  const { data: sellListings } = trpc.sellListings.listMine.useQuery();
  const { data: inquiries } = trpc.inquiries.listMine.useQuery({ page: 1, limit: 50 });
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 5, offset: 0 });
  const { data: configurations } = trpc.configurations.listMine.useQuery();

  const utils = trpc.useUtils();

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const stats = [
    {
      icon: Heart,
      label: t("quickStats.savedCars"),
      count: savedCars?.length ?? 0,
      href: "/dashboard/saved",
      color: "text-red-500 bg-red-50",
    },
    {
      icon: MessageSquare,
      label: t("quickStats.activeInquiries"),
      count: inquiries?.filter((i) => i.status !== "CLOSED").length ?? 0,
      href: "/dashboard/inquiries",
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: DollarSign,
      label: t("selling"),
      count: sellListings?.filter((l) => l.status === "LIVE").length ?? 0,
      href: "/dashboard/selling",
      color: "text-emerald-500 bg-emerald-50",
    },
    {
      icon: Settings2,
      label: t("quickStats.activeConfigs"),
      count: configurations?.length ?? 0,
      href: "/get-offers/dashboard",
      color: "text-purple-500 bg-purple-50",
    },
    {
      icon: Bell,
      label: t("quickStats.searchAlerts"),
      count: alerts?.filter((a) => a.isActive).length ?? 0,
      href: "/dashboard/alerts",
      color: "text-amber-500 bg-amber-50",
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Welcome */}
      <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">{t("recentActivity.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications?.items && notifications.items.length > 0 ? (
            <div className="divide-y">
              {notifications.items.map((notif) => (
                <Link
                  key={notif.id}
                  href={getNotificationHref(
                    notif.type,
                    notif.data as Record<string, unknown> | null,
                    userRole,
                  )}
                  onClick={() => {
                    if (!notif.isRead) {
                      markReadMutation.mutate({ id: notif.id });
                    }
                  }}
                  className="flex items-start gap-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${!notif.isRead ? "bg-teal-50" : "bg-muted"}`}>
                    <Bell className={`h-4 w-4 ${!notif.isRead ? "text-teal-500" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium text-muted-foreground"}`}>{notif.title}</p>
                    {notif.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{notif.body}</p>
                    )}
                  </div>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        markReadMutation.mutate({ id: notif.id });
                      }}
                      disabled={markReadMutation.isPending}
                      aria-label="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {configurations && configurations.length > 0 && (
                configurations.slice(0, 3).map((config) => (
                  <Link key={config.id} href="/get-offers/dashboard" className="flex items-start gap-3 py-3 border-b last:border-0 transition-colors hover:bg-muted/50">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-50">
                      <Settings2 className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Get Offers: {config.make} {config.model} {config.year || ""}</p>
                      <p className="text-xs text-muted-foreground">{config.offers.length} offer(s) received</p>
                    </div>
                  </Link>
                ))
              )}
              {sellListings && sellListings.length > 0 && (
                sellListings.slice(0, 3).map((listing) => (
                  <Link key={listing.id} href="/dashboard/selling" className="flex items-start gap-3 py-3 border-b last:border-0 transition-colors hover:bg-muted/50">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Selling: {listing.year} {listing.make} {listing.model}</p>
                      <p className="text-xs text-muted-foreground">Status: {listing.status}</p>
                    </div>
                  </Link>
                ))
              )}
              {(!configurations || configurations.length === 0) && (!sellListings || sellListings.length === 0) && (
                <p className="py-6 text-center text-sm text-muted-foreground">{t("recentActivity.noActivity")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="h-auto justify-start p-4">
          <Link href="/cars">
            <Search className="me-3 h-5 w-5 text-teal-500" />
            <div className="text-start">
              <p className="font-semibold">{t("quickActions.searchCars")}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "تصفح جميع السيارات" : "Browse all listings"}
              </p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start p-4">
          <Link href="/get-offers">
            <Settings2 className="me-3 h-5 w-5 text-teal-500" />
            <div className="text-start">
              <p className="font-semibold">{t("quickActions.getOffers")}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "دع الوكلاء يتنافسون" : "Let dealers compete"}
              </p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start p-4">
          <Link href="/sell-my-car/valuation">
            <Car className="me-3 h-5 w-5 text-amber-500" />
            <div className="text-start">
              <p className="font-semibold">{t("quickActions.sellYourCar")}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "احصل على أفضل سعر" : "Get the best price"}
              </p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
