import type { Metadata } from "next";
import Image from "next/image";
import { api } from "@/lib/trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { ReviewRating } from "@/components/shared/ReviewRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { Link } from "@/i18n/routing";
import { Star, ArrowRight, Search } from "lucide-react";

interface ReviewsIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ReviewsIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "Expert Car Reviews — In-Depth Reviews for Lebanon";
  const description =
    "Read expert car reviews with ratings, specs, interior photos, and prices for the Lebanese market. Find the best car for you.";
  const url = absoluteUrl(`/${locale}/reviews`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "CarSouk", type: "website" },
  };
}

export default async function ReviewsIndexPage({
  params,
}: ReviewsIndexPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const [reviewsData, reviewedMakes] = await Promise.all([
    api.content.listCarReviews({ page: 1, limit: 12 }),
    api.content.getReviewedMakes(),
  ]);

  const bodyTypes = [
    { slug: "suv", labelEn: "SUV", labelAr: "دفع رباعي" },
    { slug: "sedan", labelEn: "Sedan", labelAr: "سيدان" },
    { slug: "hatchback", labelEn: "Hatchback", labelAr: "هاتشباك" },
    { slug: "pickup", labelEn: "Pickup", labelAr: "بيك أب" },
    { slug: "electric", labelEn: "Electric", labelAr: "كهربائية" },
  ];

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Reviews", labelAr: "المراجعات" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebsiteSchema()} />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Search className="mx-auto mb-4 h-10 w-10 text-teal-500" />
        <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
          {isAr ? "مراجعات السيارات من الخبراء" : "Expert Car Reviews"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isAr
            ? "مراجعات شاملة مع التقييمات والمواصفات والأسعار للسوق اللبناني"
            : "In-depth reviews with ratings, specs, and prices for the Lebanese market"}
        </p>
      </section>

      {/* Browse by Brand */}
      {reviewedMakes.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <h2 className="mb-4 text-xl font-semibold text-charcoal">
            {isAr ? "تصفح حسب الماركة" : "Browse by Brand"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {reviewedMakes.map((make) => (
              <Link
                key={make}
                href={`/${make.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-500"
                >
                  {make}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse by Type */}
      <section className="container mx-auto px-4 pb-8">
        <h2 className="mb-4 text-xl font-semibold text-charcoal">
          {isAr ? "تصفح حسب النوع" : "Browse by Type"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {bodyTypes.map((type) => (
            <Badge
              key={type.slug}
              variant="outline"
              className="cursor-pointer px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-500"
            >
              {isAr ? type.labelAr : type.labelEn}
            </Badge>
          ))}
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">
          {isAr ? "أحدث المراجعات" : "Latest Reviews"}
        </h2>

        {reviewsData.reviews.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviewsData.reviews.map((review) => {
              const makeSlug = review.make.toLowerCase().replace(/\s+/g, "-");
              const modelSlug = review.model.toLowerCase().replace(/\s+/g, "-");

              return (
                <Link
                  key={review.id}
                  href={`/${makeSlug}/${modelSlug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={review.featuredImageUrl || "/images/car-placeholder.webp"}
                      alt={`${review.make} ${review.model} ${review.year}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <Badge className="absolute start-3 top-3 bg-teal-500 text-white">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      {Number(review.ratingOverall).toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-teal-500 transition-colors">
                      {review.make} {review.model} {review.year}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {isAr ? review.excerptAr : review.excerptEn}
                    </p>
                    <div className="mt-auto flex items-center gap-1 pt-3 text-sm font-medium text-teal-500">
                      <span>{isAr ? "اقرأ المراجعة" : "Read Review"}</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold">
              {isAr ? "لا توجد مراجعات بعد" : "No reviews yet"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr ? "ترقبوا مراجعاتنا القادمة" : "Stay tuned for our upcoming reviews"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
