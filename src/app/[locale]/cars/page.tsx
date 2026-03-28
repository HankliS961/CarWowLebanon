import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CarsSearchClient } from "./_components/CarsSearchClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });

  return {
    title: t("title"),
    description:
      locale === "ar"
        ? "ابحث عن سيارات جديدة ومستعملة للبيع في لبنان. قارن الأسعار واحصل على أفضل العروض من وكلاء موثقين."
        : "Search new and used cars for sale in Lebanon. Compare prices and get the best deals from verified dealers.",
    alternates: {
      canonical: `/${locale}/cars`,
      languages: { ar: "/ar/cars", en: "/en/cars" },
    },
  };
}

/** Main car search/listings page with filters, sorting, and pagination. */
export default function CarsSearchPage() {
  return <CarsSearchClient />;
}
