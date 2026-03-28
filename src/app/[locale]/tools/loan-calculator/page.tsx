import type { Metadata } from "next";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { generateWebApplicationSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { LoanCalculatorForm } from "@/components/tools/LoanCalculatorForm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowRight } from "lucide-react";

interface LoanCalculatorPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LoanCalculatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateToolMetadata("loan-calculator", locale);
}

export default async function LoanCalculatorPage({ params }: LoanCalculatorPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/tools/loan-calculator`);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات", href: "/tools" },
    { label: "Loan Calculator", labelAr: "حاسبة القروض" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebApplicationSchema({ name: "Car Loan Calculator Lebanon", description: "Calculate monthly car loan payments with Lebanese bank rates.", url, category: "FinanceApplication" })} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <DollarSign className="mx-auto mb-4 h-10 w-10 text-teal-500" />
            <h1 className="text-3xl font-bold text-charcoal">
              {isAr ? "حاسبة قروض السيارات — لبنان" : "Car Loan Calculator — Lebanon"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "احسب القسط الشهري وإجمالي الفوائد وقارن بين مدد القروض المختلفة"
                : "Calculate monthly payments, total interest, and compare loan terms from Lebanese banks"}
            </p>
          </div>

          <div className="mt-8">
            <LoanCalculatorForm />
          </div>

          <div className="mt-12 space-y-6 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-charcoal">
              {isAr ? "قروض السيارات في لبنان" : "Car Loans in Lebanon"}
            </h2>
            <p>
              {isAr
                ? "تتراوح أسعار الفائدة على قروض السيارات في لبنان عادة بين 7% و 12% سنويا. تقدم معظم البنوك فترات سداد من 1 إلى 7 سنوات."
                : "Car loan interest rates in Lebanon typically range from 7% to 12% annually. Most banks offer repayment periods from 1 to 7 years. A higher down payment generally leads to better rates."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/blog/finance-insurance">
                  {isAr ? "أدلة التمويل" : "Finance Guides"}
                  <ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools/import-calculator">
                  {isAr ? "حاسبة الاستيراد" : "Import Calculator"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
