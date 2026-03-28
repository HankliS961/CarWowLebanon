import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { ImportCalculatorForm } from "@/components/tools/ImportCalculatorForm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";

interface ImportCalculatorPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ImportCalculatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateToolMetadata("import-calculator", locale);
}

export default async function ImportCalculatorPage({ params }: ImportCalculatorPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/tools/import-calculator`);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات", href: "/tools" },
    { label: "Import Calculator", labelAr: "حاسبة الاستيراد" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={generateWebApplicationSchema({
          name: "Import Cost Calculator Lebanon",
          description: "Calculate the total cost of importing a car to Lebanon including customs, VAT, and shipping.",
          url,
          category: "FinanceApplication",
        })}
      />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Calculator className="mx-auto mb-4 h-10 w-10 text-teal-500" />
            <h1 className="text-3xl font-bold text-charcoal">
              {isAr ? "حاسبة تكلفة استيراد السيارات إلى لبنان" : "Import Cost Calculator — Lebanon"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "احسب التكلفة الإجمالية لاستيراد سيارة إلى لبنان بما في ذلك الرسوم الجمركية والشحن والتسجيل"
                : "Calculate the total cost of importing a car to Lebanon including customs duty, VAT, shipping, and registration fees"}
            </p>
          </div>

          <div className="mt-8">
            <ImportCalculatorForm />
          </div>

          {/* SEO Content */}
          <div className="mt-12 space-y-6 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "كيف تعمل الجمارك على السيارات في لبنان؟" : "How Do Car Customs Work in Lebanon?"}
            </h2>
            <p>
              {isAr
                ? "تختلف الرسوم الجمركية اللبنانية بناء على حجم المحرك ونوع الوقود وعمر السيارة. السيارات الكهربائية تستفيد من معدل مخفض بنسبة 5%."
                : "Lebanese customs duties vary based on engine size, fuel type, and vehicle age. Electric vehicles benefit from a reduced 5% rate. Salvage vehicles carry a 15% surcharge, and cars older than 10 years incur an age-based surcharge."}
            </p>

            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "تكاليف الشحن حسب بلد المنشأ" : "Shipping Costs by Origin Country"}
            </h2>
            <p>
              {isAr
                ? "تتراوح تكاليف الشحن من 800 دولار من دول الخليج إلى 3000 دولار من الولايات المتحدة. النقل من أوروبا يتراوح بين 1200 و 2000 دولار."
                : "Shipping costs range from $800 from Gulf countries to $3,000 from the USA. European transport typically costs $1,200-2,000, while Asian shipments run $1,800-2,500."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/guides/how-to-import-car-lebanon">
                  {isAr ? "دليل الاستيراد الكامل" : "Complete Import Guide"}
                  <ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools/loan-calculator">
                  {isAr ? "حاسبة القروض" : "Loan Calculator"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/blog/import-customs">
                  {isAr ? "مقالات الاستيراد" : "Import Articles"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
