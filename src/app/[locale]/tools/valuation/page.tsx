import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { ValuationForm } from "@/components/tools/ValuationForm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Tag, ArrowRight } from "lucide-react";

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
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "احصل على تقدير فوري لقيمة سيارتك في السوق اللبناني"
                : "Get an instant estimate of your car's market value in Lebanon based on make, model, year, and condition"}
            </p>
          </div>

          <div className="mt-8">
            <ValuationForm />
          </div>

          <div className="mt-12 space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "كيف يعمل التقييم؟" : "How Does Our Valuation Work?"}
            </h2>
            <p>
              {isAr
                ? "يستخدم نموذجنا بيانات السوق اللبنانية ومعدلات الاستهلاك ومقارنة مع سيارات مشابهة لتقدير القيمة السوقية العادلة. الحالة والمصدر والكيلومتراج تؤثر جميعها على التقييم."
                : "Our model uses Lebanese market data, depreciation rates, and comparison with similar vehicles to estimate fair market value. Condition, source, and mileage all affect the valuation."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/sell-my-car">{isAr ? "بيع سيارتي" : "Sell My Car"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/cars">{isAr ? "تصفح السيارات" : "Browse Cars"}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/blog/market-analysis">{isAr ? "تحليل السوق" : "Market Analysis"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
