import type { Metadata } from "next";
import Image from "next/image";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateArticleSchema } from "@/lib/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Star, Trophy, ArrowRight } from "lucide-react";

interface ComparisonPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const title = slug.replace(/-vs-/g, " vs ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const fullTitle = `${title} — Head-to-Head Comparison | CarSouk`;
  const description = `Compare ${title} side by side. Specs, performance, value, and our expert verdict.`;
  const url = absoluteUrl(`/${locale}/reviews/comparison/${slug}`);
  return { title: fullTitle, description, alternates: { canonical: url }, openGraph: { title: fullTitle, description, url, siteName: "CarSouk", type: "article" } };
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/reviews/comparison/${slug}`);
  const titleFromSlug = slug.replace(/-vs-/g, " vs ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const cars: { make: string; model: string; year: number; imageUrl: string; rating: number; priceUsd: number; specs: Record<string, string> }[] = [
    {
      make: "Toyota", model: "RAV4", year: 2026, imageUrl: "/images/car-placeholder.svg", rating: 8.5, priceUsd: 32000,
      specs: { Engine: "2.5L 4-Cylinder", Horsepower: "203 hp", Torque: "184 lb-ft", Transmission: "8-Speed Auto", "Fuel Economy": "7.1 L/100km", Drivetrain: "FWD / AWD", "Boot Space": "580 L", "0-100 km/h": "8.4 sec" },
    },
    {
      make: "Kia", model: "Sportage", year: 2026, imageUrl: "/images/car-placeholder.svg", rating: 8.3, priceUsd: 30000,
      specs: { Engine: "1.6L Turbo", Horsepower: "180 hp", Torque: "195 lb-ft", Transmission: "7-Speed DCT", "Fuel Economy": "7.5 L/100km", Drivetrain: "FWD / AWD", "Boot Space": "543 L", "0-100 km/h": "9.1 sec" },
    },
  ];

  const categories = [
    { name: "Performance", nameAr: "الأداء", winnerIndex: 0, descEn: "RAV4 has more power and quicker acceleration.", descAr: "RAV4 أقوى وأسرع في التسارع." },
    { name: "Interior", nameAr: "المقصورة", winnerIndex: 1, descEn: "Sportage cabin feels more premium with better tech.", descAr: "مقصورة سبورتاج أفخم مع تقنيات أفضل." },
    { name: "Value", nameAr: "القيمة", winnerIndex: 1, descEn: "Sportage offers more features for the price.", descAr: "سبورتاج تقدم مواصفات أكثر بسعر أقل." },
    { name: "Reliability", nameAr: "الموثوقية", winnerIndex: 0, descEn: "Toyota's legendary reliability leads.", descAr: "موثوقية تويوتا تتصدر." },
    { name: "Safety", nameAr: "الأمان", winnerIndex: -1, descEn: "Both are equally safe. It's a tie.", descAr: "كلاهما آمن بنفس القدر. تعادل." },
  ];

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Reviews", labelAr: "المراجعات", href: "/reviews" },
    { label: titleFromSlug, labelAr: titleFromSlug },
  ];

  const specKeys = Object.keys(cars[0].specs);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateArticleSchema({ headline: titleFromSlug, description: `Head-to-head: ${titleFromSlug}`, authorName: "CarSouk Team", datePublished: new Date().toISOString(), url, section: "Comparison" })} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-charcoal md:text-4xl">{titleFromSlug}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {cars.map((car, i) => (
            <div key={i} className="overflow-hidden rounded-lg border bg-card">
              <div className="relative aspect-[16/10]">
                <Image src={car.imageUrl} alt={`${car.year} ${car.make} ${car.model}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="p-4 text-center">
                <h2 className="text-xl font-bold text-charcoal">{car.year} {car.make} {car.model}</h2>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <Badge className="bg-teal-500 text-white"><Star className="mr-1 h-3 w-3 fill-current" />{car.rating}/10</Badge>
                  <span className="font-semibold text-amber-500">${car.priceUsd.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <h2 className="mb-6 text-xl font-bold text-charcoal">{isAr ? "المقارنة حسب الفئة" : "Category-by-Category"}</h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-charcoal">{isAr ? cat.nameAr : cat.name}</h3>
                {cat.winnerIndex >= 0 ? (
                  <Badge className="bg-emerald text-white"><Trophy className="mr-1 h-3 w-3" />{cars[cat.winnerIndex].make} {cars[cat.winnerIndex].model}</Badge>
                ) : (
                  <Badge variant="secondary">{isAr ? "تعادل" : "Tie"}</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{isAr ? cat.descAr : cat.descEn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <h2 className="mb-6 text-xl font-bold text-charcoal">{isAr ? "مقارنة المواصفات" : "Specs Comparison"}</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[500px]" role="table">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-start text-sm font-semibold text-charcoal">{isAr ? "المواصفة" : "Spec"}</th>
                {cars.map((car, i) => (<th key={i} className="px-4 py-3 text-start text-sm font-semibold text-charcoal">{car.make} {car.model}</th>))}
              </tr>
            </thead>
            <tbody>
              {specKeys.map((key, idx) => (
                <tr key={key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{key}</td>
                  {cars.map((c, i) => (<td key={i} className="px-4 py-2.5 text-sm font-medium text-foreground">{c.specs[key]}</td>))}
                </tr>
              ))}
              <tr className="bg-muted/50 font-semibold">
                <td className="px-4 py-2.5 text-sm text-charcoal">{isAr ? "السعر" : "Price"}</td>
                {cars.map((car, i) => (<td key={i} className="px-4 py-2.5 text-sm text-teal-500">${car.priceUsd.toLocaleString()}</td>))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          {cars.map((car, i) => (
            <div key={i} className="rounded-lg border bg-card p-5 text-center">
              <h3 className="font-semibold text-charcoal">{car.make} {car.model}</h3>
              <div className="mt-3 flex justify-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}`}>{isAr ? "المراجعة" : "Full Review"}</Link>
                </Button>
                <Button asChild size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                  <Link href={`/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/used`}>{isAr ? "عرض الصفقات" : "View Deals"}<ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/tools/compare">{isAr ? "استخدم أداة المقارنة التفاعلية" : "Use Interactive Comparison Tool"}<ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
