"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { CarCard } from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { FilterSidebar } from "@/components/cars/FilterSidebar";
import { FilterSheet } from "@/components/cars/FilterSheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, ArrowUpDown, SearchX, Search } from "lucide-react";
import type { CarFilters } from "@/types";
import type { Locale } from "@/i18n/config";

const SORT_OPTIONS = [
  { value: "newest", labelKey: "newest" },
  { value: "priceLow", labelKey: "priceLow" },
  { value: "priceHigh", labelKey: "priceHigh" },
  { value: "mileageLow", labelKey: "mileageLow" },
  { value: "yearNew", labelKey: "yearNew" },
] as const;

interface CarsSearchClientProps {
  /** Pre-applied filters (for sub-pages like /cars/new, /cars/used, /cars/[region]) */
  defaultFilters?: CarFilters;
  /** Override page title */
  title?: string;
}

export function CarsSearchClient({ defaultFilters, title }: CarsSearchClientProps) {
  const t = useTranslations("cars");
  const ts = useTranslations("cars.sort");
  const tr = useTranslations("cars.results");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse initial filters from URL
  const getInitialFilters = (): CarFilters => {
    const fromUrl: CarFilters = {
      query: searchParams.get("q") || undefined,
      make: searchParams.get("make") || undefined,
      model: searchParams.get("model") || undefined,
      condition: searchParams.get("condition") || undefined,
      bodyType: searchParams.get("bodyType") || undefined,
      fuelType: searchParams.get("fuelType") || undefined,
      transmission: searchParams.get("transmission") || undefined,
      region: searchParams.get("region") || undefined,
      source: searchParams.get("source") || undefined,
      priceFrom: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      priceTo: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      yearFrom: searchParams.get("yearFrom") ? Number(searchParams.get("yearFrom")) : undefined,
      yearTo: searchParams.get("yearTo") ? Number(searchParams.get("yearTo")) : undefined,
      sort: searchParams.get("sort") || undefined,
    };
    return { ...fromUrl, ...defaultFilters };
  };

  const [filters, setFilters] = useState<CarFilters>(getInitialFilters);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(filters.sort || "newest");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const debouncedFilters = useDebounce(filters, 300);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.query) params.set("q", debouncedFilters.query);
    if (debouncedFilters.make) params.set("make", debouncedFilters.make);
    if (debouncedFilters.model) params.set("model", debouncedFilters.model);
    if (debouncedFilters.condition && !defaultFilters?.condition) params.set("condition", debouncedFilters.condition);
    if (debouncedFilters.bodyType) params.set("bodyType", debouncedFilters.bodyType);
    if (debouncedFilters.fuelType) params.set("fuelType", debouncedFilters.fuelType);
    if (debouncedFilters.transmission) params.set("transmission", debouncedFilters.transmission);
    if (debouncedFilters.region && !defaultFilters?.region) params.set("region", debouncedFilters.region);
    if (debouncedFilters.source && !defaultFilters?.source) params.set("source", debouncedFilters.source);
    if (debouncedFilters.priceFrom) params.set("minPrice", String(debouncedFilters.priceFrom));
    if (debouncedFilters.priceTo) params.set("maxPrice", String(debouncedFilters.priceTo));
    if (debouncedFilters.yearFrom) params.set("yearFrom", String(debouncedFilters.yearFrom));
    if (debouncedFilters.yearTo) params.set("yearTo", String(debouncedFilters.yearTo));
    if (sort !== "newest") params.set("sort", sort);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debouncedFilters, sort, pathname, router, defaultFilters]);

  // tRPC query — uses Meilisearch when available, falls back to Prisma
  const { data, isLoading, isFetching } = trpc.cars.search.useQuery({
    query: debouncedFilters.query,
    make: debouncedFilters.make,
    model: debouncedFilters.model,
    condition: debouncedFilters.condition as "NEW" | "USED" | "CERTIFIED_PREOWNED" | undefined,
    bodyType: debouncedFilters.bodyType as "SEDAN" | "SUV" | "HATCHBACK" | "PICKUP" | "COUPE" | "CONVERTIBLE" | "VAN" | "WAGON" | undefined,
    fuelType: debouncedFilters.fuelType as "GASOLINE" | "DIESEL" | "HYBRID" | "ELECTRIC" | "PLUG_IN_HYBRID" | undefined,
    transmission: debouncedFilters.transmission as "AUTOMATIC" | "MANUAL" | "CVT" | undefined,
    region: debouncedFilters.region as "BEIRUT" | "MOUNT_LEBANON" | "NORTH" | "SOUTH" | "BEKAA" | "NABATIEH" | undefined,
    source: debouncedFilters.source as "LOCAL" | "IMPORTED_USA" | "IMPORTED_GULF" | "IMPORTED_EUROPE" | "SALVAGE_REBUILT" | undefined,
    priceMin: debouncedFilters.priceFrom,
    priceMax: debouncedFilters.priceTo,
    yearMin: debouncedFilters.yearFrom,
    yearMax: debouncedFilters.yearTo,
    sort: sort as "newest" | "oldest" | "priceLow" | "priceHigh" | "mileageLow" | "yearNew",
    page,
    limit: 20,
  });

  const handleFiltersChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const pageTitle = title || t("title");

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b bg-muted/30 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="mb-4 text-2xl font-bold text-charcoal sm:text-3xl">
            {pageTitle}
          </h1>
          {/* Full-text search input */}
          <div className="relative max-w-lg">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={filters.query ?? ""}
              onChange={(e) =>
                handleFiltersChange({ ...filters, query: e.target.value || undefined })
              }
              className="h-10 w-full rounded-md border border-input bg-background ps-9 pe-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            />
          </div>
        </div>
      </div>

      {/* Mobile: Sort + Filter bar */}
      <div className="sticky top-14 z-30 border-b bg-background px-4 py-2 sm:top-16 lg:hidden">
        <div className="container mx-auto flex max-w-7xl items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterSheetOpen(true)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {tc("filters")}
            {Object.values(filters).filter((v) => v !== undefined && v !== "").length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] text-white">
                {Object.values(filters).filter((v) => v !== undefined && v !== "").length}
              </span>
            )}
          </Button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            aria-label={tc("sortBy")}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {ts(option.labelKey)}
              </option>
            ))}
          </select>

          {data && (
            <span className="ms-auto text-sm text-muted-foreground">
              {tr("count", { count: data.total })}
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden w-64 flex-shrink-0 lg:block">
            <FilterSidebar
              activeFilters={filters}
              onFilterChange={handleFiltersChange}
              resultCount={data?.total}
            />
          </div>

          {/* Results area */}
          <div className="flex-1">
            {/* Desktop sort bar */}
            <div className="mb-4 hidden items-center justify-between lg:flex">
              <span className="text-sm text-muted-foreground">
                {data ? tr("count", { count: data.total }) : ""}
              </span>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  aria-label={tc("sortBy")}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {ts(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Car grid */}
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : data && data.cars.length > 0 ? (
              <>
                <div className={cn("grid gap-4 sm:grid-cols-2", isFetching && "opacity-60")}>
                  {data.cars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={{
                        id: car.id,
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        trim: car.trim,
                        priceUsd: car.priceUsd as unknown as number,
                        mileageKm: car.mileageKm,
                        bodyType: car.bodyType,
                        fuelType: car.fuelType,
                        transmission: car.transmission,
                        condition: car.condition,
                        thumbnailUrl: car.thumbnailUrl,
                        locationCity: car.locationCity,
                        locationRegion: car.locationRegion,
                        isFeatured: car.isFeatured,
                        isNegotiable: car.isNegotiable,
                        dealer: {
                          companyName: car.dealer?.companyName ?? "",
                          companyNameAr: car.dealer?.companyNameAr ?? "",
                          slug: car.dealer?.slug ?? "",
                          isVerified: car.dealer?.isVerified ?? false,
                        },
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
                      {tr("page", { current: page, total: data.totalPages })}
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
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchX className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {tr("noResults")}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {tr("noResultsSubtitle")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({})}
                >
                  {tr("clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        activeFilters={filters}
        onFilterChange={handleFiltersChange}
        resultCount={data?.total}
      />
    </div>
  );
}
