"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Car,
  MessageSquare,
  Eye,
  Star,
  Plus,
  BarChart3,
  Settings,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

/** Dealer dashboard overview with KPIs, recent inquiries, buyer requests, and quick actions. */
export default function DealerDashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const t = useTranslations("dealer.dashboard");

  // Fetch dealer's inquiries for the recent list
  const { data: inquiries } = trpc.inquiries.listForDealer.useQuery(
    { page: 1, limit: 5 },
    { retry: false }
  );

  // Fetch open buyer configurations for the reverse marketplace section
  const { data: configurations } = trpc.configurations.listOpen.useQuery(
    { page: 1, limit: 3 },
    { retry: false }
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("welcome")} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("activeListings")}
          value="--"
          icon={Car}
          subtitle={t("fromLastWeek")}
          trend={{ value: 0, label: "" }}
        />
        <MetricCard
          title={t("inquiriesThisWeek")}
          value={inquiries?.length ?? "--"}
          icon={MessageSquare}
          subtitle={t("fromLastWeek")}
          trend={{ value: 12, label: "" }}
        />
        <MetricCard
          title={t("viewsThisWeek")}
          value="--"
          icon={Eye}
          subtitle={t("fromLastWeek")}
          trend={{ value: 8, label: "" }}
        />
        <MetricCard
          title={t("dealerRating")}
          value="--"
          icon={Star}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("recentInquiries")}</CardTitle>
            <Link href={`/${locale}/dealer/inquiries`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {inquiries && inquiries.length > 0 ? (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {inquiry.buyer.name || inquiry.buyer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inquiry.car.year} {inquiry.car.make} {inquiry.car.model}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inquiry.status} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                <MessageSquare className="mb-2 h-8 w-8" />
                <p className="text-sm">{t("noInquiries")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buyer Requests (Reverse Marketplace) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("buyerRequests")}</CardTitle>
            <Link href={`/${locale}/dealer/requests`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {configurations && configurations.length > 0 ? (
              <div className="space-y-3">
                {configurations.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {config.make || "Any Make"} {config.model || "Any Model"}
                        {config.year ? ` ${config.year}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Budget: ${Number(config.budgetMinUsd).toLocaleString()} - $
                        {Number(config.budgetMaxUsd).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {config._count.offers} offers
                      </Badge>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                <ShoppingBag className="mb-2 h-8 w-8" />
                <p className="text-sm">{t("noRequests")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href={`/${locale}/dealer/listings/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addListing")}
            </Button>
          </Link>
          <Link href={`/${locale}/dealer/analytics`}>
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t("viewAnalytics")}
            </Button>
          </Link>
          <Link href={`/${locale}/dealer/settings`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              {t("editProfile")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
