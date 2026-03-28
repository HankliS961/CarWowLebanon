"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Users,
  Building2,
  Car,
  MessageSquare,
  AlertTriangle,
  Clock,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

/** Admin dashboard with platform-wide KPIs, pending actions, and recent activity. */
export default function AdminDashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const t = useTranslations("admin.dashboard");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { retry: false });
  const { data: logs } = trpc.admin.getLogs.useQuery(
    { page: 1, limit: 10 },
    { retry: false }
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("totalUsers")}
          value={stats?.users ?? "--"}
          icon={Users}
          subtitle={t("newThisWeek")}
        />
        <MetricCard
          title={t("totalDealers")}
          value={stats?.dealers ?? "--"}
          icon={Building2}
          subtitle={t("pendingApproval")}
        />
        <MetricCard
          title={t("totalListings")}
          value={stats?.cars ?? "--"}
          icon={Car}
          subtitle={t("activeListings")}
        />
        <MetricCard
          title={t("totalInquiries")}
          value={stats?.inquiries ?? "--"}
          icon={MessageSquare}
          subtitle={t("thisWeek")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pendingActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/${locale}/admin/dealers`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">{t("dealerApplications")}</span>
              </div>
              <Badge variant="secondary">--</Badge>
            </Link>
            <Link
              href={`/${locale}/admin/listings`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">{t("flaggedListings")}</span>
              </div>
              <Badge variant="secondary">--</Badge>
            </Link>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">{t("pendingReviews")}</span>
              </div>
              <Badge variant="secondary">--</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{log.admin.name || log.admin.email}</span>
                        {" "}
                        <span className="text-muted-foreground">{log.action}</span>
                        {log.targetType && (
                          <span className="text-muted-foreground"> on {log.targetType}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                <Clock className="mb-2 h-8 w-8" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
