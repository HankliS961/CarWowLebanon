import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo/json-ld";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SocialShare } from "@/components/blog/SocialShare";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, HelpCircle } from "lucide-react";
import type { TocItem } from "@/lib/content/toc";

interface GuidePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // In production, this would fetch from database
  const titleMap: Record<string, string> = {
    "how-to-import-car-lebanon": "How to Import a Car to Lebanon — Complete Guide 2026",
    "car-insurance-guide-lebanon": "Complete Guide to Car Insurance in Lebanon",
    "first-car-buying-guide": "First Car Buying Guide for Lebanon",
    "car-loan-guide-lebanon": "Car Loan Guide: Financing Your Car in Lebanon",
  };
  const title = titleMap[slug] || `Guide: ${slug.replace(/-/g, " ")}`;
  const url = absoluteUrl(`/${locale}/guides/${slug}`);
  return {
    title: `${title} | CarSouk`,
    description: `Read our complete guide: ${title}. Expert advice for the Lebanese automotive market.`,
    alternates: { canonical: url },
    openGraph: { title, url, siteName: "CarSouk", type: "article" },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const url = absoluteUrl(`/${locale}/guides/${slug}`);

  // Placeholder guide content (would come from DB)
  const guideTitle = isAr
    ? "كيفية استيراد سيارة إلى لبنان: الدليل الكامل"
    : "How to Import a Car to Lebanon: Complete Guide 2026";

  const tocItems: TocItem[] = [
    { id: "overview", text: isAr ? "نظرة عامة" : "Overview", level: 2 },
    { id: "choosing-source", text: isAr ? "اختيار بلد المنشأ" : "Choosing a Source Country", level: 2 },
    { id: "customs-duties", text: isAr ? "الرسوم الجمركية" : "Customs Duties & Taxes", level: 2 },
    { id: "shipping", text: isAr ? "الشحن والنقل" : "Shipping & Transport", level: 2 },
    { id: "registration", text: isAr ? "التسجيل والفحص" : "Registration & Inspection", level: 2 },
    { id: "total-cost", text: isAr ? "التكلفة الإجمالية" : "Total Cost Estimate", level: 2 },
    { id: "tips", text: isAr ? "نصائح مهمة" : "Important Tips", level: 2 },
    { id: "faq", text: isAr ? "الأسئلة الشائعة" : "FAQ", level: 2 },
  ];

  const faqs = [
    {
      questionEn: "How long does it take to import a car to Lebanon?",
      questionAr: "كم يستغرق استيراد سيارة إلى لبنان؟",
      answerEn: "Typically 4-8 weeks from the USA, 2-3 weeks from Gulf countries, and 3-5 weeks from Europe.",
      answerAr: "عادة 4-8 أسابيع من أمريكا، 2-3 أسابيع من دول الخليج، و3-5 أسابيع من أوروبا.",
    },
    {
      questionEn: "Can I import a salvage car to Lebanon?",
      questionAr: "هل يمكنني استيراد سيارة سالفج إلى لبنان؟",
      answerEn: "Yes, but salvage vehicles carry a 15% customs surcharge and must pass a thorough inspection.",
      answerAr: "نعم، لكن سيارات السالفج تحمل رسوم إضافية 15% وتحتاج لفحص دقيق.",
    },
    {
      questionEn: "What is the customs duty rate for electric cars?",
      questionAr: "ما هو معدل الجمارك على السيارات الكهربائية؟",
      answerEn: "Electric vehicles benefit from a reduced customs duty rate of 5%, compared to 15-50% for gasoline cars.",
      answerAr: "تستفيد السيارات الكهربائية من معدل جمارك مخفض بنسبة 5%، مقارنة بـ 15-50% لسيارات البنزين.",
    },
  ];

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Guides", labelAr: "الأدلة", href: "/guides" },
    { label: isAr ? "دليل الاستيراد" : "Import Guide", labelAr: "دليل الاستيراد" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={generateArticleSchema({
          headline: guideTitle,
          description: "Complete guide on importing a car to Lebanon.",
          authorName: "CarSouk Team",
          datePublished: new Date().toISOString(),
          url,
          section: "Guide",
        })}
      />
      <JsonLd
        data={generateFAQSchema(
          faqs.map((faq) => ({
            question: isAr ? faq.questionAr : faq.questionEn,
            answer: isAr ? faq.answerAr : faq.answerEn,
          }))
        )}
      />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <header className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-charcoal md:text-4xl">{guideTitle}</h1>
          <p className="mt-3 text-muted-foreground">
            {isAr
              ? "دليل شامل خطوة بخطوة لاستيراد سيارة إلى لبنان"
              : "A comprehensive step-by-step guide to importing a car to Lebanon, covering customs, shipping, and registration."}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
            <article className="min-w-0">
              {/* Guide sections */}
              <div className="space-y-8">
                <section id="overview">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "نظرة عامة" : "Overview"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "استيراد سيارة إلى لبنان يمكن أن يوفر لك آلاف الدولارات مقارنة بالشراء المحلي. يغطي هذا الدليل كل ما تحتاج معرفته."
                      : "Importing a car to Lebanon can save you thousands of dollars compared to buying locally. This guide covers everything you need to know, from choosing the right source country to calculating total costs."}
                  </p>
                </section>

                <section id="choosing-source">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "اختيار بلد المنشأ" : "Choosing a Source Country"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "أشهر البلدان لاستيراد السيارات إلى لبنان هي الولايات المتحدة (خاصة عبر Copart)، دول الخليج (الإمارات والسعودية)، وأوروبا."
                      : "The most popular countries for importing cars to Lebanon are the USA (especially via Copart and IAAI auctions), Gulf states (UAE, Saudi Arabia), and Europe (Germany, Belgium)."}
                  </p>
                </section>

                <section id="customs-duties">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "الرسوم الجمركية والضرائب" : "Customs Duties & Taxes"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "تعتمد الرسوم الجمركية على حجم المحرك: أقل من 1.5 لتر (15%)، 1.5-2.0 لتر (20%)، 2.0-3.0 لتر (35%)، أكثر من 3.0 لتر (50%). السيارات الكهربائية تدفع 5% فقط."
                      : "Customs duties are based on engine size: under 1.5L (15%), 1.5-2.0L (20%), 2.0-3.0L (35%), over 3.0L (50%). Electric vehicles pay only 5%. VAT of 11% is applied on top."}
                  </p>
                  <div className="mt-4 rounded-lg bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      {isAr ? "نصيحة: استخدم حاسبة الاستيراد لحساب التكلفة الدقيقة" : "Tip: Use our Import Cost Calculator for an accurate cost breakdown"}
                    </p>
                    <Button asChild size="sm" className="mt-2 bg-amber-500 text-white hover:bg-amber-600">
                      <Link href="/tools/import-calculator">{isAr ? "حاسبة الاستيراد" : "Import Calculator"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
                    </Button>
                  </div>
                </section>

                <section id="shipping">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "الشحن والنقل" : "Shipping & Transport"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "تتراوح تكاليف الشحن من 800 دولار من الخليج إلى 3000 دولار من أمريكا. يتم الشحن عادة عبر حاويات أو RoRo."
                      : "Shipping costs range from $800 from Gulf countries to $3,000 from the USA. Cars are typically shipped via container or RoRo (Roll-on/Roll-off) vessels."}
                  </p>
                </section>

                <section id="registration">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "التسجيل والفحص" : "Registration & Inspection"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "بعد وصول السيارة، تحتاج لفحص فني (150 دولار) وتسجيل (300-500 دولار) للحصول على لوحات لبنانية."
                      : "After the car arrives, you will need a technical inspection ($150) and registration ($300-500) to obtain Lebanese plates."}
                  </p>
                </section>

                <section id="total-cost">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "التكلفة الإجمالية المقدرة" : "Total Cost Estimate"}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {isAr
                      ? "كقاعدة عامة، توقع أن تدفع 30-50% فوق سعر الشراء كتكاليف إضافية (جمارك + شحن + ضرائب + رسوم)."
                      : "As a rule of thumb, expect to pay 30-50% above the purchase price in additional costs (customs + shipping + taxes + fees)."}
                  </p>
                </section>

                <section id="tips">
                  <h2 className="text-2xl font-bold text-charcoal">{isAr ? "نصائح مهمة" : "Important Tips"}</h2>
                  <ul className="mt-3 space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {isAr ? "تأكد من فحص تقرير Carfax قبل الشراء" : "Always check the Carfax/vehicle history report before purchasing"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {isAr ? "اعمل مع وسيط استيراد موثوق" : "Work with a trusted import broker"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {isAr ? "احسب جميع التكاليف قبل الشراء" : "Calculate all costs before committing to a purchase"}
                    </li>
                  </ul>
                </section>

                {/* FAQ Section */}
                <section id="faq">
                  <h2 className="text-2xl font-bold text-charcoal flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-teal-500" />
                    {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="rounded-lg border bg-card p-5">
                        <h3 className="font-semibold text-charcoal">
                          {isAr ? faq.questionAr : faq.questionEn}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {isAr ? faq.answerAr : faq.answerEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Share & Related */}
                <div className="border-t pt-6">
                  <SocialShare url={url} title={guideTitle} />
                </div>

                {/* Related */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/tools/import-calculator">{isAr ? "حاسبة الاستيراد" : "Import Calculator"}</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/blog/import-customs">{isAr ? "مقالات الاستيراد" : "Import Articles"}</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/tools/loan-calculator">{isAr ? "حاسبة القروض" : "Loan Calculator"}</Link>
                  </Button>
                  <Button asChild className="bg-teal-500 text-white hover:bg-teal-600" size="sm">
                    <Link href="/cars">{isAr ? "ابحث في السوق" : "Search Marketplace"}<ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" /></Link>
                  </Button>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <TableOfContents items={tocItems} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
