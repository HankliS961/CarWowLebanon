"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function ImportCtaSection() {
  const t = useTranslations("home.importCta");

  return (
    <section className="border-t bg-soft-sky/40 px-4 py-12 sm:py-16">
      <div className="container mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 sm:h-20 sm:w-20">
          <Calculator className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <div className="flex-1">
          <h2 className="mb-2 text-xl font-bold text-charcoal sm:text-2xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild size="lg" variant="outline" className="flex-shrink-0">
          <Link href="/tools/import-calculator">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
