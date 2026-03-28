import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { generateReviewSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { ProsCons } from "@/components/shared/ProsCons";
import { ReviewRating } from "@/components/shared/ReviewRating";
import { SpecsGrid } from "@/components/shared/SpecsGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, Play } from "lucide-react";

interface ModelHubPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({
  params,
}: ModelHubPageProps): Promise<Metadata> {
  const { locale, make, model } = await params;
  const review = await api.content.getCarReviewByMakeModel({ make, model });
  if (!review) {
    return {
      title: `${make} ${model} — CarSouk`,
    };
  }
  const isAr = locale === "ar";
  return generateCarReviewMetadata(
    {
      make: review.make,
      model: review.model,
      year: review.year,
      rating: Number(review.ratingOverall),
      imageUrl: review.featuredImageUrl,
      seoTitle: isAr ? review.seoTitleAr : review.seoTitleEn,
      seoDescription: isAr ? review.seoDescriptionAr : review.seoDescriptionEn,
    },
    locale
  );
}

export default async function ModelHubPage({ params }: ModelHubPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  // Even without a review, render a basic page
  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;

  const makeSlug = make.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = model.toLowerCase().replace(/\s+/g, "-");
  const url = absoluteUrl(`/${locale}/${makeSlug}/${modelSlug}`);

  return (
    <>
      {/* Structured Data */}
      {review && (
        <JsonLd
          data={generateReviewSchema({
            headline: `${displayMake} ${displayModel} Review ${year}`,
            description:
              (isAr ? review.verdictAr : review.verdictEn) ||
              `Expert review of the ${year} ${displayMake} ${displayModel}`,
            authorName: review.author.name || "CarSouk Team",
            datePublished: review.publishedAt?.toISOString() || review.createdAt.toISOString(),
            dateModified: review.updatedAt.toISOString(),
            imageUrl: review.featuredImageUrl || undefined,
            ratingValue: ratingOverall,
            make: displayMake,
            model: displayModel,
            year,
            url,
          })}
        />
      )}

      <ReviewLayout
        make={displayMake}
        model={displayModel}
        year={year}
        ratingOverall={ratingOverall}
        featuredImageUrl={review?.featuredImageUrl}
        activeTab="overview"
      >
        {review ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Verdict Box */}
              <div className="rounded-lg bg-teal-50 p-6">
                <h2 className="text-xl font-bold text-charcoal">
                  {isAr ? "الحكم النهائي" : "Verdict"}
                </h2>
                <p className="mt-2 text-foreground">
                  {isAr ? review.verdictAr : review.verdictEn}
                </p>
                <div className="mt-3">
                  <ReviewRating overall={ratingOverall} size="sm" />
                </div>
              </div>

              {/* Pros & Cons */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-charcoal">
                  {isAr ? "الإيجابيات والسلبيات" : "Pros & Cons"}
                </h2>
                <ProsCons
                  pros={((isAr ? review.prosAr : review.prosEn) as string[]) || []}
                  cons={((isAr ? review.consAr : review.consEn) as string[]) || []}
                />
              </div>

              {/* Rating Breakdown */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-charcoal">
                  {isAr ? "تفاصيل التقييم" : "Rating Breakdown"}
                </h2>
                <ReviewRating
                  overall={ratingOverall}
                  categories={[
                    { label: "Performance", labelKey: "performance", score: Number(review.ratingPerformance) },
                    { label: "Interior", labelKey: "interior", score: Number(review.ratingInterior) },
                    { label: "Value", labelKey: "value", score: Number(review.ratingValue) },
                    { label: "Reliability", labelKey: "reliability", score: Number(review.ratingReliability) },
                    { label: "Safety", labelKey: "safety", score: Number(review.ratingSafety) },
                  ]}
                  size="md"
                />
              </div>

              {/* Quick Specs */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-charcoal">
                  {isAr ? "المواصفات السريعة" : "Quick Specs"}
                </h2>
                <SpecsGrid
                  specs={{
                    fuelType: review.seoKeywords ? "Gasoline" : "Gasoline",
                    transmission: "Automatic",
                    horsepower: 180,
                    engineSize: "2.0L",
                  }}
                  variant="expanded"
                />
              </div>

              {/* YouTube Video */}
              {review.youtubeVideoId && (
                <div>
                  <h2 className="mb-4 text-xl font-bold text-charcoal">
                    {isAr ? "فيديو المراجعة" : "Video Review"}
                  </h2>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${review.youtubeVideoId}`}
                      title={`${displayMake} ${displayModel} Review Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
              )}

              {/* Read Full Review CTA */}
              <Button asChild className="bg-teal-500 text-white hover:bg-teal-600">
                <Link href={`/${makeSlug}/${modelSlug}/review`}>
                  {isAr ? "اقرأ المراجعة الكاملة" : "Read Full Review"}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Available Deals */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {isAr ? "الصفقات المتاحة" : "Available Deals"}
                </h3>
                <div className="mt-3 flex flex-col gap-2">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={`/${makeSlug}/${modelSlug}/new`}>
                      {isAr ? "سيارات جديدة" : "New Cars"}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={`/${makeSlug}/${modelSlug}/used`}>
                      {isAr ? "سيارات مستعملة" : "Used Cars"}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tools Links */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {isAr ? "أدوات مفيدة" : "Useful Tools"}
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  <li>
                    <Link
                      href="/tools/import-calculator"
                      className="text-sm text-teal-500 hover:underline"
                    >
                      {isAr ? "حاسبة تكلفة الاستيراد" : "Import Cost Calculator"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tools/loan-calculator"
                      className="text-sm text-teal-500 hover:underline"
                    >
                      {isAr ? "حاسبة القروض" : "Loan Calculator"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tools/compare"
                      className="text-sm text-teal-500 hover:underline"
                    >
                      {isAr ? "مقارنة السيارات" : "Compare Cars"}
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold">
              {isAr ? "لا توجد مراجعة بعد" : "No review available yet"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr
                ? "سيتم إضافة مراجعة لهذا الموديل قريبا"
                : "A review for this model will be published soon"}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/reviews">{isAr ? "تصفح المراجعات" : "Browse Reviews"}</Link>
            </Button>
          </div>
        )}
      </ReviewLayout>
    </>
  );
}
