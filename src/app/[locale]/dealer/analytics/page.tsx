"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Eye, MessageSquare, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";

type DateRange = "7" | "30" | "90";

/** Dealer analytics dashboard with KPIs, charts placeholders, and performance data. */
export default function DealerAnalyticsPage() {
  const t = useTranslations("dealer.analytics");
  const [dateRange, setDateRange] = useState<DateRange>("30");

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
        <MetricCard title={t("totalViews")} value="--" icon={Eye} trend={{ value: 12, label: "" }} />
        <MetricCard title={t("totalInquiries")} value="--" icon={MessageSquare} trend={{ value: 8, label: "" }} />
        <MetricCard title={t("conversionRate")} value="--%" icon={TrendingUp} trend={{ value: 2, label: "" }} />
        <MetricCard title={t("avgResponseTime")} value="--h" icon={Clock} />
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
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Top performing listings table will render here
            </p>
          </div>
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
              { label: "WhatsApp", value: "--", color: "bg-green-500" },
              { label: "Phone Call", value: "--", color: "bg-blue-500" },
              { label: "Email", value: "--", color: "bg-amber-500" },
              { label: "In-App", value: "--", color: "bg-purple-500" },
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
