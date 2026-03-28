"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SellCtaSection() {
  const t = useTranslations("home.sellCta");

  return (
    <section className="bg-gradient-to-r from-amber-500 via-amber-500 to-teal-600 px-4 py-12 text-white sm:py-16">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base text-white/90 sm:text-lg">
          {t("subtitle")}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-amber-600 hover:bg-white/90"
        >
          <Link href="/sell-my-car">
            {t("cta")}
            <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
