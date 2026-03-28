import type { Metadata } from "next";
import Image from "next/image";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface ModelInteriorPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({
  params,
}: ModelInteriorPageProps): Promise<Metadata> {
  const { locale, make, model } = await params;
  const review = await api.content.getCarReviewByMakeModel({ make, model });
  if (!review) return {};
  const isAr = locale === "ar";
  return generateCarReviewMetadata(
    {
      make: review.make,
      model: review.model,
      year: review.year,
      rating: Number(review.ratingInterior),
      imageUrl: review.featuredImageUrl,
    },
    locale,
    "Interior"
  );
}

export default async function ModelInteriorPage({ params }: ModelInteriorPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;
  const gallery = (review?.gallery as string[]) || [];

  return (
    <ReviewLayout
      make={displayMake}
      model={displayModel}
      year={year}
      ratingOverall={ratingOverall}
      featuredImageUrl={review?.featuredImageUrl}
      activeTab="interior"
    >
      {review ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-charcoal">
            {isAr
              ? `مقصورة ${displayMake} ${displayModel} ${year}`
              : `${displayMake} ${displayModel} ${year} Interior`}
          </h2>

          {/* Interior Gallery */}
          {gallery.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={imageUrl}
                    alt={`${displayMake} ${displayModel} interior ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Interior Review Content */}
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold text-charcoal">
                {isAr ? `تقييم المقصورة: ${Number(review.ratingInterior).toFixed(1)}/10` : `Interior Rating: ${Number(review.ratingInterior).toFixed(1)}/10`}
              </h3>
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${(Number(review.ratingInterior) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Placeholder for detailed interior content */}
            <div className="mt-6 space-y-4 text-foreground">
              <h3 className="text-lg font-semibold">
                {isAr ? "التصميم والمواد" : "Design & Materials"}
              </h3>
              <p className="text-muted-foreground">
                {isAr
                  ? `توفر مقصورة ${displayMake} ${displayModel} ${year} مزيجا من الراحة والعملية مع مواد عالية الجودة وتصميم عصري.`
                  : `The ${year} ${displayMake} ${displayModel} interior offers a blend of comfort and practicality with quality materials and a modern design.`}
              </p>

              <h3 className="text-lg font-semibold">
                {isAr ? "التقنيات والشاشات" : "Technology & Infotainment"}
              </h3>
              <p className="text-muted-foreground">
                {isAr
                  ? "نظام المعلومات والترفيه سهل الاستخدام مع دعم Apple CarPlay و Android Auto."
                  : "The infotainment system is intuitive with Apple CarPlay and Android Auto support."}
              </p>

              <h3 className="text-lg font-semibold">
                {isAr ? "المساحة والراحة" : "Space & Comfort"}
              </h3>
              <p className="text-muted-foreground">
                {isAr
                  ? "مساحة كافية للركاب في المقاعد الأمامية والخلفية مع مساحة تخزين جيدة."
                  : "Adequate passenger space in both front and rear seats with good cargo capacity."}
              </p>
            </div>

            {/* Internal Links */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/${make}/${model}/specs`}>
                  {isAr ? "المواصفات الكاملة" : "Full Specs"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${make}/${model}/colours`}>
                  {isAr ? "الألوان المتاحة" : "Available Colours"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {isAr ? "مراجعة المقصورة قادمة قريبا" : "Interior review coming soon"}
          </p>
        </div>
      )}
    </ReviewLayout>
  );
}
