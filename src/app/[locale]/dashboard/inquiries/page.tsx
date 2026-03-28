"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import {
  MessageSquare,
  Search,
  Clock,
  Building2,
  ChevronRight,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

type FilterStatus = "ALL" | "NEW" | "VIEWED" | "RESPONDED" | "CONVERTED" | "CLOSED";

const STATUS_FILTERS: { value: FilterStatus; key: string }[] = [
  { value: "ALL", key: "filterAll" },
  { value: "NEW", key: "filterNew" },
  { value: "VIEWED", key: "filterViewed" },
  { value: "RESPONDED", key: "filterResponded" },
  { value: "CONVERTED", key: "filterConverted" },
  { value: "CLOSED", key: "filterClosed" },
];

export default function MyInquiriesPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.inquiriesPage");
  const td = useTranslations("dashboard");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // In production, this would be a tRPC query
  // For now, show the empty state structure
  const inquiries: Array<{
    id: string;
    carTitle: string;
    dealerName: string;
    message: string;
    status: string;
    createdAt: string;
  }> = [];

  const filteredInquiries = filter === "ALL"
    ? inquiries
    : inquiries.filter((i) => i.status === filter);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.value}
            type="button"
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === sf.value
                ? "bg-teal-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={() => setFilter(sf.value)}
          >
            {t(sf.key)}
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="mt-12 text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">{td("noInquiries")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{td("noInquiriesSubtitle")}</p>
          <Button asChild className="mt-6">
            <Link href="/cars">
              <Search className="me-2 h-4 w-4" />
              {td("browseCars")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredInquiries.map((inquiry) => {
            const statusColor = STATUS_COLORS[inquiry.status] ?? STATUS_COLORS.NEW;
            return (
              <Card key={inquiry.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{inquiry.carTitle}</p>
                      <Badge className={cn(statusColor.bg, statusColor.text, "text-[10px]")}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {inquiry.dealerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {inquiry.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {inquiry.message}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
