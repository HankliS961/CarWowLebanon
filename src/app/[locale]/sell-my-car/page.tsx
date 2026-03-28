"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrustBar } from "@/components/shared/TrustBar";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Car,
  Gavel,
  Handshake,
  Shield,
  BadgeCheck,
  Trophy,
  ChevronDown,
  Users,
  Clock,
  Star,
  Quote,
} from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-start"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold sm:text-base">{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SellMyCarPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("sell.landing");

  const trustStats = [
    { icon: Car, value: "1,200+", label: t("statCarsSold"), labelAr: t("statCarsSold") },
    { icon: Clock, value: "3", label: t("statAvgDays"), labelAr: t("statAvgDays") },
    { icon: Users, value: "150+", label: t("statDealers"), labelAr: t("statDealers") },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal via-charcoal to-teal-900 px-4 py-16 text-white sm:py-24">
        <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-5" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {t("heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full bg-amber-500 text-white hover:bg-amber-600 sm:w-auto">
              <Link href="/sell-my-car/valuation">
                {t("ctaStart")}
                <ArrowRight className="ms-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 sm:w-auto">
              <Link href="/sell-my-car/how-it-works">
                {t("ctaHowItWorks")}
              </Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              {t("trustFree")}
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              {t("trustVerified")}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-emerald-400" />
              {t("trustBestPrice")}
            </span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <TrustBar stats={trustStats} className="-mt-6 mx-4 sm:mx-auto sm:max-w-3xl" />

      {/* How It Works */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("howItWorksTitle")}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Car, title: t("step1Title"), desc: t("step1Desc"), num: "1" },
              { icon: Gavel, title: t("step2Title"), desc: t("step2Desc"), num: "2" },
              { icon: Handshake, title: t("step3Title"), desc: t("step3Desc"), num: "3" },
            ].map((step) => (
              <Card key={step.num} className="relative overflow-hidden border-0 shadow-md">
                <div className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-600">
                  {step.num}
                </div>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
                    <step.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("testimonialsTitle")}
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { name: t("testimonial1Name"), location: t("testimonial1Location"), text: t("testimonial1Text") },
              { name: t("testimonial2Name"), location: t("testimonial2Location"), text: t("testimonial2Text") },
              { name: t("testimonial3Name"), location: t("testimonial3Location"), text: t("testimonial3Text") },
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-teal-500/20" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {testimonial.text}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <div className="ms-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("faqTitle")}
          </h2>

          <div className="mt-10 rounded-xl border bg-card p-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-teal-600 px-4 py-12 text-center text-white sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("heroTitle")}</h2>
          <p className="mt-3 text-white/80">{t("heroSubtitle")}</p>
          <Button asChild size="lg" className="mt-6 bg-amber-500 text-white hover:bg-amber-600">
            <Link href="/sell-my-car/valuation">
              {t("ctaStart")}
              <ArrowRight className="ms-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
