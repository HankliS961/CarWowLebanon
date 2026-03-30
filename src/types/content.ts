/**
 * Content engine types for CarSouk.
 * Covers blog posts, car reviews, guides, roundups, comparisons, and tools.
 */

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export type BlogCategorySlug =
  | "buying-guide"
  | "selling-tips"
  | "car-news"
  | "import-customs"
  | "finance-insurance"
  | "maintenance"
  | "market-analysis";

export interface BlogCategoryMeta {
  slug: BlogCategorySlug;
  dbValue: string;
  labelEn: string;
  labelAr: string;
}

export const BLOG_CATEGORIES: BlogCategoryMeta[] = [
  { slug: "buying-guide", dbValue: "BUYING_GUIDE", labelEn: "Buying Guides", labelAr: "دليل الشراء" },
  { slug: "selling-tips", dbValue: "SELLING_TIPS", labelEn: "Selling Tips", labelAr: "نصائح البيع" },
  { slug: "car-news", dbValue: "CAR_NEWS", labelEn: "Car News", labelAr: "أخبار السيارات" },
  { slug: "import-customs", dbValue: "IMPORT_CUSTOMS", labelEn: "Import & Customs", labelAr: "الاستيراد والجمارك" },
  { slug: "finance-insurance", dbValue: "FINANCE_INSURANCE", labelEn: "Finance & Insurance", labelAr: "التمويل والتأمين" },
  { slug: "maintenance", dbValue: "MAINTENANCE", labelEn: "Maintenance", labelAr: "الصيانة" },
  { slug: "market-analysis", dbValue: "MARKET_ANALYSIS", labelEn: "Market Analysis", labelAr: "تحليل السوق" },
];

export interface BlogPostCard {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string | null;
  excerptAr: string | null;
  category: string;
  tags: string[];
  featuredImageUrl: string | null;
  publishedAt: string | null;
  viewsCount: number;
  author: {
    name: string | null;
    image: string | null;
  };
}

export interface BlogPostFull extends BlogPostCard {
  contentEn: string;
  contentAr: string;
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionAr: string | null;
}

// ---------------------------------------------------------------------------
// Car Reviews
// ---------------------------------------------------------------------------

export interface CarReviewCard {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  titleEn: string;
  titleAr: string;
  excerptEn: string | null;
  excerptAr: string | null;
  ratingOverall: number;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  author: {
    name: string | null;
    image: string | null;
  };
}

export interface CarReviewFull extends CarReviewCard {
  contentEn: string;
  contentAr: string;
  prosEn: string[] | null;
  prosAr: string[] | null;
  consEn: string[] | null;
  consAr: string[] | null;
  verdictEn: string | null;
  verdictAr: string | null;
  ratingValue: number;
  ratingInterior: number;
  ratingPerformance: number;
  ratingReliability: number;
  ratingSafety: number;
  gallery: string[] | null;
  youtubeVideoId: string | null;
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionAr: string | null;
  seoKeywords: string[] | null;
  viewsCount: number;
}

export interface ReviewRatingBreakdown {
  overall: number;
  value: number;
  interior: number;
  performance: number;
  reliability: number;
  safety: number;
}

// ---------------------------------------------------------------------------
// Review Tabs
// ---------------------------------------------------------------------------

export type ReviewTabSlug =
  | "overview"
  | "review"
  | "interior"
  | "specs"
  | "colours"
  | "prices";

export interface ReviewTab {
  slug: ReviewTabSlug;
  labelEn: string;
  labelAr: string;
  href: string;
}

export function getReviewTabs(make: string, model: string): ReviewTab[] {
  const base = `/${make}/${model}`;
  return [
    { slug: "overview", labelEn: "Overview", labelAr: "نظرة عامة", href: base },
    { slug: "review", labelEn: "Review", labelAr: "المراجعة", href: `${base}/review` },
    { slug: "interior", labelEn: "Interior", labelAr: "المقصورة", href: `${base}/interior` },
    { slug: "specs", labelEn: "Specs", labelAr: "المواصفات", href: `${base}/specs` },
    { slug: "colours", labelEn: "Colours", labelAr: "الألوان", href: `${base}/colours` },
    { slug: "prices", labelEn: "Prices", labelAr: "الأسعار", href: `${base}/prices` },
  ];
}

