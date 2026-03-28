/**
 * CarSouk shared types.
 * Prisma types are auto-generated; add custom view/form types here.
 */

/** Paginated response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** Car listing card data (subset for list views). */
export interface CarCardData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  priceUsd: number;
  mileageKm: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  condition: string;
  thumbnailUrl: string | null;
  locationCity: string;
  locationRegion: string;
  isFeatured: boolean;
  isNegotiable: boolean;
  dealer: {
    companyName: string;
    companyNameAr: string;
    slug: string;
    isVerified: boolean;
  };
}

/** Dealer card data (subset for list views). */
export interface DealerCardData {
  id: string;
  companyName: string;
  companyNameAr: string;
  slug: string;
  logoUrl: string | null;
  region: string;
  city: string;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  reviewCount: number;
  carsCount: number;
}

/** Search filter state. */
export interface CarFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  condition?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  region?: string;
  source?: string;
  sort?: string;
}
