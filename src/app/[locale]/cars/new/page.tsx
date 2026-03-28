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
    title: t("newCarsTitle"),
    description:
      locale === "ar"
        ? "تصفح السيارات الجديدة للبيع في لبنان من وكلاء موثقين. قارن الأسعار واحصل على أفضل الصفقات."
        : "Browse new cars for sale in Lebanon from verified dealers. Compare prices and get the best deals.",
    alternates: {
      canonical: `/${locale}/cars/new`,
      languages: { ar: "/ar/cars/new", en: "/en/cars/new" },
    },
  };
}

/** New cars listing page -- pre-filtered to condition=NEW. */
export default async function NewCarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });

  return (
    <CarsSearchClient
      defaultFilters={{ condition: "NEW" }}
      title={t("newCarsTitle")}
    />
  );
}
