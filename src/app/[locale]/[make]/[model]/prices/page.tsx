import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { formatPriceUsd } from "@/lib/utils";
import { ArrowRight, TrendingDown, Calculator } from "lucide-react";
import type { TrimPrice } from "@/types/content";

interface ModelPricesPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({ params }: ModelPricesPageProps): Promise<Metadata> {
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
    "Prices"
  );
}

export default async function ModelPricesPage({ params }: ModelPricesPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;

  // Trim pricing data (would come from database in production)
  const trims: TrimPrice[] = [
    { trim: "Base / L", priceUsd: 24500, isAvailable: true },
    { trim: "LE", priceUsd: 27000, isAvailable: true },
    { trim: "SE", priceUsd: 29500, isAvailable: true },
    { trim: "XLE", priceUsd: 32000, isAvailable: true },
    { trim: "Limited", priceUsd: 35500, isAvailable: false },
  ];

  const minPrice = Math.min(...trims.map((t) => t.priceUsd));
  const maxPrice = Math.max(...trims.map((t) => t.priceUsd));

  return (
    <ReviewLayout
      make={displayMake}
      model={displayModel}
      year={year}
      ratingOverall={ratingOverall}
      priceFrom={minPrice}
      featuredImageUrl={review?.featuredImageUrl}
      activeTab="prices"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            {isAr
              ? `أسعار ${displayMake} ${displayModel} ${year} في لبنان`
              : `${displayMake} ${displayModel} ${year} Prices in Lebanon`}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isAr
              ? `يتراوح سعر ${displayMake} ${displayModel} ${year} بين ${formatPriceUsd(minPrice)} و ${formatPriceUsd(maxPrice)} في لبنان.`
              : `The ${year} ${displayMake} ${displayModel} ranges from ${formatPriceUsd(minPrice)} to ${formatPriceUsd(maxPrice)} in Lebanon.`}
          </p>
        </div>

        {/* Price Table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full" role="table">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-start text-sm font-semibold text-charcoal">
                  {isAr ? "الفئة" : "Trim"}
                </th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-charcoal">
                  {isAr ? "السعر (USD)" : "Price (USD)"}
                </th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-charcoal">
                  {isAr ? "التوفر" : "Availability"}
                </th>
                <th className="px-4 py-3 text-end text-sm font-semibold text-charcoal" />
              </tr>
            </thead>
            <tbody>
              {trims.map((trim, index) => (
                <tr
                  key={trim.trim}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {trim.trim}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-teal-500">
                    {formatPriceUsd(trim.priceUsd)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={trim.isAvailable ? "default" : "secondary"}
                      className={
                        trim.isAvailable
                          ? "bg-emerald text-white"
                          : ""
                      }
                    >
                      {trim.isAvailable
                        ? isAr
                          ? "متوفر"
                          : "Available"
                        : isAr
                          ? "غير متوفر"
                          : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {trim.isAvailable && (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/get-offers">
                          {isAr ? "احصل على عرض" : "Get Offer"}
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost of Ownership Estimate */}
        <div className="rounded-lg bg-soft-sky p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-charcoal">
            <Calculator className="h-5 w-5 text-teal-500" />
            {isAr ? "تقدير تكلفة الملكية" : "Cost of Ownership Estimate"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr
              ? "استخدم أدواتنا لحساب التكلفة الإجمالية للملكية، بما في ذلك الوقود والتأمين والصيانة."
              : "Use our tools to estimate total ownership cost, including fuel, insurance, and maintenance."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/tools/import-calculator">
                <Calculator className="me-1.5 h-4 w-4" />
                {isAr ? "حاسبة الاستيراد" : "Import Calculator"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/tools/loan-calculator">
                {isAr ? "حاسبة القروض" : "Loan Calculator"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/tools/fuel-calculator">
                {isAr ? "حاسبة الوقود" : "Fuel Calculator"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Marketplace Listings */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold text-charcoal">
            {isAr ? "إعلانات في السوق" : "Marketplace Listings"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr
              ? `تصفح إعلانات ${displayMake} ${displayModel} المتاحة حاليا على كارسوق.`
              : `Browse ${displayMake} ${displayModel} listings currently available on CarSouk.`}
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild className="bg-teal-500 text-white hover:bg-teal-600">
              <Link href={`/${make}/${model}/new`}>
                {isAr ? "جديدة" : "New"}
                <ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${make}/${model}/used`}>
                {isAr ? "مستعملة" : "Used"}
                <ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </ReviewLayout>
  );
}
