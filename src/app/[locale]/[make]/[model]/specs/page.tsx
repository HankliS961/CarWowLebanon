import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { generateCarReviewMetadata } from "@/lib/seo/metadata";
import { ReviewLayout } from "@/components/reviews/ReviewLayout";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { FullSpecification } from "@/types/content";

interface ModelSpecsPageProps {
  params: Promise<{ locale: string; make: string; model: string }>;
}

export async function generateMetadata({ params }: ModelSpecsPageProps): Promise<Metadata> {
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
    "Specs"
  );
}

export default async function ModelSpecsPage({ params }: ModelSpecsPageProps) {
  const { locale, make, model } = await params;
  const isAr = locale === "ar";

  const review = await api.content.getCarReviewByMakeModel({ make, model });

  const displayMake = review?.make || make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = review?.model || model.charAt(0).toUpperCase() + model.slice(1);
  const year = review?.year || new Date().getFullYear();
  const ratingOverall = review ? Number(review.ratingOverall) : 0;

  // Specifications data (would come from a dedicated specs table in production)
  const specifications: FullSpecification[] = [
    {
      category: "Performance",
      categoryAr: "الأداء",
      items: [
        { label: "Engine", labelAr: "المحرك", value: "2.0L 4-Cylinder" },
        { label: "Horsepower", labelAr: "القوة الحصانية", value: "180 hp" },
        { label: "Torque", labelAr: "عزم الدوران", value: "175 lb-ft" },
        { label: "0-100 km/h", labelAr: "0-100 كم/س", value: "8.5 sec" },
        { label: "Top Speed", labelAr: "السرعة القصوى", value: "210 km/h" },
      ],
    },
    {
      category: "Dimensions",
      categoryAr: "الأبعاد",
      items: [
        { label: "Length", labelAr: "الطول", value: "4,630 mm" },
        { label: "Width", labelAr: "العرض", value: "1,780 mm" },
        { label: "Height", labelAr: "الارتفاع", value: "1,435 mm" },
        { label: "Wheelbase", labelAr: "قاعدة العجلات", value: "2,700 mm" },
        { label: "Boot Space", labelAr: "مساحة الصندوق", value: "470 L" },
      ],
    },
    {
      category: "Fuel Economy",
      categoryAr: "استهلاك الوقود",
      items: [
        { label: "City", labelAr: "المدينة", value: "8.5 L/100km" },
        { label: "Highway", labelAr: "الطريق السريع", value: "6.2 L/100km" },
        { label: "Combined", labelAr: "المشترك", value: "7.1 L/100km" },
        { label: "Fuel Tank", labelAr: "خزان الوقود", value: "55 L" },
      ],
    },
    {
      category: "Drivetrain",
      categoryAr: "نقل الحركة",
      items: [
        { label: "Transmission", labelAr: "ناقل الحركة", value: "CVT / 6-Speed Auto" },
        { label: "Drivetrain", labelAr: "نظام الدفع", value: "FWD / AWD" },
        { label: "Gears", labelAr: "عدد السرعات", value: "6" },
      ],
    },
    {
      category: "Safety",
      categoryAr: "الأمان",
      items: [
        { label: "Airbags", labelAr: "الوسائد الهوائية", value: "6 (front, side, curtain)" },
        { label: "ABS", labelAr: "مانع الانغلاق", value: "Standard" },
        { label: "Stability Control", labelAr: "التحكم بالثبات", value: "Standard" },
        { label: "Backup Camera", labelAr: "كاميرا خلفية", value: "Standard" },
        { label: "Blind Spot Monitor", labelAr: "مراقبة النقطة العمياء", value: "Available" },
      ],
    },
  ];

  return (
    <ReviewLayout
      make={displayMake}
      model={displayModel}
      year={year}
      ratingOverall={ratingOverall}
      featuredImageUrl={review?.featuredImageUrl}
      activeTab="specs"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal">
            {isAr
              ? `مواصفات ${displayMake} ${displayModel} ${year}`
              : `${displayMake} ${displayModel} ${year} Specifications`}
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/tools/compare">
              {isAr ? "مقارنة مع منافس" : "Compare with Rival"}
            </Link>
          </Button>
        </div>

        {/* Specs Tables by Category */}
        <div className="space-y-6">
          {specifications.map((section) => (
            <div key={section.category} className="overflow-hidden rounded-lg border">
              <div className="bg-muted/50 px-4 py-3">
                <h3 className="text-sm font-semibold text-charcoal">
                  {isAr ? section.categoryAr : section.category}
                </h3>
              </div>
              <table className="w-full" role="table">
                <tbody>
                  {section.items.map((item, index) => (
                    <tr
                      key={item.label}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    >
                      <td className="px-4 py-2.5 text-sm text-muted-foreground w-1/2">
                        {isAr ? item.labelAr : item.label}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/${make}/${model}/review`}>
              {isAr ? "اقرأ المراجعة" : "Read Review"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${make}/${model}/prices`}>
              {isAr ? "عرض الأسعار" : "View Prices"}
            </Link>
          </Button>
          <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
            <Link href="/tools/import-calculator">
              {isAr ? "احسب تكلفة الاستيراد" : "Calculate Import Cost"}
            </Link>
          </Button>
        </div>
      </div>
    </ReviewLayout>
  );
}
