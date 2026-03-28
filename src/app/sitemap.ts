import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://carsouk.com";

/**
 * Dynamic XML sitemap for CarSouk.
 * In production, this would query the database for all dynamic pages.
 * Currently returns static routes and placeholders for dynamic content.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages for both locales
  const locales = ["en", "ar"];
  const staticPaths = [
    "",
    "/blog",
    "/reviews",
    "/tools",
    "/tools/import-calculator",
    "/tools/loan-calculator",
    "/tools/fuel-calculator",
    "/tools/compare",
    "/tools/valuation",
    "/guides",
    "/dealers",
    "/about",
    "/about/how-it-works",
    "/about/contact",
    "/sell-my-car",
    "/get-offers",
    "/cars",
  ];

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" as const : "weekly" as const,
      priority: path === "" ? 1.0 : path.startsWith("/tools") ? 0.8 : 0.7,
    }))
  );

  // In production, dynamically add:
  // - All blog posts: /blog/[slug]
  // - All blog categories: /blog/[category]
  // - All car review hubs: /[make]/[model] (+ /review, /interior, /specs, /colours, /prices)
  // - All dealer profiles: /dealers/[slug]
  // - All guide pages: /guides/[slug]
  // - All brand hubs: /[make]
  // - All roundup articles: /reviews/best-[type]
  // - All comparison articles: /reviews/comparison/[slug]

  // Placeholder entries for key content (would be replaced with DB queries)
  const contentEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    // Blog category pages
    ...["buying-guide", "selling-tips", "car-news", "import-customs", "finance-insurance", "maintenance", "market-analysis"].map(
      (cat) => ({
        url: `${SITE_URL}/${locale}/blog/${cat}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    ),
  ]);

  return [...staticEntries, ...contentEntries];
}
