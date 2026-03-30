import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Tag, Calculator } from "lucide-react";

interface ValuationToolPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ValuationToolPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateToolMetadata("valuation", locale);
}

export default async function ValuationToolPage({ params }: ValuationToolPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/tools/valuation`);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات", href: "/tools" },
    { label: "Car Valuation", labelAr: "تقييم السيارة" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebApplicationSchema({ name: "Car Valuation Tool Lebanon", description: "Get an instant estimate of your car's market value in Lebanon.", url })} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Tag className="mx-auto mb-4 h-10 w-10 text-teal-500" />
            <h1 className="text-3xl font-bold text-charcoal">
              {isAr ? "أداة تقييم السيارات — لبنان" : "Car Valuation Tool — Lebanon"}
            </h1>
          </div>

          <div className="mx-auto max-w-lg py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <Calculator className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold">{isAr ? "قريباً" : "Coming Soon"}</h2>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "نحن نبني أداة تقييم مخصصة للسوق اللبناني باستخدام بيانات حقيقية من منصتنا."
                : "We're building a Lebanon-specific valuation tool using real market data from our platform."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr
                ? "في غضون ذلك، قم بإدراج سيارتك واحصل على عروض حقيقية من التجار."
                : "In the meantime, list your car and get real offers from verified dealers."}
            </p>
            <Button asChild className="mt-6">
              <Link href="/sell-my-car">{isAr ? "بيع سيارتك" : "Sell Your Car"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
