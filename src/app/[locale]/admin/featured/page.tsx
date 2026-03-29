"use client";

import { useTranslations } from "next-intl";
import { Star, Plus, Trash2, Car, Building2 } from "lucide-react";
import { toast } from "sonner";
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

  const utils = trpc.useUtils();

  const { data: featuredCars, isLoading } = trpc.cars.getFeatured.useQuery(
    { limit: 20 },
    { retry: false }
  );

  // Query dealers to find featured ones
  const { data: dealersData, isLoading: dealersLoading } = trpc.dealers.list.useQuery(
    { page: 1, limit: 50 },
    { retry: false }
  );

  const toggleFeatured = trpc.admin.toggleFeatured.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(variables.featured ? "Listing featured" : "Listing removed from featured");
      utils.cars.getFeatured.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleFeaturedDealer = trpc.admin.toggleFeaturedDealer.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(variables.featured ? "Dealer featured" : "Dealer removed from featured");
      utils.dealers.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cars = featuredCars ?? [];

  // Filter dealers that are featured from the dealers list
  const featuredDealers = (dealersData?.dealers ?? []).filter((d) => d.isFeatured);

  const handleRemoveFeatured = (carId: string) => {
    toggleFeatured.mutate({ carId, featured: false });
  };

  const handleRemoveFeaturedDealer = (dealerId: string) => {
    toggleFeaturedDealer.mutate({ dealerId, featured: false });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Featured Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("listings")}</CardTitle>
          <Button size="sm" onClick={() => toast.info("Select a listing from the Listings page to feature it")}>
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
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFeatured(car.id)}
                            disabled={toggleFeatured.isPending}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            {toggleFeatured.isPending ? "Removing..." : t("remove")}
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
          <Button size="sm" onClick={() => toast.info("Feature dealers from the Dealers management page")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addFeatured")}
          </Button>
        </CardHeader>
        <CardContent>
          {featuredDealers.length === 0 && !dealersLoading ? (
            <EmptyState
              icon={Building2}
              title="No featured dealers"
              description="Add dealers to feature them on the homepage."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealersLoading
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <div className="h-10 animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : featuredDealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.companyName}</TableCell>
                        <TableCell>{dealer.region.replace(/_/g, " ")}</TableCell>
                        <TableCell>{dealer._count.cars}</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFeaturedDealer(dealer.id)}
                            disabled={toggleFeaturedDealer.isPending}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            {toggleFeaturedDealer.isPending ? "Removing..." : t("remove")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
