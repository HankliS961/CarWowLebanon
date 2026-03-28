/**
 * JSON-LD structured data generators for CarSouk.
 * Produces schema.org compliant markup for search engine rich results.
 */

import { absoluteUrl } from "@/lib/utils";

const SITE_NAME = "CarSouk";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://carsouk.com";

// ---------------------------------------------------------------------------
// WebSite (with SearchAction for sitelinks search box)
// ---------------------------------------------------------------------------

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/cars?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// Vehicle (for car listings)
// ---------------------------------------------------------------------------

interface VehicleSchemaInput {
  name: string;
  make: string;
  model: string;
  year: number;
  mileageKm?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  priceUsd: number;
  condition: "new" | "used";
  imageUrl?: string;
  url: string;
  dealerName?: string;
  description?: string;
}

export function generateVehicleSchema(car: VehicleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.name,
    manufacturer: { "@type": "Organization", name: car.make },
    model: car.model,
    modelDate: String(car.year),
    vehicleModelDate: String(car.year),
    ...(car.mileageKm !== undefined && {
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: car.mileageKm,
        unitCode: "KMT",
      },
    }),
    ...(car.fuelType && { fuelType: car.fuelType }),
    ...(car.transmission && { vehicleTransmission: car.transmission }),
    ...(car.bodyType && { bodyType: car.bodyType }),
    ...(car.color && { color: car.color }),
    ...(car.description && { description: car.description }),
    itemCondition: car.condition === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: car.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: car.url,
      ...(car.dealerName && {
        seller: { "@type": "AutoDealer", name: car.dealerName },
      }),
    },
    ...(car.imageUrl && { image: car.imageUrl }),
    url: car.url,
  };
}

// ---------------------------------------------------------------------------
// AutoDealer (for dealer profiles)
// ---------------------------------------------------------------------------

interface AutoDealerSchemaInput {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  url: string;
  logoUrl?: string;
  ratingAvg?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
}

export function generateAutoDealerSchema(dealer: AutoDealerSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.name,
    ...(dealer.description && { description: dealer.description }),
    url: dealer.url,
    ...(dealer.logoUrl && { image: dealer.logoUrl }),
    ...(dealer.phone && { telephone: dealer.phone }),
    ...(dealer.email && { email: dealer.email }),
    address: {
      "@type": "PostalAddress",
      ...(dealer.address && { streetAddress: dealer.address }),
      ...(dealer.city && { addressLocality: dealer.city }),
      ...(dealer.region && { addressRegion: dealer.region }),
      addressCountry: "LB",
    },
    ...(dealer.lat && dealer.lng && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: dealer.lat,
        longitude: dealer.lng,
      },
    }),
    ...(dealer.ratingAvg && dealer.reviewCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: dealer.ratingAvg,
        reviewCount: dealer.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

// ---------------------------------------------------------------------------
// Review (for editorial car reviews)
// ---------------------------------------------------------------------------

interface ReviewSchemaInput {
  headline: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  ratingValue: number;
  make: string;
  model: string;
  year: number;
  url: string;
}

export function generateReviewSchema(review: ReviewSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: review.headline,
    description: review.description,
    author: { "@type": "Person", name: review.authorName },
    datePublished: review.datePublished,
    ...(review.dateModified && { dateModified: review.dateModified }),
    ...(review.imageUrl && { image: review.imageUrl }),
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.ratingValue,
      bestRating: 10,
      worstRating: 1,
    },
    itemReviewed: {
      "@type": "Vehicle",
      name: `${review.year} ${review.make} ${review.model}`,
      manufacturer: { "@type": "Organization", name: review.make },
      model: review.model,
      modelDate: String(review.year),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: review.url,
  };
}

// ---------------------------------------------------------------------------
// Article (for blog posts and guides)
// ---------------------------------------------------------------------------

interface ArticleSchemaInput {
  headline: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  url: string;
  section?: string;
}

export function generateArticleSchema(article: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    author: { "@type": "Person", name: article.authorName },
    datePublished: article.datePublished,
    ...(article.dateModified && { dateModified: article.dateModified }),
    ...(article.imageUrl && { image: article.imageUrl }),
    ...(article.section && { articleSection: article.section }),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
    url: article.url,
  };
}

// ---------------------------------------------------------------------------
// FAQPage (for guides with FAQ sections)
// ---------------------------------------------------------------------------

interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// ItemList (for roundups and ranked lists)
// ---------------------------------------------------------------------------

interface ItemListEntry {
  name: string;
  url?: string;
  imageUrl?: string;
  position?: number;
}

export function generateItemListSchema(
  listName: string,
  items: ItemListEntry[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      ...(item.url && { url: item.url }),
      ...(item.imageUrl && { image: item.imageUrl }),
    })),
  };
}

// ---------------------------------------------------------------------------
// WebApplication (for interactive tools)
// ---------------------------------------------------------------------------

interface WebAppSchemaInput {
  name: string;
  description: string;
  url: string;
  category?: string;
}

export function generateWebApplicationSchema(app: WebAppSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: app.category || "UtilitiesApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
