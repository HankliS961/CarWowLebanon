import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { GitCompare, ArrowRight, Star } from "lucide-react";

interface CompareToolPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CompareToolPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateToolMetadata("compare", locale);
}

export default async function CompareToolPage({ params }: CompareToolPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/tools/compare`);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات", href: "/tools" },
    { label: "Compare Cars", labelAr: "مقارنة السيارات" },
  ];

  // Placeholder comparison data — in production this would be interactive with DB lookups
  const popularComparisons = [
    { a: "Toyota RAV4", b: "Kia Sportage", slug: "toyota-rav4-vs-kia-sportage" },
    { a: "Toyota Corolla", b: "Honda Civic", slug: "toyota-corolla-vs-honda-civic" },
    { a: "Hyundai Tucson", b: "Nissan X-Trail", slug: "hyundai-tucson-vs-nissan-x-trail" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebApplicationSchema({ name: "Car Comparison Tool Lebanon", description: "Compare cars side by side — specs, prices, and ratings.", url })} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <GitCompare className="mx-auto mb-4 h-10 w-10 text-teal-500" />
            <h1 className="text-3xl font-bold text-charcoal">
              {isAr ? "مقارنة السيارات جنبا إلى جنب" : "Compare Cars Side by Side"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "اختر 2-3 سيارات لمقارنة المواصفات والأسعار والتقييمات"
                : "Select 2-3 cars to compare specs, prices, ratings, and features at a glance"}
            </p>
          </div>

          {/* Car Selection (placeholder UI) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-lg font-bold">{slot}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isAr ? `اختر السيارة ${slot}` : `Select Car ${slot}`}
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  {isAr ? "اختر" : "Choose"}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button disabled className="bg-teal-500 text-white">
              <GitCompare className="me-2 h-4 w-4" />
              {isAr ? "قارن الآن" : "Compare Now"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {isAr ? "اختر سيارتين على الأقل للمقارنة" : "Select at least 2 cars to compare"}
            </p>
          </div>

          {/* Popular Comparisons */}
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">
              {isAr ? "مقارنات شائعة" : "Popular Comparisons"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularComparisons.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/reviews/comparison/${comp.slug}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:border-teal-200 hover:text-teal-500"
                >
                  <span>{comp.a} vs {comp.b}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>

          {/* SEO Content */}
          <div className="mt-12 space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "كيفية مقارنة السيارات" : "How to Compare Cars"}
            </h2>
            <p>
              {isAr
                ? "استخدم أداة المقارنة لعرض المواصفات والأسعار والتقييمات جنبا إلى جنب. حدد ما يهمك أكثر: الأداء أم القيمة أم الموثوقية."
                : "Use our comparison tool to view specs, prices, and ratings side by side. Prioritize what matters most to you: performance, value, or reliability."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/reviews">{isAr ? "مراجعات السيارات" : "Car Reviews"}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools/valuation">{isAr ? "تقييم السيارات" : "Car Valuation"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
