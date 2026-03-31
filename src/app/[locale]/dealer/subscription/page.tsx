"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Check, X, CreditCard, Loader2, AlertCircle, CalendarClock } from "lucide-react";
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

  // Fetch active listing count (contributes to quota)
  const { data: activeListings } = trpc.cars.listForDealer.useQuery(
    { page: 1, limit: 1, status: "ACTIVE" },
    { enabled: !!dealer }
  );

  // Fetch draft listing count (also contributes to quota)
  const { data: draftListings } = trpc.cars.listForDealer.useQuery(
    { page: 1, limit: 1, status: "DRAFT" },
    { enabled: !!dealer }
  );

  const currentTier: SubscriptionTier = (dealer?.subscriptionTier as SubscriptionTier) ?? "FREE";
  const currentLimits = TIER_LIMITS[currentTier];
  const usedListings = (activeListings?.total ?? 0) + (draftListings?.total ?? 0);
  const maxListings = currentLimits.maxListings;
  const isUnlimited = maxListings === 9999;
  const usagePercent = isUnlimited ? 0 : Math.min((usedListings / maxListings) * 100, 100);
  const isNearLimit = !isUnlimited && usagePercent >= 80;
  const isAtLimit = !isUnlimited && usedListings >= maxListings;

  const expiresAt = dealer?.subscriptionExpiresAt
    ? new Date(dealer.subscriptionExpiresAt)
    : null;
  const isExpiringSoon = useMemo(() => {
    if (!expiresAt) return false;
    const daysUntil = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 7 && daysUntil > 0;
  }, [expiresAt]);

  const tiers: SubscriptionTier[] = ["FREE", "BRONZE", "SILVER", "GOLD"];
  const tierOrder: Record<SubscriptionTier, number> = { FREE: 0, BRONZE: 1, SILVER: 2, GOLD: 3 };
  const upgradeTiers = tiers.filter((t) => tierOrder[t] > tierOrder[currentTier]);
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
      key: "buyerRequests",
      label: "Buyer Car Requests",
      getValue: (tier: SubscriptionTier) => TIER_LIMITS[tier].buyerRequests,
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
    toast.info("Contact your account manager or admin to upgrade your subscription.");
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
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
          </div>

          {/* Subscription expiration */}
          {expiresAt && (
            <div className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              isExpiringSoon
                ? "bg-amber-50 text-amber-800"
                : "bg-muted/50 text-muted-foreground"
            )}>
              <CalendarClock className="h-4 w-4 shrink-0" />
              <span>
                {isExpiringSoon ? "Expiring soon: " : "Expires: "}
                {expiresAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          )}

          {/* Usage indicators */}
          <div className="space-y-3">
            {/* Listings usage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Listings</span>
                <span className={cn(
                  "tabular-nums",
                  isAtLimit ? "font-semibold text-red-600" : isNearLimit ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {usedListings} / {isUnlimited ? "Unlimited" : maxListings} used
                </span>
              </div>
              {!isUnlimited && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isAtLimit
                        ? "bg-red-500"
                        : isNearLimit
                          ? "bg-amber-500"
                          : "bg-primary"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              )}
              {isAtLimit && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  You have reached your listing limit. Upgrade your plan to add more.
                </p>
              )}
            </div>

            {/* Feature summary for current tier */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-t pt-3 text-sm sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                {currentLimits.reverseMarketplace ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(!currentLimits.reverseMarketplace && "text-muted-foreground")}>
                  Reverse Marketplace
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {currentLimits.analytics ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(!currentLimits.analytics && "text-muted-foreground")}>
                  Advanced Analytics
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Featured:</span>
                <span className="font-medium">{currentLimits.featuredListings}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Team:</span>
                <span className="font-medium">{currentLimits.teamMembers} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                {currentLimits.buyerRequests ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(!currentLimits.buyerRequests && "text-muted-foreground")}>
                  Buyer Requests
                </span>
              </div>
            </div>
          </div>
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

      {/* Upgrade options — only tiers higher than current */}
      {upgradeTiers.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("upgrade")}</h2>
          <div className={cn(
            "grid gap-4",
            upgradeTiers.length === 1 && "max-w-md",
            upgradeTiers.length === 2 && "sm:grid-cols-2 max-w-2xl",
            upgradeTiers.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3",
          )}>
            {upgradeTiers.map((tier) => {
              const limits = TIER_LIMITS[tier];
              const currentPrice = TIER_LIMITS[currentTier].pricePerMonth;
              const diff = limits.pricePerMonth - currentPrice;
              return (
                <Card key={tier} className="relative border-primary/30">
                  <CardHeader className="pb-3">
                    <Badge className={cn("mx-auto mb-2 text-xs", tierColors[tier])}>
                      {tierNames[tier]}
                    </Badge>
                    <p className="text-center text-2xl font-bold">
                      ${limits.pricePerMonth}
                      <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span>
                    </p>
                    {diff > 0 && (
                      <p className="text-center text-xs text-muted-foreground">
                        +${diff}/mo from your current plan
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />{limits.maxListings === 9999 ? "Unlimited" : limits.maxListings} listings</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />{limits.featuredListings} featured listings</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />{limits.teamMembers} team members</p>
                    {limits.reverseMarketplace && <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />Reverse marketplace</p>}
                    {limits.buyerRequests && <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />Access buyer car requests</p>}
                    {limits.analytics && <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />Advanced analytics</p>}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleUpgrade(tier)}>
                      {t("upgrade")} to {tierNames[tier]}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {currentTier === "GOLD" && (
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardContent className="flex items-center gap-3 p-6">
            <CreditCard className="h-6 w-6 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">
              You&apos;re on the Gold plan — the highest tier. You have access to all features.
            </p>
          </CardContent>
        </Card>
      )}

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
