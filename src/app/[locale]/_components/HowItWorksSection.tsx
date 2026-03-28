"use client";

import { useTranslations } from "next-intl";
import { Search, Users, ThumbsUp } from "lucide-react";

const STEPS = [
  { icon: Search, titleKey: "step1Title", descKey: "step1Desc", step: "01" },
  { icon: Users, titleKey: "step2Title", descKey: "step2Desc", step: "02" },
  { icon: ThumbsUp, titleKey: "step3Title", descKey: "step3Desc", step: "03" },
];

export function HowItWorksSection() {
  const t = useTranslations("home.howItWorks");

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-bold text-charcoal sm:text-3xl">
          {t("title")}
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-500 sm:h-20 sm:w-20">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <span className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {step.step}
                  </span>
                </div>

                {/* Connector line (hidden on mobile) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute hidden h-px w-32 bg-border md:block" />
                )}

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
  );
}
