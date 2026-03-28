import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GetOffersLandingClient } from "./_components/GetOffersLandingClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "getOffers.landing" });

  return {
    title: locale === "ar" ? "احصل على عروض من الوكلاء" : "Get Offers from Dealers",
    description: t("heroSubtitle"),
    alternates: {
      canonical: `/${locale}/get-offers`,
      languages: { ar: "/ar/get-offers", en: "/en/get-offers" },
    },
  };
}

/** Get Offers landing page -- value proposition, how-it-works, CTA. */
export default function GetOffersPage() {
  return <GetOffersLandingClient />;
}
