"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { DealerCard } from "@/components/dealers/DealerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, ShieldCheck, Building2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function DealerDirectoryClient() {
  const t = useTranslations("dealers");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = trpc.dealers.list.useQuery({
    search: debouncedSearch || undefined,
    region: selectedRegion as "BEIRUT" | "MOUNT_LEBANON" | "NORTH" | "SOUTH" | "BEKAA" | "NABATIEH" | undefined,
    isVerified: verifiedOnly || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-600 to-charcoal px-4 py-12 text-white sm:py-16">
        <div className="container mx-auto max-w-7xl text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-teal-100">
            {locale === "ar"
              ? "اعثر على وكلاء سيارات موثقين في كل أنحاء لبنان"
              : "Find verified car dealers across Lebanon"}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Search + filters bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={
                locale === "ar"
                  ? "ابحث باسم الوكيل أو الموقع..."
                  : "Search by dealer name or location..."
              }
              className="ps-10"
            />
          </div>

          {/* Region filter */}
          <select
            value={selectedRegion || ""}
            onChange={(e) => {
              setSelectedRegion(e.target.value || undefined);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label={locale === "ar" ? "المنطقة" : "Region"}
          >
            <option value="">{locale === "ar" ? "كل المناطق" : "All Regions"}</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {locale === "ar" ? r.labelAr : r.labelEn}
              </option>
            ))}
          </select>

          {/* Verified toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <ShieldCheck className="h-4 w-4 text-teal-500" />
            <span className="text-foreground">{t("verified")}</span>
          </label>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center rounded-lg border bg-card p-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="mt-4 h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-20" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        ) : data && data.dealers.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} {locale === "ar" ? "وكيل" : "dealers"}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {data.dealers.map((dealer) => (
                <DealerCard
                  key={dealer.id}
                  dealer={{
                    id: dealer.id,
                    companyName: dealer.companyName,
                    companyNameAr: dealer.companyNameAr ?? "",
                    slug: dealer.slug,
                    logoUrl: dealer.logoUrl,
                    region: dealer.region,
                    city: dealer.city,
                    isVerified: dealer.isVerified,
                    isFeatured: dealer.isFeatured,
                    ratingAvg: (dealer.ratingAvg as unknown as number) || 0,
                    reviewCount: dealer.reviewCount,
                    carsCount: dealer._count?.cars ?? 0,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  {tc("previous")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                >
                  {tc("next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على وكلاء. حاول تغيير معايير البحث."
                : "No dealers found. Try adjusting your search criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
