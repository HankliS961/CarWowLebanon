"use client";

import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/shared/BreadcrumbNav";
import { TabNavigation, type TabItem } from "@/components/shared/TabNavigation";
import { ReviewRating } from "@/components/shared/ReviewRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { ReviewTabSlug } from "@/types/content";
import { getReviewTabs } from "@/types/content";

export interface ReviewLayoutProps {
  make: string;
  model: string;
  year: number;
  ratingOverall: number;
  priceFrom?: number;
  featuredImageUrl?: string | null;
  activeTab: ReviewTabSlug;
  children: React.ReactNode;
}

export function ReviewLayout({
  make,
  model,
  year,
  ratingOverall,
  priceFrom,
  featuredImageUrl,
  activeTab,
  children,
}: ReviewLayoutProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("reviews");

  const makeSlug = make.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = model.toLowerCase().replace(/\s+/g, "-");

  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Reviews", labelAr: "المراجعات", href: "/reviews" },
    { label: make, labelAr: make, href: `/${makeSlug}` },
    { label: `${make} ${model}`, labelAr: `${make} ${model}` },
  ];

  // Tabs
  const reviewTabs = getReviewTabs(makeSlug, modelSlug);
  const tabs: TabItem[] = reviewTabs.map((tab) => ({
    label: tab.labelEn,
    labelAr: tab.labelAr,
    href: tab.href,
    isActive: tab.slug === activeTab,
  }));

  const title = `${make} ${model} ${year}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Car Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <Image
                src={featuredImageUrl || "/images/car-placeholder.svg"}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl font-bold text-charcoal lg:text-3xl">
                {locale === "ar"
                  ? `مراجعة ${make} ${model} ${year}`
                  : `${make} ${model} Review ${year}`}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <Badge className="bg-teal-500 text-white text-lg px-3 py-1">
                  <Star className="mr-1 h-4 w-4 fill-current" />
                  {ratingOverall.toFixed(1)}/10
                </Badge>
                {priceFrom && (
                  <span className="text-muted-foreground">
                    {locale === "ar" ? "من" : "From"} ${priceFrom.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
              <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
                <Link href="/get-offers">
                  <ExternalLink className="me-2 h-4 w-4" />
                  {locale === "ar" ? "احصل على عروض" : "Get Offers"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${makeSlug}/${modelSlug}/used`}>
                  {locale === "ar" ? "عرض الصفقات" : "View Deals"}
                </Link>
              </Button>
            </div>

            {/* Quick Rating */}
            <div className="rounded-lg border bg-card p-4">
              <ReviewRating
                overall={ratingOverall}
                size="sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-background shadow-sm">
        <div className="container mx-auto px-4">
          <TabNavigation tabs={tabs} />
        </div>
      </div>

      {/* Tab Content */}
      <section className="container mx-auto px-4 py-8">
        {children}
      </section>
    </div>
  );
}

export default ReviewLayout;
