import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CarsSearchClient } from "../_components/CarsSearchClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });

  return {
    title: t("usedCarsTitle"),
    description:
      locale === "ar"
        ? "تصفح السيارات المستعملة للبيع في لبنان. آلاف الخيارات من وكلاء موثقين بأسعار شفافة."
        : "Browse used cars for sale in Lebanon. Thousands of options from verified dealers with transparent pricing.",
    alternates: {
      canonical: `/${locale}/cars/used`,
      languages: { ar: "/ar/cars/used", en: "/en/cars/used" },
    },
  };
}

/** Used cars listing page -- pre-filtered to condition=USED. */
export default async function UsedCarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });

  return (
    <CarsSearchClient
      defaultFilters={{ condition: "USED" }}
      title={t("usedCarsTitle")}
    />
  );
}
