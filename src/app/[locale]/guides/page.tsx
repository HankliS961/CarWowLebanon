import type { Metadata } from "next";
import Image from "next/image";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { BookOpen, ArrowRight } from "lucide-react";

interface GuidesHubPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GuidesHubPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "Car Guides for Lebanon — Buying, Importing, Insurance & More";
  const description = "Comprehensive car guides for Lebanon: how to import, financing, insurance, maintenance, and everything you need to know.";
  const url = absoluteUrl(`/${locale}/guides`);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "CarSouk", type: "website" } };
}

const guideCategories = [
  { slug: "buying", labelEn: "Buying", labelAr: "الشراء" },
  { slug: "importing", labelEn: "Importing", labelAr: "الاستيراد" },
  { slug: "finance", labelEn: "Finance", labelAr: "التمويل" },
  { slug: "insurance", labelEn: "Insurance", labelAr: "التأمين" },
  { slug: "maintenance", labelEn: "Maintenance", labelAr: "الصيانة" },
];

// Placeholder guides (would come from DB in production)
const placeholderGuides = [
  {
    slug: "how-to-import-car-lebanon",
    titleEn: "How to Import a Car to Lebanon: Complete Guide",
    titleAr: "كيفية استيراد سيارة إلى لبنان: الدليل الكامل",
    excerptEn: "Step-by-step guide covering customs, shipping, registration, and total costs.",
    excerptAr: "دليل خطوة بخطوة يغطي الجمارك والشحن والتسجيل والتكاليف الإجمالية.",
    category: "importing",
    isFeatured: true,
  },
  {
    slug: "car-insurance-guide-lebanon",
    titleEn: "Complete Guide to Car Insurance in Lebanon",
    titleAr: "الدليل الكامل للتأمين على السيارات في لبنان",
    excerptEn: "Compare insurance types, costs, and providers in the Lebanese market.",
    excerptAr: "قارن أنواع التأمين والتكاليف والشركات في السوق اللبناني.",
    category: "insurance",
    isFeatured: false,
  },
  {
    slug: "first-car-buying-guide",
    titleEn: "First Car Buying Guide for Lebanon",
    titleAr: "دليل شراء السيارة الأولى في لبنان",
    excerptEn: "Everything a first-time buyer needs to know about buying a car in Lebanon.",
    excerptAr: "كل ما يحتاج المشتري لأول مرة معرفته عن شراء سيارة في لبنان.",
    category: "buying",
    isFeatured: false,
  },
  {
    slug: "car-loan-guide-lebanon",
    titleEn: "Car Loan Guide: How to Finance Your Car in Lebanon",
    titleAr: "دليل قروض السيارات: كيف تمول سيارتك في لبنان",
    excerptEn: "Learn about loan requirements, interest rates, and best banks for car financing.",
    excerptAr: "تعرف على شروط القروض وأسعار الفائدة وأفضل البنوك لتمويل السيارات.",
    category: "finance",
    isFeatured: false,
  },
];

export default async function GuidesHubPage({ params }: GuidesHubPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Guides", labelAr: "الأدلة" },
  ];

  const featured = placeholderGuides.find((g) => g.isFeatured);
  const otherGuides = placeholderGuides.filter((g) => !g.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebsiteSchema()} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <section className="container mx-auto px-4 py-8 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-teal-500" />
        <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
          {isAr ? "أدلة السيارات للبنان" : "Car Guides for Lebanon"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isAr
            ? "أدلة شاملة حول الشراء والاستيراد والتمويل والتأمين والصيانة"
            : "Comprehensive guides on buying, importing, financing, insurance, and maintenance"}
        </p>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {guideCategories.map((cat) => (
            <Badge key={cat.slug} variant="outline" className="cursor-pointer px-4 py-2 hover:bg-teal-50 hover:text-teal-500">
              {isAr ? cat.labelAr : cat.labelEn}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured Guide */}
      {featured && (
        <section className="container mx-auto px-4 pb-8">
          <Link
            href={`/guides/${featured.slug}`}
            className="group block overflow-hidden rounded-xl border bg-gradient-to-br from-teal-50 to-soft-sky p-8 transition-shadow hover:shadow-md"
          >
            <Badge className="bg-teal-500 text-white mb-3">{isAr ? "مميز" : "Featured"}</Badge>
            <h2 className="text-2xl font-bold text-charcoal group-hover:text-teal-500 transition-colors">
              {isAr ? featured.titleAr : featured.titleEn}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isAr ? featured.excerptAr : featured.excerptEn}
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-500">
              <span>{isAr ? "اقرأ الدليل" : "Read Guide"}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </div>
          </Link>
        </section>
      )}

      {/* Guide Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {otherGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
            >
              <Badge variant="outline" className="w-fit text-xs mb-3">
                {isAr
                  ? guideCategories.find((c) => c.slug === guide.category)?.labelAr || guide.category
                  : guideCategories.find((c) => c.slug === guide.category)?.labelEn || guide.category}
              </Badge>
              <h3 className="text-base font-semibold text-charcoal group-hover:text-teal-500 transition-colors">
                {isAr ? guide.titleAr : guide.titleEn}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {isAr ? guide.excerptAr : guide.excerptEn}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-500">
                <span>{isAr ? "اقرأ الدليل" : "Read Guide"}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
