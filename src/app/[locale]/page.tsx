import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "./_components/HeroSection";
import { TrustBarSection } from "./_components/TrustBarSection";
import { FeaturedCarsSection } from "./_components/FeaturedCarsSection";
import { BrowseByMakeSection } from "./_components/BrowseByMakeSection";
import { BrowseByTypeSection } from "./_components/BrowseByTypeSection";
import { BrowseByRegionSection } from "./_components/BrowseByRegionSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { SellCtaSection } from "./_components/SellCtaSection";
import { ImportCtaSection } from "./_components/ImportCtaSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });

  return {
    title: locale === "ar" ? "كارسوق - سوق السيارات في لبنان" : "CarSouk - Lebanon's Car Marketplace",
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
  };
}

/** Homepage -- hero search, trust bar, featured cars, browse sections, how-it-works, CTAs. */
export default async function HomePage() {
  // JSON-LD Organization schema
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CarSouk",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://carsouk.com",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://carsouk.com"}/logo.png`,
    description: "Lebanon's first reverse car marketplace. Dealers compete to give you the best price.",
    areaServed: {
      "@type": "Country",
      name: "Lebanon",
    },
    sameAs: [
      "https://instagram.com/carsouk",
      "https://youtube.com/carsouk",
      "https://facebook.com/carsouk",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="flex flex-col">
        <HeroSection />
        <TrustBarSection />
        <FeaturedCarsSection />
        <BrowseByMakeSection />
        <BrowseByTypeSection />
        <BrowseByRegionSection />
        <HowItWorksSection />
        <SellCtaSection />
        <ImportCtaSection />
      </div>
    </>
  );
}