// ---------------------------------------------------------------------------
// Specs
// ---------------------------------------------------------------------------

export interface FullSpecification {
  category: string;
  categoryAr: string;
  items: { label: string; labelAr: string; value: string }[];
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

export interface ColourOption {
  name: string;
  nameAr: string;
  hex: string;
  imageUrl?: string;
  isPopular?: boolean;
}

// ---------------------------------------------------------------------------
// Price Trim
// ---------------------------------------------------------------------------

export interface TrimPrice {
  trim: string;
  priceUsd: number;
  isAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Roundup
// ---------------------------------------------------------------------------

export interface RoundupEntry {
  rank: number;
  make: string;
  model: string;
  year: number;
  rating: number;
  imageUrl: string | null;
  pros: string[];
  cons: string[];
  excerpt: string;
  reviewSlug: string | null;
}

export interface RoundupArticle {
  slug: string;
  titleEn: string;
  titleAr: string;
  introEn: string;
  introAr: string;
  conclusionEn: string;
  conclusionAr: string;
  entries: RoundupEntry[];
  publishedAt: string;
  author: { name: string | null; image: string | null };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export interface ComparisonCar {
  make: string;
  model: string;
  year: number;
  imageUrl: string | null;
  rating: number;
  priceUsd: number;
  specs: Record<string, string>;
}

export interface ComparisonArticle {
  slug: string;
  titleEn: string;
  titleAr: string;
  introEn: string;
  introAr: string;
  verdictEn: string;
  verdictAr: string;
  cars: ComparisonCar[];
  categories: {
    name: string;
    nameAr: string;
    winnerIndex: number;
    descriptionEn: string;
    descriptionAr: string;
  }[];
  publishedAt: string;
  author: { name: string | null; image: string | null };
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

export interface GuideCard {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string | null;
  excerptAr: string | null;
  category: string;
  featuredImageUrl: string | null;
  publishedAt: string | null;
}

export interface GuideFull extends GuideCard {
  contentEn: string;
  contentAr: string;
  faqs: { questionEn: string; questionAr: string; answerEn: string; answerAr: string }[];
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionAr: string | null;
  author: { name: string | null; image: string | null };
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

export interface ImportCostInput {
  originCountry: "USA" | "GULF" | "EUROPE" | "ASIA";
  carValueUsd: number;
  carYear: number;
  engineSize: "UNDER_1500" | "1500_2000" | "2000_3000" | "OVER_3000";
  fuelType: "GASOLINE" | "DIESEL" | "HYBRID" | "ELECTRIC";
  condition: "NEW" | "USED" | "SALVAGE";
}

export interface ImportCostResult {
  carValue: number;
  customsDuty: number;
  customsDutyRate: number;
  vat: number;
  vatRate: number;
  registrationFee: number;
  inspectionFee: number;
  shippingEstimate: number;
  salvageSurcharge: number;
  ageSurcharge: number;
  totalLandedCost: number;
  breakdown: { label: string; labelAr: string; amount: number; percentage: number }[];
}

export interface LoanCalcInput {
  carPrice: number;
  downPayment: number;
  loanTermYears: number;
  interestRate: number;
}

export interface LoanCalcResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  amortization: { month: number; payment: number; principal: number; interest: number; balance: number }[];
}

export interface FuelCalcInput {
  consumptionKmPerL: number;
  dailyDistanceKm: number;
  fuelType: "GASOLINE_95" | "GASOLINE_98" | "DIESEL";
  fuelPricePerLiter: number;
}

export interface FuelCalcResult {
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  costPerKm: number;
  litersPerMonth: number;
}

export interface ValuationInput {
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  source: "LOCAL" | "IMPORTED" | "SALVAGE";
}

export interface ValuationResult {
  estimatedLow: number;
  estimatedMid: number;
  estimatedHigh: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  trend: "UP" | "DOWN" | "STABLE";
  similarCount: number;
}
