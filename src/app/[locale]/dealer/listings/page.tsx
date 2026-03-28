"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Upload,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatPriceUsd } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

type ListingTab = "all" | "ACTIVE" | "DRAFT" | "SOLD" | "EXPIRED";

/** Dealer listings management page with tabs, search, table view, and CRUD actions. */
export default function DealerListingsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const t = useTranslations("dealer.listings");

  const [activeTab, setActiveTab] = useState<ListingTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = trpc.cars.list.useQuery(
    { page, limit: 20, sort: "newest" },
    { retry: false }
  );

  const cars = data?.cars ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const filteredCars =
    activeTab === "all"
      ? cars
      : cars.filter((car) => car.status === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <Link href={`/${locale}/dealer/listings/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("addNew")}
          </Button>
        </Link>
      </PageHeader>

      {/* Search + CSV import */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          {t("csvImport")}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as ListingTab);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="ACTIVE">{t("tabs.active")}</TabsTrigger>
          <TabsTrigger value="DRAFT">{t("tabs.draft")}</TabsTrigger>
          <TabsTrigger value="SOLD">{t("tabs.sold")}</TabsTrigger>
          <TabsTrigger value="EXPIRED">{t("tabs.expired")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            {filteredCars.length === 0 && !isLoading ? (
              <div className="p-6">
                <EmptyState
                  icon={Car}
                  title={t("empty")}
                  description={t("emptyDescription")}
                  actionLabel={t("addNew")}
                  actionHref={`/${locale}/dealer/listings/new`}
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="hidden text-center md:table-cell">Views</TableHead>
                      <TableHead className="hidden text-center md:table-cell">Inquiries</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7}>
                              <div className="h-10 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))
                      : filteredCars.map((car) => (
                          <TableRow key={car.id}>
                            <TableCell>
                              {car.thumbnailUrl ? (
                                <img
                                  src={car.thumbnailUrl}
                                  alt={`${car.year} ${car.make} ${car.model}`}
                                  className="h-10 w-14 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                                  <Car className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">
                                {car.year} {car.make} {car.model}
                              </p>
                              {car.trim && (
                                <p className="text-xs text-muted-foreground">{car.trim}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPriceUsd(Number(car.priceUsd))}
                            </TableCell>
                            <TableCell className="hidden text-center md:table-cell">
                              {car.viewsCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden text-center md:table-cell">
                              {car.inquiriesCount}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={car.status} />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/${locale}/dealer/listings/${car.id}/edit`}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/${locale}/cars/${car.make.toLowerCase()}/${car.model.toLowerCase()}/${car.id}`}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteId(car.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Listing"
        description={t("deleteConfirm")}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => setDeleteId(null)}
      />
    </div>
  );
}
