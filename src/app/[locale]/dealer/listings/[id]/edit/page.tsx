"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { carListingSchema, type CarListingInput } from "@/lib/validations/car";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

/** Edit existing car listing. Pre-populated with current data. */
export default function EditListingPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const listingId = params.id as string;
  const router = useRouter();
  const t = useTranslations("dealer.addListing");

  // Fetch current listing data
  const { data: car, isLoading } = trpc.cars.getById.useQuery(
    { id: listingId },
    { enabled: !!listingId, retry: false }
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CarListingInput>({
    resolver: zodResolver(carListingSchema),
    values: car
      ? {
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim ?? undefined,
          condition: car.condition as CarListingInput["condition"],
          source: car.source as CarListingInput["source"],
          bodyType: car.bodyType as CarListingInput["bodyType"],
          mileageKm: car.mileageKm,
          fuelType: car.fuelType as CarListingInput["fuelType"],
          transmission: car.transmission as CarListingInput["transmission"],
          drivetrain: car.drivetrain as CarListingInput["drivetrain"],
          engineSize: car.engineSize ?? undefined,
          horsepower: car.horsepower ?? undefined,
          colorExterior: car.colorExterior ?? undefined,
          colorInterior: car.colorInterior ?? undefined,
          descriptionEn: car.descriptionEn ?? undefined,
          descriptionAr: car.descriptionAr ?? undefined,
          priceUsd: Number(car.priceUsd),
          priceLbp: car.priceLbp ? Number(car.priceLbp) : undefined,
          isNegotiable: car.isNegotiable,
          locationRegion: car.locationRegion as CarListingInput["locationRegion"],
          locationCity: car.locationCity,
          features: (car.features as string[]) || [],
          customsPaid: car.customsPaid ?? undefined,
          accidentHistory: car.accidentHistory ?? undefined,
        }
      : undefined,
  });

  const onSubmit = (data: CarListingInput) => {
    // TODO: Call update mutation
    toast.success(t("updateSuccess"));
    router.push(`/${locale}/dealer/listings`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center py-16">
        <h2 className="text-lg font-semibold">Listing not found</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/${locale}/dealer/listings`)}
        >
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("editTitle")}
        description={`${car.year} ${car.make} ${car.model}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Car Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("carDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input id="make" {...register("make")} />
              {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" {...register("model")} />
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input id="trim" {...register("trim")} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priceUsd">Price (USD) *</Label>
              <Input id="priceUsd" type="number" {...register("priceUsd", { valueAsNumber: true })} />
              {errors.priceUsd && <p className="text-xs text-destructive">{errors.priceUsd.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileageKm">Mileage (km) *</Label>
              <Input id="mileageKm" type="number" {...register("mileageKm", { valueAsNumber: true })} />
              {errors.mileageKm && <p className="text-xs text-destructive">{errors.mileageKm.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("description")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea id="descriptionEn" {...register("descriptionEn")} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea id="descriptionAr" {...register("descriptionAr")} rows={5} dir="rtl" />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("location")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Region *</Label>
              <Select
                defaultValue={car.locationRegion}
                onValueChange={(v) => setValue("locationRegion", v as CarListingInput["locationRegion"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEIRUT">Beirut</SelectItem>
                  <SelectItem value="MOUNT_LEBANON">Mount Lebanon</SelectItem>
                  <SelectItem value="NORTH">North</SelectItem>
                  <SelectItem value="SOUTH">South</SelectItem>
                  <SelectItem value="BEKAA">Bekaa</SelectItem>
                  <SelectItem value="NABATIEH">Nabatieh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationCity">City *</Label>
              <Input id="locationCity" {...register("locationCity")} />
              {errors.locationCity && <p className="text-xs text-destructive">{errors.locationCity.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : t("update")}
          </Button>
        </div>
      </form>
    </div>
  );
}
