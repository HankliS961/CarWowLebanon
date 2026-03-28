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
    title: t("importCarsTitle"),
    description:
      locale === "ar"
        ? "تصفح السيارات المستوردة من أمريكا والخليج وأوروبا للبيع في لبنان."
        : "Browse imported cars from USA, Gulf, and Europe for sale in Lebanon.",
    alternates: {
      canonical: `/${locale}/cars/import`,
      languages: { ar: "/ar/cars/import", en: "/en/cars/import" },
    },
  };
}

/** Imported cars listing page -- pre-filtered to imported sources. */
export default async function ImportCarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });

  return (
    <CarsSearchClient
      defaultFilters={{ source: "IMPORTED_USA" }}
      title={t("importCarsTitle")}
    />
  );
}
