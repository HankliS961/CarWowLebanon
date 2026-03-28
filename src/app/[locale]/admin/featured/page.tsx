"use client";

import { useTranslations } from "next-intl";
import { Star, Plus, Trash2, Car, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

/** Admin featured management page for managing promoted listings and dealers. */
export default function AdminFeaturedPage() {
  const t = useTranslations("admin.featured");

  const { data: featuredCars, isLoading } = trpc.cars.getFeatured.useQuery(
    { limit: 20 },
    { retry: false }
  );

  const cars = featuredCars ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Featured Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("listings")}</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("addFeatured")}
          </Button>
        </CardHeader>
        <CardContent>
          {cars.length === 0 && !isLoading ? (
            <EmptyState
              icon={Star}
              title="No featured listings"
              description="Add listings to feature them on the homepage."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <div className="h-10 animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">
                          {car.year} {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.dealer.companyName}</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="mr-1 h-3 w-3" />
                            {t("remove")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Featured Dealers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("dealers")}</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("addFeatured")}
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Building2}
            title="No featured dealers"
            description="Add dealers to feature them on the homepage."
          />
        </CardContent>
      </Card>
    </div>
  );
}
