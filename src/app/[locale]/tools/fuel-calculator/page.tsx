import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { FuelCalculatorForm } from "@/components/tools/FuelCalculatorForm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Fuel, ArrowRight } from "lucide-react";

interface FuelCalculatorPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FuelCalculatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateToolMetadata("fuel-calculator", locale);
}

export default async function FuelCalculatorPage({ params }: FuelCalculatorPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/tools/fuel-calculator`);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات", href: "/tools" },
    { label: "Fuel Calculator", labelAr: "حاسبة الوقود" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebApplicationSchema({ name: "Fuel Cost Calculator Lebanon", description: "Estimate monthly fuel costs in Lebanon.", url, category: "UtilitiesApplication" })} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Fuel className="mx-auto mb-4 h-10 w-10 text-teal-500" />
            <h1 className="text-3xl font-bold text-charcoal">
              {isAr ? "حاسبة تكلفة الوقود — لبنان" : "Fuel Cost Calculator — Lebanon"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "قدر تكاليف الوقود الشهرية والسنوية بناء على استهلاك سيارتك"
                : "Estimate your monthly and yearly fuel costs based on your car and commute"}
            </p>
          </div>

          <div className="mt-8">
            <FuelCalculatorForm />
          </div>

          <div className="mt-12 space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "أسعار الوقود في لبنان" : "Fuel Prices in Lebanon"}
            </h2>
            <p>
              {isAr
                ? "تتغير أسعار الوقود في لبنان أسبوعيا. البنزين 95 يكلف حوالي 0.95 دولار/لتر والبنزين 98 حوالي 1.05 دولار/لتر."
                : "Lebanese fuel prices change weekly. Gasoline 95 costs approximately $0.95/L, Gasoline 98 approximately $1.05/L, and Diesel approximately $0.85/L."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/reviews/best-fuel-efficient">{isAr ? "أكفأ السيارات بالوقود" : "Most Fuel-Efficient Cars"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools/compare">{isAr ? "مقارنة السيارات" : "Compare Cars"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
