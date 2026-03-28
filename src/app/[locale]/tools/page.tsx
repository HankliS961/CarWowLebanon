import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { Link } from "@/i18n/routing";
import {
  Calculator,
  DollarSign,
  Fuel,
  GitCompare,
  Tag,
  ArrowRight,
  Wrench,
} from "lucide-react";

interface ToolsHubPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ToolsHubPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "Car Tools & Calculators — Free Tools for Lebanon";
  const description = "Free car tools: import cost calculator, loan calculator, fuel cost calculator, car comparison, and valuation estimator for the Lebanese market.";
  const url = absoluteUrl(`/${locale}/tools`);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "CarSouk", type: "website" } };
}

const tools = [
  {
    slug: "import-calculator",
    icon: Calculator,
    labelEn: "Import Cost Calculator",
    labelAr: "حاسبة تكلفة الاستيراد",
    descEn: "Calculate the total cost of importing a car to Lebanon including customs, VAT, shipping, and fees.",
    descAr: "احسب التكلفة الإجمالية لاستيراد سيارة إلى لبنان بما في ذلك الجمارك والشحن والرسوم.",
  },
  {
    slug: "loan-calculator",
    icon: DollarSign,
    labelEn: "Car Loan Calculator",
    labelAr: "حاسبة قروض السيارات",
    descEn: "Calculate monthly payments, total interest, and compare loan terms from Lebanese banks.",
    descAr: "احسب الأقساط الشهرية وإجمالي الفوائد وقارن بين شروط القروض.",
  },
  {
    slug: "fuel-calculator",
    icon: Fuel,
    labelEn: "Fuel Cost Calculator",
    labelAr: "حاسبة تكلفة الوقود",
    descEn: "Estimate your monthly and yearly fuel expenses based on your commute and fuel prices in Lebanon.",
    descAr: "قدر تكاليف الوقود الشهرية والسنوية بناء على مسافة التنقل وأسعار الوقود.",
  },
  {
    slug: "compare",
    icon: GitCompare,
    labelEn: "Compare Cars Side by Side",
    labelAr: "مقارنة السيارات جنبا إلى جنب",
    descEn: "Compare 2-3 cars side by side. Specs, prices, ratings, and features at a glance.",
    descAr: "قارن بين 2-3 سيارات. المواصفات والأسعار والتقييمات في نظرة واحدة.",
  },
  {
    slug: "valuation",
    icon: Tag,
    labelEn: "Car Valuation Tool",
    labelAr: "أداة تقييم السيارات",
    descEn: "Get an instant estimate of your car's market value in Lebanon based on make, model, year, and condition.",
    descAr: "احصل على تقدير فوري لقيمة سيارتك في السوق اللبناني.",
  },
];

export default async function ToolsHubPage({ params }: ToolsHubPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Tools", labelAr: "الأدوات" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebsiteSchema()} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8 text-center">
        <Wrench className="mx-auto mb-4 h-10 w-10 text-teal-500" />
        <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
          {isAr ? "أدوات وحاسبات السيارات" : "Car Tools & Calculators"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isAr
            ? "أدوات مجانية لمساعدتك في اتخاذ قرارات ذكية حول السيارات في لبنان"
            : "Free tools to help you make smart car decisions in Lebanon"}
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-500 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-charcoal group-hover:text-teal-500 transition-colors">
                  {isAr ? tool.labelAr : tool.labelEn}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {isAr ? tool.descAr : tool.descEn}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-500">
                  <span>{isAr ? "استخدم الأداة" : "Use Tool"}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
