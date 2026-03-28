import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { BrandHubClient } from "./_components/BrandHubClient";

interface BrandHubParams {
  locale: string;
  make: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BrandHubParams>;
}): Promise<Metadata> {
  const { locale, make } = await params;
  let makeData;
  try {
    makeData = await api.carMakes.getBySlug({ slug: make });
  } catch {
    return {};
  }
  if (!makeData) return {};

  const name = locale === "ar" ? (makeData.nameAr ?? makeData.nameEn) : makeData.nameEn;
  const title =
    locale === "ar"
      ? `سيارات ${name} في لبنان - مراجعات وأسعار ومعروض`
      : `${name} Cars in Lebanon - Reviews, Prices & Listings`;
  const description =
    locale === "ar"
      ? `تصفح جميع سيارات ${name} المتوفرة في لبنان. مراجعات، أسعار، ومقارنات من وكلاء موثقين.`
      : `Browse all ${name} cars available in Lebanon. Reviews, prices, and comparisons from verified dealers.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${make}`,
      languages: { ar: `/ar/${make}`, en: `/en/${make}` },
    },
  };
}

/** Brand hub page for a car make -- brand info, popular models, listings. */
export default async function BrandHubPage({
  params,
}: {
  params: Promise<BrandHubParams>;
}) {
  const { locale, make } = await params;
  let makeData;
  try {
    makeData = await api.carMakes.getBySlug({ slug: make });
  } catch {
    notFound();
  }
  if (!makeData) notFound();

  // Fetch listings for this brand
  let listings;
  try {
    listings = await api.cars.list({ make: makeData.nameEn, page: 1, limit: 6 });
  } catch {
    listings = { cars: [], total: 0, page: 1, totalPages: 0 };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: makeData.nameEn,
    url: `/${locale}/${make}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandHubClient make={makeData} listings={listings} locale={locale} />
    </>
  );
}
