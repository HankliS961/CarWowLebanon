import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateReviewSchema } from "@/lib/seo/json-ld";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface ModelReviewPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({
  params,
}: ModelReviewPageProps): Promise<Metadata> {
  const { locale, make, model } = await params;
  const review = await api.content.getCarReviewByMakeModel({ make, model });
  if (!review) return {};
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
    locale,
    "Review"
  );
}

export default async function ModelReviewPage({ params }: ModelReviewPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;
  const url = absoluteUrl(`/${locale}/${make}/${model}/review`);

  return (
    <>
      {review && (
        <JsonLd
          data={generateReviewSchema({
            headline: `${displayMake} ${displayModel} Full Review ${year}`,
            description:
              (isAr ? review.excerptAr : review.excerptEn) ||
              `Full editorial review of the ${year} ${displayMake} ${displayModel}`,
            authorName: review.author.name || "CarSouk Team",
            datePublished: review.publishedAt?.toISOString() || review.createdAt.toISOString(),
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
        activeTab="review"
      >
        {review ? (
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-charcoal">
              {isAr
                ? `مراجعة ${displayMake} ${displayModel} ${year} الكاملة`
                : `${displayMake} ${displayModel} ${year} Full Review`}
            </h2>

            {/* YouTube Video */}
            {review.youtubeVideoId && (
              <div className="mt-6 aspect-video overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${review.youtubeVideoId}`}
                  title={`${displayMake} ${displayModel} Review Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Full Review Content */}
            <article
              className="prose prose-lg mt-8 max-w-none prose-headings:text-charcoal prose-a:text-teal-500 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: isAr ? review.contentAr : review.contentEn,
              }}
            />

            {/* Internal Links */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/${make}/${model}/specs`}>
                  {isAr ? "عرض المواصفات" : "View Specs"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${make}/${model}/interior`}>
                  {isAr ? "المقصورة الداخلية" : "Interior"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${make}/${model}/prices`}>
                  {isAr ? "الأسعار" : "Prices"}
                </Link>
              </Button>
              <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
                <Link href={`/${make}/${model}/used`}>
                  {isAr ? "عرض الصفقات" : "View Deals"}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {isAr ? "المراجعة الكاملة قادمة قريبا" : "Full review coming soon"}
            </p>
          </div>
        )}
      </ReviewLayout>
    </>
  );
}
