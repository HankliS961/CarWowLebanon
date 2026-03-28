/**
 * SEO metadata generators for CarSouk.
 * Each function returns a Next.js Metadata-compatible object.
 */

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

const SITE_NAME = "CarSouk";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ogImage(url?: string | null): Metadata["openGraph"] {
  if (!url) return {};
  return {
    images: [{ url, width: 1200, height: 630, alt: SITE_NAME }],
  };
}

// ---------------------------------------------------------------------------
// Car Listing
// ---------------------------------------------------------------------------

interface CarListingMeta {
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  priceUsd: number;
  city: string;
  mileageKm: number;
  fuelType: string;
  transmission: string;
  imageUrl?: string | null;
  slug: string;
}

export function generateCarListingMetadata(
  car: CarListingMeta,
  locale: string
): Metadata {
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} for Sale — $${car.priceUsd.toLocaleString()}`;
  const description = `Buy a ${car.year} ${car.make} ${car.model} in ${car.city}, Lebanon. ${car.mileageKm.toLocaleString()} km, ${car.fuelType}, ${car.transmission}. Contact verified dealer. $${car.priceUsd.toLocaleString()}.`;
  const url = absoluteUrl(`/${locale}/cars/${car.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      ...ogImage(car.imageUrl),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Car Review
// ---------------------------------------------------------------------------

interface CarReviewMeta {
  make: string;
  model: string;
  year: number;
  rating: number;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export function generateCarReviewMetadata(
  review: CarReviewMeta,
  locale: string,
  subPage?: string
): Metadata {
  const suffix = subPage ? ` - ${subPage}` : "";
  const title =
    review.seoTitle ||
    `${review.make} ${review.model} Review ${review.year}${suffix} — Price, Specs & Deals`;
  const description =
    review.seoDescription ||
    `Read our full ${review.make} ${review.model} review. Interior, performance, specs, colours, and the best deals in Lebanon. Rating: ${review.rating}/10.`;
  const makeSlug = review.make.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = review.model.toLowerCase().replace(/\s+/g, "-");
  const path = subPage
    ? `/${locale}/${makeSlug}/${modelSlug}/${subPage.toLowerCase()}`
    : `/${locale}/${makeSlug}/${modelSlug}`;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...ogImage(review.imageUrl),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Blog Post
// ---------------------------------------------------------------------------

interface BlogPostMeta {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  slug: string;
}

export function generateBlogPostMetadata(
  post: BlogPostMeta,
  locale: string
): Metadata {
  const title = post.seoTitle || `${post.title} | ${SITE_NAME}`;
  const description =
    post.seoDescription || post.excerpt || `Read ${post.title} on CarSouk Blog.`;
  const url = absoluteUrl(`/${locale}/blog/${post.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...ogImage(post.imageUrl),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Dealer Profile
// ---------------------------------------------------------------------------

interface DealerMeta {
  companyName: string;
  city: string;
  region: string;
  logoUrl?: string | null;
  slug: string;
}

export function generateDealerMetadata(
  dealer: DealerMeta,
  locale: string
): Metadata {
  const title = `${dealer.companyName} — Car Dealer in ${dealer.city}, Lebanon`;
  const description = `View ${dealer.companyName}'s inventory, ratings, and reviews. Verified car dealer in ${dealer.city}, ${dealer.region}, Lebanon.`;
  const url = absoluteUrl(`/${locale}/dealers/${dealer.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      ...ogImage(dealer.logoUrl),
    },
  };
}

// ---------------------------------------------------------------------------
// Brand Hub
// ---------------------------------------------------------------------------

interface BrandHubMeta {
  makeEn: string;
  makeAr: string;
  logoUrl?: string | null;
  slug: string;
}

export function generateBrandHubMetadata(
  brand: BrandHubMeta,
  locale: string
): Metadata {
  const title = `${brand.makeEn} Cars for Sale in Lebanon — New & Used`;
  const description = `Browse ${brand.makeEn} cars for sale in Lebanon. New and used ${brand.makeEn} listings from verified dealers. Compare prices and get the best deal.`;
  const url = absoluteUrl(`/${locale}/${brand.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      ...ogImage(brand.logoUrl),
    },
  };
}

// ---------------------------------------------------------------------------
// Tool Page
// ---------------------------------------------------------------------------

const TOOL_META: Record<
  string,
  { titleEn: string; descEn: string }
> = {
  "import-calculator": {
    titleEn: "Import Cost Calculator Lebanon — Customs Duty & Total Cost",
    descEn:
      "Calculate the total cost of importing a car to Lebanon. Includes customs duty, VAT, registration, shipping, and inspection fees.",
  },
  "loan-calculator": {
    titleEn: "Car Loan Calculator Lebanon — Monthly Payments & Rates",
    descEn:
      "Calculate your monthly car loan payments in Lebanon. Compare terms, interest rates, and total costs from Lebanese banks.",
  },
  "fuel-calculator": {
    titleEn: "Fuel Cost Calculator Lebanon — Monthly Fuel Expenses",
    descEn:
      "Estimate your monthly and yearly fuel costs in Lebanon. Compare gasoline, diesel, and electric running costs.",
  },
  compare: {
    titleEn: "Compare Cars Side by Side — Specs, Prices & Ratings",
    descEn:
      "Compare 2-3 cars side by side. Specs, prices, ratings, and features compared to help you choose the best car in Lebanon.",
  },
  valuation: {
    titleEn: "Car Valuation Tool Lebanon — What Is My Car Worth?",
    descEn:
      "Get an instant estimate of your car's market value in Lebanon. Based on make, model, year, mileage, and condition.",
  },
};

export function generateToolMetadata(
  toolSlug: string,
  locale: string
): Metadata {
  const meta = TOOL_META[toolSlug] || {
    titleEn: "Car Tools & Calculators",
    descEn: "Free car tools and calculators for the Lebanese market.",
  };
  const url = absoluteUrl(`/${locale}/tools/${toolSlug}`);

  return {
    title: meta.titleEn,
    description: meta.descEn,
    alternates: { canonical: url },
    openGraph: {
      title: meta.titleEn,
      description: meta.descEn,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: meta.titleEn,
      description: meta.descEn,
    },
  };
}

// ---------------------------------------------------------------------------
// Guide
// ---------------------------------------------------------------------------

interface GuideMeta {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  slug: string;
}

export function generateGuideMetadata(
  guide: GuideMeta,
  locale: string
): Metadata {
  const title = guide.seoTitle || `${guide.title} | ${SITE_NAME}`;
  const description =
    guide.seoDescription || guide.excerpt || `Read our complete guide: ${guide.title}.`;
  const url = absoluteUrl(`/${locale}/guides/${guide.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...ogImage(guide.imageUrl),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
