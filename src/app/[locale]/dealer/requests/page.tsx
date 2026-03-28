"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingBag, Clock, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { trpc } from "@/lib/trpc/client";

/** Buyer requests page showing open configurations from the reverse marketplace. */
export default function DealerRequestsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const t = useTranslations("dealer.requests");

  const { data: configurations, isLoading } = trpc.configurations.listOpen.useQuery(
    { page: 1, limit: 20 },
    { retry: false }
  );

  const configList = configurations ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {configList.length === 0 && !isLoading ? (
        <EmptyState
          icon={ShoppingBag}
          title={t("empty")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))
            : configList.map((config) => (
                <Card key={config.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {config.make || "Any Make"} {config.model || "Any Model"}
                        </h3>
                        {config.year && (
                          <p className="text-sm text-muted-foreground">
                            Year: {config.year}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {config._count.offers} {t("offersSubmitted")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {t("budget")}: ${Number(config.budgetMinUsd).toLocaleString()} - $
                        {Number(config.budgetMaxUsd).toLocaleString()}
                      </span>
                    </div>
                    {config.locationRegion && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{config.locationRegion.replace(/_/g, " ")}</span>
                      </div>
                    )}
                    {config.expiresAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("expires")}: {new Date(config.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {config.featuresWanted && (config.featuresWanted as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(config.featuresWanted as string[]).slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs capitalize">
                            {feature.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {(config.featuresWanted as string[]).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(config.featuresWanted as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/${locale}/dealer/requests/${config.id}/offer`}
                      className="w-full"
                    >
                      <Button className="w-full">{t("submitOffer")}</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
        </div>
      )}
    </div>
  );
}
