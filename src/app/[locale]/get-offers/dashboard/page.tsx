import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OffersDashboardClient } from "./_components/OffersDashboardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "عروضك" : "Your Offers",
    robots: { index: false }, // Dashboard is private
  };
}

/** Offer comparison dashboard (requires auth). */
export default function OffersDashboardPage() {
  return <OffersDashboardClient />;
}
