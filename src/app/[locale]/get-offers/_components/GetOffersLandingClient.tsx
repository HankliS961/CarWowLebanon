"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Search, Users, ThumbsUp, ArrowRight, ShieldCheck, Clock, Banknote } from "lucide-react";

export function GetOffersLandingClient() {
  const t = useTranslations("getOffers.landing");

  const steps = [
    { icon: Search, titleKey: "step1Title", descKey: "step1Desc", step: "01" },
    { icon: Users, titleKey: "step2Title", descKey: "step2Desc", step: "02" },
    { icon: ThumbsUp, titleKey: "step3Title", descKey: "step3Desc", step: "03" },
  ];

  const trustSignals = [
    { icon: Banknote, textKey: "trustFree" },
    { icon: ShieldCheck, textKey: "trustDealers" },
    { icon: Clock, textKey: "trustOffers" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-charcoal px-4 py-16 text-white sm:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-teal-100 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-amber-500 px-8 text-white hover:bg-amber-600"
          >
            <Link href="/get-offers/configure">
              {t("startNow")}
              <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
            </Link>
          </Button>

          {/* Trust signals */}
          <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-6">
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-teal-100">
                  <Icon className="h-4 w-4 text-amber-400" />
                  <span>{t(signal.textKey)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-charcoal sm:text-3xl">
            {t("step1Title").includes("Tell") ? "How It Works" : "كيف يعمل النظام"}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-500 sm:h-20 sm:w-20">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <span className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-charcoal">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-teal-50 px-4 py-12">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-charcoal">
            {t("heroTitle")}
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-amber-500 px-8 text-white hover:bg-amber-600"
          >
            <Link href="/get-offers/configure">
              {t("startNow")}
              <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
