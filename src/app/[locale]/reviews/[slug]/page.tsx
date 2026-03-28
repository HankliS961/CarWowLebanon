import type { Metadata } from "next";
import Image from "next/image";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateItemListSchema, generateArticleSchema } from "@/lib/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ProsCons } from "@/components/shared/ProsCons";
import { Star, ArrowRight, Trophy } from "lucide-react";

interface RoundupPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RoundupPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typeLabel = slug.replace(/^best-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `Best ${typeLabel} Cars in Lebanon 2026 — Top Picks & Reviews`;
  const description = `Discover the best ${typeLabel.toLowerCase()} cars available in Lebanon for 2026. Expert ratings, pros & cons, and deals.`;
  const url = absoluteUrl(`/${locale}/reviews/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "CarSouk", type: "article" },
  };
}

export default async function RoundupPage({ params }: RoundupPageProps) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const typeLabel = slug.replace(/^best-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const url = absoluteUrl(`/${locale}/reviews/${slug}`);

  // Placeholder roundup entries (would come from DB in production)
  const entries = [
    {
      rank: 1,
      make: "Toyota",
      model: "RAV4",
      year: 2026,
      rating: 8.5,
      imageUrl: "/images/car-placeholder.webp",
      pros: ["Reliable", "Good resale value", "Hybrid option available"],
      cons: ["CVT can feel sluggish", "Road noise at highway speeds"],
      excerpt: "The Toyota RAV4 continues to be the benchmark for compact SUVs in Lebanon.",
    },
    {
      rank: 2,
      make: "Kia",
      model: "Sportage",
      year: 2026,
      rating: 8.3,
      imageUrl: "/images/car-placeholder.webp",
      pros: ["Stylish design", "Feature-rich", "5-year warranty"],
      cons: ["Turbo engine preferred", "Some hard plastics in lower trims"],
      excerpt: "The Kia Sportage offers stunning design and great value for money.",
    },
    {
      rank: 3,
      make: "Hyundai",
      model: "Tucson",
      year: 2026,
      rating: 8.2,
      imageUrl: "/images/car-placeholder.webp",
      pros: ["Bold design", "Excellent tech", "Spacious cabin"],
      cons: ["Firm ride", "Complex infotainment"],
      excerpt: "The Hyundai Tucson brings a futuristic look with practical daily usability.",
    },
  ];

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Reviews", labelAr: "المراجعات", href: "/reviews" },
    { label: `Best ${typeLabel}`, labelAr: `أفضل ${typeLabel}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={generateItemListSchema(
          `Best ${typeLabel} Cars in Lebanon 2026`,
          entries.map((e) => ({
            name: `${e.year} ${e.make} ${e.model}`,
            url: absoluteUrl(`/${locale}/${e.make.toLowerCase()}/${e.model.toLowerCase().replace(/\s+/g, "-")}`),
            position: e.rank,
          }))
        )}
      />
      <JsonLd
        data={generateArticleSchema({
          headline: `Best ${typeLabel} Cars in Lebanon 2026`,
          description: `Our expert picks for the best ${typeLabel.toLowerCase()} cars in Lebanon.`,
          authorName: "CarSouk Team",
          datePublished: new Date().toISOString(),
          url,
          section: "Roundup",
        })}
      />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl text-center">
          <Trophy className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
            {isAr ? `أفضل سيارات ${typeLabel} في لبنان 2026` : `Best ${typeLabel} Cars in Lebanon 2026`}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isAr ? "اختياراتنا من الخبراء مع التقييمات والمراجعات" : "Our expert picks with ratings, reviews, and the best deals"}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          {entries.map((entry) => {
            const makeSlug = entry.make.toLowerCase();
            const modelSlug = entry.model.toLowerCase().replace(/\s+/g, "-");

            return (
              <article key={entry.rank} className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="grid gap-4 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr]">
                  <div className="relative aspect-[16/10] md:aspect-auto md:h-full">
                    <Image
                      src={entry.imageUrl}
                      alt={`${entry.year} ${entry.make} ${entry.model}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 260px"
                    />
                    <Badge className="absolute start-3 top-3 bg-amber-500 text-white text-lg px-3 py-1">
                      #{entry.rank}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-charcoal">
                        {entry.year} {entry.make} {entry.model}
                      </h2>
                      <Badge className="bg-teal-500 text-white">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        {entry.rating}/10
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.excerpt}</p>
                    <div className="mt-4">
                      <ProsCons pros={entry.pros} cons={entry.cons} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/${makeSlug}/${modelSlug}`}>
                          {isAr ? "اقرأ المراجعة" : "Read Full Review"}
                          <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                        <Link href={`/${makeSlug}/${modelSlug}/used`}>
                          {isAr ? "عرض الصفقات" : "View Deals"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
