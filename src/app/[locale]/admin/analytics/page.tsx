"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Users, Building2, Car, MessageSquare, MapPin, AlertTriangle, Clock, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

/** Human-friendly region label mapping. */
const REGION_LABELS: Record<string, string> = {
  BEIRUT: "Beirut",
  MOUNT_LEBANON: "Mount Lebanon",
  NORTH: "North",
  SOUTH: "South",
  BEKAA: "Bekaa",
  NABATIEH: "Nabatieh",
};

/** Admin platform-wide analytics overview with metrics and growth charts. */
export default function AdminAnalyticsPage() {
  const t = useTranslations("admin.analytics");
  const td = useTranslations("admin.dashboard");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { retry: false });
  const { data: regionStats } = trpc.admin.getRegionStats.useQuery(undefined, { retry: false });
  const { data: marketStats } = trpc.admin.getMarketDataStats.useQuery(undefined, { retry: false });

  // Compute region bar data from real DB stats
  const regionData = useMemo(() => {
    if (!regionStats || regionStats.length === 0) return [];
    const totalCount = regionStats.reduce((sum, r) => sum + r.count, 0);
    if (totalCount === 0) return regionStats.map((r) => ({ region: REGION_LABELS[r.region] ?? r.region, pct: 0, count: r.count }));
    return regionStats
      .map((r) => ({
        region: REGION_LABELS[r.region] ?? r.region,
        pct: Math.round((r.count / totalCount) * 100),
        count: r.count,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [regionStats]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Platform Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard title={td("totalUsers")} value={stats?.users ?? "--"} icon={Users} />
        <MetricCard title={td("totalDealers")} value={stats?.dealers ?? "--"} icon={Building2} />
        <MetricCard title={td("totalListings")} value={stats?.cars ?? "--"} icon={Car} />
        <MetricCard title={td("totalInquiries")} value={stats?.inquiries ?? "--"} icon={MessageSquare} />
        <MetricCard title="Sell Listings" value={stats?.sellListings ?? "--"} icon={BarChart3} />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title={td("pendingApproval")}
          value={stats?.pendingDealers ?? "--"}
          icon={Clock}
          subtitle="Awaiting approval"
        />
        <MetricCard
          title={td("flaggedListings")}
          value={stats?.flaggedListings ?? "--"}
          icon={AlertTriangle}
          subtitle="Non-active listings"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("userGrowth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-2 h-10 w-10" />
                <p className="text-sm">User growth chart</p>
                <p className="text-xs">Connect to analytics data source</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("trafficByRegion")}</CardTitle>
          </CardHeader>
          <CardContent>
            {regionData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No listing data available
              </div>
            ) : (
              <div className="space-y-3">
                {regionData.map((item) => (
                  <div key={item.region} className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="w-32 text-sm">{item.region}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-sm font-medium">{item.count} ({item.pct}%)</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Dealers / Top Cars */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topDealers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Top dealers table will render here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topCars")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Top cars by views table will render here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data Collection */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-500" />
            Market Data Collection
          </CardTitle>
          <CardDescription>Real price data collected from platform transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total Data Points</p>
              <p className="text-2xl font-bold">{marketStats?.total ?? 0}</p>
            </div>
            {marketStats?.bySource.map((s: any) => (
              <div key={s.source} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{s.source.replace(/_/g, " ")}</p>
                <p className="text-2xl font-bold">{s.count}</p>
              </div>
            ))}
          </div>
          {marketStats?.topMakes && marketStats.topMakes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Top Makes by Data Points</p>
              <div className="flex flex-wrap gap-2">
                {marketStats.topMakes.map((m: any) => (
                  <Badge key={m.make} variant="outline">{m.make}: {m.count}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
