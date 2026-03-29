"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
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
import { CAR_FEATURES } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";

/** Edit existing car listing. Pre-populated with current data. */
export default function EditListingPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const listingId = params.id as string;
  const router = useRouter();
  const t = useTranslations("dealer.addListing");
  const utils = trpc.useUtils();

  // Fetch current listing data
  const { data: car, isLoading } = trpc.cars.getById.useQuery(
    { id: listingId },
    { enabled: !!listingId, retry: false }
  );

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Sync features from loaded car data
  useEffect(() => {
    if (car?.features) {
      setSelectedFeatures((car.features as string[]) || []);
    }
  }, [car]);

  const updateMutation = trpc.cars.update.useMutation({
    onSuccess: () => {
      toast.success(t("updateSuccess"));
      utils.cars.invalidate();
      router.push(`/${locale}/dealer/listings`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update listing");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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
    updateMutation.mutate({
      carId: listingId,
      make: data.make,
      model: data.model,
      year: data.year,
      trim: data.trim,
      condition: data.condition,
      source: data.source,
      bodyType: data.bodyType,
      mileageKm: data.mileageKm,
      fuelType: data.fuelType,
      transmission: data.transmission,
      drivetrain: data.drivetrain,
      engineSize: data.engineSize,
      horsepower: data.horsepower,
      colorExterior: data.colorExterior,
      colorInterior: data.colorInterior,
      descriptionEn: data.descriptionEn,
      descriptionAr: data.descriptionAr,
      priceUsd: data.priceUsd,
      priceLbp: data.priceLbp,
      isNegotiable: data.isNegotiable,
      locationRegion: data.locationRegion,
      locationCity: data.locationCity,
      features: selectedFeatures,
      customsPaid: data.customsPaid,
      accidentHistory: data.accidentHistory,
    });
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
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
        {/* Section 1: Car Details */}
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

            <div className="space-y-2">
              <Label>Body Type *</Label>
              <Select
                value={watch("bodyType")}
                onValueChange={(v) =>
                  setValue("bodyType", v as CarListingInput["bodyType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["SEDAN", "SUV", "HATCHBACK", "PICKUP", "COUPE", "CONVERTIBLE", "VAN", "WAGON"].map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select
                value={watch("condition")}
                onValueChange={(v) =>
                  setValue("condition", v as CarListingInput["condition"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="USED">Used</SelectItem>
                  <SelectItem value="CERTIFIED_PREOWNED">Certified Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source *</Label>
              <Select
                value={watch("source")}
                onValueChange={(v) =>
                  setValue("source", v as CarListingInput["source"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">Local</SelectItem>
                  <SelectItem value="IMPORTED_USA">Imported (USA)</SelectItem>
                  <SelectItem value="IMPORTED_GULF">Imported (Gulf)</SelectItem>
                  <SelectItem value="IMPORTED_EUROPE">Imported (Europe)</SelectItem>
                  <SelectItem value="SALVAGE_REBUILT">Salvage / Rebuilt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("specifications")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mileageKm">Mileage (km) *</Label>
              <Input
                id="mileageKm"
                type="number"
                {...register("mileageKm", { valueAsNumber: true })}
              />
              {errors.mileageKm && (
                <p className="text-xs text-destructive">{errors.mileageKm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fuel Type *</Label>
              <Select
                value={watch("fuelType")}
                onValueChange={(v) =>
                  setValue("fuelType", v as CarListingInput["fuelType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Gasoline</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                  <SelectItem value="PLUG_IN_HYBRID">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transmission *</Label>
              <Select
                value={watch("transmission")}
                onValueChange={(v) =>
                  setValue("transmission", v as CarListingInput["transmission"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Drivetrain</Label>
              <Select
                value={watch("drivetrain") ?? ""}
                onValueChange={(v) =>
                  setValue("drivetrain", v as CarListingInput["drivetrain"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FWD">FWD</SelectItem>
                  <SelectItem value="RWD">RWD</SelectItem>
                  <SelectItem value="AWD">AWD</SelectItem>
                  <SelectItem value="FOUR_WD">4WD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineSize">Engine Size</Label>
              <Input id="engineSize" {...register("engineSize")} placeholder="e.g. 2.0L" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horsepower">Horsepower</Label>
              <Input
                id="horsepower"
                type="number"
                {...register("horsepower", { valueAsNumber: true })}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorExterior">Exterior Color</Label>
              <Input id="colorExterior" {...register("colorExterior")} placeholder="e.g. White" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorInterior">Interior Color</Label>
              <Input id="colorInterior" {...register("colorInterior")} placeholder="e.g. Black" />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {CAR_FEATURES.map((feature) => (
                <label
                  key={feature}
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="rounded border-input"
                  />
                  <span className="capitalize">
                    {feature.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priceUsd">Price (USD) *</Label>
              <Input
                id="priceUsd"
                type="number"
                {...register("priceUsd", { valueAsNumber: true })}
              />
              {errors.priceUsd && (
                <p className="text-xs text-destructive">{errors.priceUsd.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceLbp">Price (LBP)</Label>
              <Input
                id="priceLbp"
                type="number"
                {...register("priceLbp", { valueAsNumber: true })}
                placeholder="Auto-calculated"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={watch("isNegotiable")}
                onCheckedChange={(checked) => setValue("isNegotiable", checked)}
              />
              <Label>Negotiable</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={watch("customsPaid") ?? false}
                onCheckedChange={(checked) => setValue("customsPaid", checked)}
              />
              <Label>Customs Paid</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={watch("accidentHistory") ?? false}
                onCheckedChange={(checked) => setValue("accidentHistory", checked)}
              />
              <Label>Accident History</Label>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Description */}
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

        {/* Section 6: Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("location")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Region *</Label>
              <Select
                value={watch("locationRegion")}
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
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : t("update")}
          </Button>
        </div>
      </form>
    </div>
  );
}
