"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Car, AlertTriangle, Star, CheckCircle, Trash2, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { formatPriceUsd } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

type ListingTab = "all" | "flagged" | "featured";

/** Admin listing moderation page with tabs for all, flagged, and featured listings. */
export default function AdminListingsPage() {
  const t = useTranslations("admin.listings");
  const [activeTab, setActiveTab] = useState<ListingTab>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.cars.list.useQuery(
    { page, limit: 25, sort: "newest" },
    { retry: false }
  );

  const cars = data?.cars ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ListingTab)}>
        <TabsList>
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="flagged">
            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
            {t("tabs.flagged")}
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="mr-1 h-3.5 w-3.5" />
            {t("tabs.featured")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            {cars.length === 0 && !isLoading ? (
              <div className="p-6">
                <EmptyState
                  icon={Car}
                  title="No listings found"
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="hidden md:table-cell">Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}>
                              <div className="h-10 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))
                      : cars.map((car) => (
                          <TableRow key={car.id}>
                            <TableCell>
                              <p className="font-medium">
                                {car.year} {car.make} {car.model}
                              </p>
                              {car.trim && (
                                <p className="text-xs text-muted-foreground">{car.trim}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{car.dealer.companyName}</p>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPriceUsd(Number(car.priceUsd))}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {car.viewsCount}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={car.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  {t("keep")}
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  {t("remove")}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <AlertOctagon className="mr-1 h-3 w-3" />
                                  {t("warnDealer")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={total}
                  pageSize={25}
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
