"use client";

import { useState } from "react";
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
import { PageHeader } from "@/components/shared/page-header";
import { CAR_FEATURES } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";

/** Full car listing creation form with all sections. */
export default function NewListingPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const router = useRouter();
  const t = useTranslations("dealer.addListing");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CarListingInput>({
    resolver: zodResolver(carListingSchema),
    defaultValues: {
      condition: "USED",
      source: "LOCAL",
      bodyType: "SEDAN",
      fuelType: "GASOLINE",
      transmission: "AUTOMATIC",
      locationRegion: "BEIRUT",
      isNegotiable: false,
      features: [],
    },
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const utils = trpc.useUtils();

  const createListing = trpc.cars.create.useMutation({
    onSuccess: () => {
      toast.success(t("success"));
      utils.cars.invalidate();
      router.push(`/${locale}/dealer/listings`);
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN" && error.message.includes("listing limit")) {
        toast.error(error.message, {
          action: {
            label: "Upgrade",
            onClick: () => router.push(`/${locale}/dealer/subscription`),
          },
          duration: 8000,
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const onSubmit = (data: CarListingInput) => {
    createListing.mutate({
      ...data,
      features: selectedFeatures,
    } as Parameters<typeof createListing.mutate>[0]);
  };

  const onSaveDraft = () => {
    handleSubmit((data: CarListingInput) => {
      createListing.mutate({
        ...data,
        features: selectedFeatures,
        status: "DRAFT",
      } as Parameters<typeof createListing.mutate>[0]);
    })();
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Car Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("carDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input id="make" {...register("make")} placeholder="e.g. Toyota" />
              {errors.make && (
                <p className="text-xs text-destructive">{errors.make.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" {...register("model")} placeholder="e.g. Corolla" />
              {errors.model && (
                <p className="text-xs text-destructive">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-xs text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input id="trim" {...register("trim")} placeholder="e.g. XLE" />
            </div>

            <div className="space-y-2">
              <Label>Body Type *</Label>
              <Select
                defaultValue="SEDAN"
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
                defaultValue="USED"
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
                defaultValue="LOCAL"
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
                placeholder="50000"
              />
              {errors.mileageKm && (
                <p className="text-xs text-destructive">{errors.mileageKm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fuel Type *</Label>
              <Select
                defaultValue="GASOLINE"
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
                defaultValue="AUTOMATIC"
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
                placeholder="25000"
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
              <Textarea
                id="descriptionEn"
                {...register("descriptionEn")}
                rows={5}
                placeholder="Enter a detailed description in English..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea
                id="descriptionAr"
                {...register("descriptionAr")}
                rows={5}
                dir="rtl"
                placeholder="ادخل وصفاً مفصلاً بالعربية..."
              />
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
                defaultValue="BEIRUT"
                onValueChange={(v) =>
                  setValue("locationRegion", v as CarListingInput["locationRegion"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Input
                id="locationCity"
                {...register("locationCity")}
                placeholder="e.g. Achrafieh"
              />
              {errors.locationCity && (
                <p className="text-xs text-destructive">{errors.locationCity.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Separator />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={onSaveDraft} disabled={isSubmitting || createListing.isPending}>
            {t("saveDraft")}
          </Button>
          <Button type="submit" disabled={isSubmitting || createListing.isPending}>
            {isSubmitting || createListing.isPending ? "Creating..." : t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
