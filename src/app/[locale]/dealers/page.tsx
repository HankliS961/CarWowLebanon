import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DealerDirectoryClient } from "./_components/DealerDirectoryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dealers" });

  return {
    title: t("title"),
    description:
      locale === "ar"
        ? "دليل وكلاء السيارات في لبنان. اعثر على وكلاء موثقين في بيروت وجبل لبنان وكل المناطق."
        : "Car dealer directory in Lebanon. Find verified dealers in Beirut, Mount Lebanon, and all regions.",
    alternates: {
      canonical: `/${locale}/dealers`,
      languages: { ar: "/ar/dealers", en: "/en/dealers" },
    },
  };
}

/** Dealer directory page -- searchable, filterable list of dealers. */
export default function DealerDirectoryPage() {
  return <DealerDirectoryClient />;
}
