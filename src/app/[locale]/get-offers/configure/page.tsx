import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConfigureWizardClient } from "./_components/ConfigureWizardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "حدد مواصفات سيارتك" : "Configure Your Car",
    description:
      locale === "ar"
        ? "اختر الشركة والموديل والميزانية واحصل على عروض تنافسية من وكلاء موثقين."
        : "Select make, model, budget and get competing offers from verified dealers.",
  };
}

/** Multi-step car configuration wizard. */
export default function ConfigureCarPage() {
  return <ConfigureWizardClient />;
}
