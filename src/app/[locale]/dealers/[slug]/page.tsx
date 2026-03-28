import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { DealerProfileClient } from "./_components/DealerProfileClient";

interface DealerProfileParams {
  locale: string;
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DealerProfileParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  let dealer;
  try {
    dealer = await api.dealers.getBySlug({ slug });
  } catch {
    return {};
  }
  if (!dealer) return {};

  const name = locale === "ar" ? (dealer.companyNameAr || dealer.companyName) : dealer.companyName;
  const title =
    locale === "ar"
      ? `${name} - وكيل سيارات في ${dealer.city}`
      : `${name} - Car Dealer in ${dealer.city}`;
  const description =
    locale === "ar"
      ? `تصفح معروض ${name}. ${dealer._count?.cars ?? 0} سيارة متاحة. وكيل ${dealer.isVerified ? "موثق" : ""} في ${dealer.city}, ${dealer.region}.`
      : `Browse ${name} inventory. ${dealer._count?.cars ?? 0} cars available. ${dealer.isVerified ? "Verified" : ""} dealer in ${dealer.city}, ${dealer.region}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/dealers/${slug}`,
      languages: { ar: `/ar/dealers/${slug}`, en: `/en/dealers/${slug}` },
    },
  };
}

/** Individual dealer profile page. */
export default async function DealerProfilePage({
  params,
}: {
  params: Promise<DealerProfileParams>;
}) {
  const { locale, slug } = await params;
  let dealer;
  try {
    dealer = await api.dealers.getBySlug({ slug });
  } catch {
    notFound();
  }
  if (!dealer) notFound();

  // JSON-LD AutoDealer schema
  const dealerJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.companyName,
    url: absoluteUrl(`/${locale}/dealers/${slug}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: dealer.city,
      addressRegion: dealer.region,
      addressCountry: "LB",
    },
    ...(dealer.phone && { telephone: dealer.phone }),
    ...(dealer.logoUrl && { image: dealer.logoUrl }),
    aggregateRating:
      dealer.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(dealer.ratingAvg) || 0,
            reviewCount: dealer.reviewCount,
            bestRating: 5,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
      />
      <DealerProfileClient dealer={dealer} locale={locale} />
    </>
  );
}
