import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { ColourOption } from "@/types/content";

interface ModelColoursPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({ params }: ModelColoursPageProps): Promise<Metadata> {
  const { locale, make, model } = await params;
  const review = await api.content.getCarReviewByMakeModel({ make, model });
  if (!review) return {};
  return generateCarReviewMetadata(
    {
      make: review.make,
      model: review.model,
      year: review.year,
      rating: Number(review.ratingOverall),
      imageUrl: review.featuredImageUrl,
    },
    locale,
    "Colours"
  );
}

export default async function ModelColoursPage({ params }: ModelColoursPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;

  // Colour data (would come from a dedicated colours table in production)
  const colours: ColourOption[] = [
    { name: "Pearl White", nameAr: "أبيض لؤلؤي", hex: "#F5F5F0", isPopular: true },
    { name: "Midnight Black", nameAr: "أسود ليلي", hex: "#1A1A1A", isPopular: true },
    { name: "Silver Metallic", nameAr: "فضي معدني", hex: "#C0C0C0" },
    { name: "Celestial Blue", nameAr: "أزرق سماوي", hex: "#2E5090" },
    { name: "Crimson Red", nameAr: "أحمر قرمزي", hex: "#8B0000" },
    { name: "Titanium Gray", nameAr: "رمادي تيتانيوم", hex: "#6E6E6E" },
    { name: "Bronze Metallic", nameAr: "برونزي معدني", hex: "#8C7853" },
    { name: "Forest Green", nameAr: "أخضر غابي", hex: "#2D5A27" },
  ];

  return (
    <ReviewLayout
      make={displayMake}
      model={displayModel}
      year={year}
      ratingOverall={ratingOverall}
      featuredImageUrl={review?.featuredImageUrl}
      activeTab="colours"
    >
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-charcoal">
          {isAr
            ? `ألوان ${displayMake} ${displayModel} ${year} المتاحة`
            : `${displayMake} ${displayModel} ${year} Available Colours`}
        </h2>
        <p className="text-muted-foreground">
          {isAr
            ? `${displayMake} ${displayModel} ${year} متوفر في ${colours.length} ألوان خارجية.`
            : `The ${year} ${displayMake} ${displayModel} is available in ${colours.length} exterior colours.`}
        </p>

        {/* Colour Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colours.map((colour) => (
            <div
              key={colour.name}
              className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              {/* Colour Swatch */}
              <div
                className="aspect-[3/2] w-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: colour.hex }}
                aria-label={isAr ? colour.nameAr : colour.name}
              />

              {/* Colour Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {isAr ? colour.nameAr : colour.name}
                  </span>
                  {colour.isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      {isAr ? "شائع" : "Popular"}
                    </Badge>
                  )}
                </div>
                <span className="mt-1 block text-xs text-muted-foreground uppercase">
                  {colour.hex}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/${make}/${model}/prices`}>
              {isAr ? "عرض الأسعار" : "View Prices"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${make}/${model}/interior`}>
              {isAr ? "المقصورة الداخلية" : "Interior"}
            </Link>
          </Button>
          <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
            <Link href={`/${make}/${model}/used`}>
              {isAr ? "تصفح الصفقات" : "Browse Deals"}
            </Link>
          </Button>
        </div>
      </div>
    </ReviewLayout>
  );
}
