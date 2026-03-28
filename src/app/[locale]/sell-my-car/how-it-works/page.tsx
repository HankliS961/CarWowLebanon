"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Car,
  Camera,
  TrendingUp,
  Gavel,
  ThumbsUp,
  Truck,
  ArrowRight,
  Play,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

const STEPS = [
  { icon: Car, color: "bg-teal-500", num: "1" },
  { icon: Camera, color: "bg-blue-500", num: "2" },
  { icon: TrendingUp, color: "bg-amber-500", num: "3" },
  { icon: Gavel, color: "bg-purple-500", num: "4" },
  { icon: ThumbsUp, color: "bg-emerald-500", num: "5" },
  { icon: Truck, color: "bg-orange-500", num: "6" },
];

export default function SellHowItWorksPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("sell.howItWorks");

  const stepKeys = ["step1", "step2", "step3", "step4", "step5", "step6"] as const;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal to-teal-900 px-4 py-16 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 text-base text-white/80 sm:text-lg">{t("subtitle")}</p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-8">
          {stepKeys.map((key, i) => {
            const step = STEPS[i];
            const Icon = step.icon;
            return (
              <div key={key} className="flex gap-4 sm:gap-6">
                {/* Step indicator with line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${step.color} text-lg font-bold text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {i < stepKeys.length - 1 && (
                    <div className="mt-2 h-full w-0.5 bg-muted" />
                  )}
                </div>

                {/* Content */}
                <Card className="flex-1 border-0 shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {locale === "ar" ? `الخطوة ${step.num}` : `STEP ${step.num}`}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{t(key)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`${key}Desc`)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Video placeholder */}
      <section className="bg-muted/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">{t("videoTitle")}</h2>
          <div className="relative mx-auto mt-8 aspect-video max-w-2xl overflow-hidden rounded-xl bg-charcoal/5 shadow-lg">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg">
                <Play className="h-8 w-8" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {locale === "ar" ? "الفيديو قريباً" : "Video coming soon"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 px-4 py-12 text-center text-white sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mt-3 text-white/80">{t("ctaSubtitle")}</p>
          <Button asChild size="lg" className="mt-6 bg-amber-500 text-white hover:bg-amber-600">
            <Link href="/sell-my-car/valuation">
              {t("ctaButton")}
              <ArrowRight className="ms-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
