"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { DEALER_OFFER_EXTRAS } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

const offerSchema = z.object({
  priceOfferedUsd: z.number().positive("Price must be positive"),
  deliveryTimeDays: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type OfferFormInput = z.infer<typeof offerSchema>;

/** Submit an offer for a buyer configuration. */
export default function MakeOfferPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const configId = params.id as string;
  const router = useRouter();
  const t = useTranslations("dealer.offer");

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormInput>({
    resolver: zodResolver(offerSchema),
  });

  const createOffer = trpc.offers.create.useMutation({
    onSuccess: () => {
      toast.success(t("success"));
      router.push(`/${locale}/dealer/requests`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: OfferFormInput) => {
    createOffer.mutate({
      configurationId: configId,
      priceOfferedUsd: data.priceOfferedUsd,
      deliveryTimeDays: data.deliveryTimeDays,
      notes: data.notes,
      includedExtras: selectedExtras,
    });
  };

  const toggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra)
        ? prev.filter((e) => e !== extra)
        : [...prev, extra]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Buyer configuration summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("buyerConfig")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configuration ID: {configId}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Buyer configuration details will load from the server.
            </p>
          </CardContent>
        </Card>

        {/* Offer form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("yourOffer")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceOfferedUsd">{t("price")} *</Label>
                <Input
                  id="priceOfferedUsd"
                  type="number"
                  {...register("priceOfferedUsd", { valueAsNumber: true })}
                  placeholder="25000"
                />
                {errors.priceOfferedUsd && (
                  <p className="text-xs text-destructive">
                    {errors.priceOfferedUsd.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeDays">{t("deliveryTime")}</Label>
                <Input
                  id="deliveryTimeDays"
                  type="number"
                  {...register("deliveryTimeDays", { valueAsNumber: true })}
                  placeholder="14"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("extras")}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DEALER_OFFER_EXTRAS.map((extra) => (
                  <label
                    key={extra}
                    className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra)}
                      onChange={() => toggleExtra(extra)}
                      className="rounded border-input"
                    />
                    <span className="capitalize">{extra.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                rows={3}
                placeholder="Any additional notes for the buyer..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || createOffer.isPending}>
            {isSubmitting || createOffer.isPending ? "Submitting..." : t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
