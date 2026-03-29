"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Eye, MessageSquare, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

type DateRange = "7" | "30" | "90";

/** Dealer analytics dashboard with KPIs, charts placeholders, and performance data. */
export default function DealerAnalyticsPage() {
  const t = useTranslations("dealer.analytics");
  const [dateRange, setDateRange] = useState<DateRange>("30");

  // Fetch dealer's listings for view/inquiry counts
  const { data: listingsData } = trpc.cars.listForDealer.useQuery(
    { page: 1, limit: 50, sort: "newest" },
    { retry: false }
  );

  // Fetch dealer inquiries
  const { data: inquiriesData } = trpc.inquiries.listForDealer.useQuery(
    { page: 1, limit: 50 },
    { retry: false }
  );

  // Calculate metrics from available data, filtered by selected date range
  const metrics = useMemo(() => {
    const allCars = listingsData?.cars ?? [];
    const allInquiries = inquiriesData ?? [];

    // Apply date range filter
    const now = new Date();
    const rangeMs = Number(dateRange) * 24 * 60 * 60 * 1000;
    const cutoff = new Date(now.getTime() - rangeMs);

    const cars = allCars.filter(
      (car) => new Date(car.createdAt) >= cutoff
    );
    const inquiries = allInquiries.filter(
      (inq) => new Date(inq.createdAt) >= cutoff
    );

    const totalViews = cars.reduce((sum, car) => sum + (car.viewsCount ?? 0), 0);
    const totalInquiries = cars.reduce((sum, car) => sum + (car.inquiriesCount ?? 0), 0);
    const conversionRate = totalViews > 0
      ? ((totalInquiries / totalViews) * 100).toFixed(1)
      : "0.0";

    // Calculate average response time from responded inquiries
    const respondedInquiries = inquiries.filter(
      (inq) => inq.status === "RESPONDED" && inq.respondedAt
    );
    let avgResponseTime = "N/A";
    if (respondedInquiries.length > 0) {
      const totalHours = respondedInquiries.reduce((sum, inq) => {
        const created = new Date(inq.createdAt).getTime();
        const responded = new Date(inq.respondedAt!).getTime();
        return sum + (responded - created) / (1000 * 60 * 60);
      }, 0);
      avgResponseTime = (totalHours / respondedInquiries.length).toFixed(1) + "h";
    }

    // Sort cars by views for top performers
    const topListings = [...cars]
      .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
      .slice(0, 5);

    return { totalViews, totalInquiries, conversionRate, avgResponseTime, topListings, filteredInquiryCount: inquiries.length };
  }, [listingsData, inquiriesData, dateRange]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["7", "30", "90"] as DateRange[]).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "7" ? t("last7days") : range === "30" ? t("last30days") : t("last90days")}
            </Button>
          ))}
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("totalViews")}
          value={metrics.totalViews.toLocaleString()}
          icon={Eye}
        />
        <MetricCard
          title={t("totalInquiries")}
          value={metrics.totalInquiries.toLocaleString()}
          icon={MessageSquare}
        />
        <MetricCard
          title={t("conversionRate")}
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
        />
        <MetricCard
          title={t("avgResponseTime")}
          value={metrics.avgResponseTime}
          icon={Clock}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("viewsOverTime")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-2 h-10 w-10" />
                <p className="text-sm">Views chart will render here</p>
                <p className="text-xs">Connect to analytics data source</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("inquiriesOverTime")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-2 h-10 w-10" />
                <p className="text-sm">Inquiries chart will render here</p>
                <p className="text-xs">Connect to analytics data source</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top performing listings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("topListings")}</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.topListings.length > 0 ? (
            <div className="space-y-3">
              {metrics.topListings.map((car, index) => (
                <div
                  key={car.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {car.year} {car.make} {car.model}
                      </p>
                      {car.trim && (
                        <p className="text-xs text-muted-foreground">{car.trim}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {(car.viewsCount ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {car.inquiriesCount ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">
                No listing data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("inquirySources")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "WhatsApp", value: "N/A", color: "bg-green-500" },
              { label: "Phone Call", value: "N/A", color: "bg-blue-500" },
              { label: "Email", value: "N/A", color: "bg-amber-500" },
              { label: "In-App", value: metrics.filteredInquiryCount.toLocaleString(), color: "bg-purple-500" },
            ].map((source) => (
              <div key={source.label} className="rounded-lg border p-4 text-center">
                <div className={`mx-auto mb-2 h-2 w-12 rounded-full ${source.color}`} />
                <p className="text-lg font-bold">{source.value}</p>
                <p className="text-xs text-muted-foreground">{source.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
