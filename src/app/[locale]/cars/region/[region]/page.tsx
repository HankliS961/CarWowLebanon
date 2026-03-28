import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { REGIONS } from "@/lib/constants";
import { CarsSearchClient } from "../../_components/CarsSearchClient";

const REGION_SLUG_MAP: Record<string, string> = {
  beirut: "BEIRUT",
  "mount-lebanon": "MOUNT_LEBANON",
  north: "NORTH",
  south: "SOUTH",
  bekaa: "BEKAA",
  nabatieh: "NABATIEH",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; region: string }>;
}): Promise<Metadata> {
  const { locale, region } = await params;
  const regionValue = REGION_SLUG_MAP[region];
  if (!regionValue) return {};

  const regionData = REGIONS.find((r) => r.value === regionValue);
  const regionName = locale === "ar" ? regionData?.labelAr : regionData?.labelEn;

  const t = await getTranslations({ locale, namespace: "cars" });

  return {
    title: t("regionCarsTitle", { region: regionName || region }),
    description:
      locale === "ar"
        ? `تصفح السيارات للبيع في ${regionName}. أفضل الأسعار من وكلاء موثقين.`
        : `Browse cars for sale in ${regionName}. Best prices from verified dealers.`,
    alternates: {
      canonical: `/${locale}/cars/${region}`,
      languages: { ar: `/ar/cars/${region}`, en: `/en/cars/${region}` },
    },
  };
}

export function generateStaticParams() {
  return Object.keys(REGION_SLUG_MAP).map((region) => ({ region }));
}

/** Cars filtered by region. */
export default async function CarsByRegionPage({
  params,
}: {
  params: Promise<{ locale: string; region: string }>;
}) {
  const { locale, region } = await params;
  const regionValue = REGION_SLUG_MAP[region];
  if (!regionValue) notFound();

  const regionData = REGIONS.find((r) => r.value === regionValue);
  const regionName = locale === "ar" ? regionData?.labelAr : regionData?.labelEn;

  const t = await getTranslations({ locale, namespace: "cars" });

  return (
    <CarsSearchClient
      defaultFilters={{ region: regionValue }}
      title={t("regionCarsTitle", { region: regionName || region })}
    />
  );
}
