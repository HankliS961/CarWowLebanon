"use client";

import { useTranslations } from "next-intl";
import { Check, X, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { SUBSCRIPTION_TIER, TIER_LIMITS, type SubscriptionTier } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

/** Dealer subscription management page with tier comparison and billing history. */
export default function DealerSubscriptionPage() {
  const t = useTranslations("dealer.subscription");

  // Fetch the dealer's profile to get the current subscription tier
  const { data: dealer, isLoading } = trpc.dealers.getMyProfile.useQuery(undefined, {
    retry: false,
  });

  const currentTier: SubscriptionTier = (dealer?.subscriptionTier as SubscriptionTier) ?? "FREE";

  const tiers: SubscriptionTier[] = ["FREE", "BRONZE", "SILVER", "GOLD"];
  const tierNames: Record<SubscriptionTier, string> = {
    FREE: t("tiers.free"),
    BRONZE: t("tiers.bronze"),
    SILVER: t("tiers.silver"),
    GOLD: t("tiers.gold"),
  };

  const tierColors: Record<SubscriptionTier, string> = {
    FREE: "bg-gray-100 text-gray-700",
    BRONZE: "bg-amber-100 text-amber-800",
    SILVER: "bg-slate-200 text-slate-800",
    GOLD: "bg-yellow-100 text-yellow-800",
  };

  const features = [
    {
      key: "listings",
      label: t("listings"),
      getValue: (tier: SubscriptionTier) =>
        TIER_LIMITS[tier].maxListings === 9999
          ? t("unlimited")
          : String(TIER_LIMITS[tier].maxListings),
    },
    {
      key: "reverseMarketplace",
      label: t("reverseMarketplace"),
      getValue: (tier: SubscriptionTier) => TIER_LIMITS[tier].reverseMarketplace,
    },
    {
      key: "analytics",
      label: t("advancedAnalytics"),
      getValue: (tier: SubscriptionTier) => TIER_LIMITS[tier].analytics,
    },
    {
      key: "featuredListings",
      label: t("featuredListings"),
      getValue: (tier: SubscriptionTier) => String(TIER_LIMITS[tier].featuredListings),
    },
    {
      key: "teamMembers",
      label: t("teamMembers"),
      getValue: (tier: SubscriptionTier) => String(TIER_LIMITS[tier].teamMembers),
    },
  ];

  const handleUpgrade = (tier: SubscriptionTier) => {
    toast.info(`To upgrade to ${tierNames[tier]}, please contact us at support@carsouk.com`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Current plan */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("currentPlan")}</p>
              <p className="text-lg font-bold">{tierNames[currentTier]}</p>
            </div>
          </div>
          <Badge className={cn("text-sm", tierColors[currentTier])}>
            {currentTier === "FREE" ? "Free Forever" : `$${TIER_LIMITS[currentTier as SubscriptionTier].pricePerMonth}${t("perMonth")}`}
          </Badge>
        </CardContent>
      </Card>

      {/* Tier comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("comparePlans")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Feature</TableHead>
                {tiers.map((tier) => (
                  <TableHead key={tier} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={cn("text-xs", tierColors[tier])}>
                        {tierNames[tier]}
                      </Badge>
                      <span className="text-sm font-bold">
                        {TIER_LIMITS[tier].pricePerMonth === 0
                          ? "Free"
                          : `$${TIER_LIMITS[tier].pricePerMonth}${t("perMonth")}`}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.key}>
                  <TableCell className="font-medium">{feature.label}</TableCell>
                  {tiers.map((tier) => {
                    const value = feature.getValue(tier);
                    return (
                      <TableCell key={tier} className="text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="mx-auto h-5 w-5 text-emerald" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tier cards for upgrade */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const isCurrent = tier === currentTier;
          const limits = TIER_LIMITS[tier];
          return (
            <Card
              key={tier}
              className={cn(
                "relative",
                isCurrent && "border-primary ring-1 ring-primary"
              )}
            >
              {isCurrent && (
                <Badge className="absolute -top-2.5 left-4 bg-primary">
                  Current
                </Badge>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg">
                  {tierNames[tier]}
                </CardTitle>
                <p className="text-center text-2xl font-bold">
                  {limits.pricePerMonth === 0
                    ? "Free"
                    : `$${limits.pricePerMonth}`}
                  {limits.pricePerMonth > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("perMonth")}
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{limits.maxListings === 9999 ? "Unlimited" : limits.maxListings} listings</p>
                <p>{limits.teamMembers} team members</p>
                <p>{limits.featuredListings} featured listings</p>
                {limits.reverseMarketplace && <p>Reverse marketplace access</p>}
                {limits.analytics && <p>Advanced analytics</p>}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && handleUpgrade(tier)}
                >
                  {isCurrent ? "Current Plan" : t("upgrade")}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("billingHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
            <p className="text-sm text-muted-foreground">No billing history available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
