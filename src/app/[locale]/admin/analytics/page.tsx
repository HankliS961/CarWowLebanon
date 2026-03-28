"use client";

import { useTranslations } from "next-intl";
import { BarChart3, Users, Building2, Car, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

/** Admin platform-wide analytics overview with metrics and growth charts. */
export default function AdminAnalyticsPage() {
  const t = useTranslations("admin.analytics");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { retry: false });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Platform Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Users" value={stats?.users ?? "--"} icon={Users} />
        <MetricCard title="Dealers" value={stats?.dealers ?? "--"} icon={Building2} />
        <MetricCard title="Listings" value={stats?.cars ?? "--"} icon={Car} />
        <MetricCard title="Inquiries" value={stats?.inquiries ?? "--"} icon={MessageSquare} />
        <MetricCard title="Sell Listings" value={stats?.sellListings ?? "--"} icon={BarChart3} />
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
            <div className="space-y-3">
              {[
                { region: "Beirut", pct: 35 },
                { region: "Mount Lebanon", pct: 28 },
                { region: "North", pct: 15 },
                { region: "South", pct: 10 },
                { region: "Bekaa", pct: 8 },
                { region: "Nabatieh", pct: 4 },
              ].map((item) => (
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
                  <span className="w-10 text-right text-sm font-medium">{item.pct}%</span>
                </div>
              ))}
            </div>
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
    </div>
  );
}
