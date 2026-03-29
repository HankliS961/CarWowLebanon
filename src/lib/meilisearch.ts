import { MeiliSearch } from "meilisearch";

/**
 * Meilisearch client for full-text car search.
 * Returns null when MEILISEARCH_HOST is not configured,
 * allowing the app to degrade gracefully to Prisma queries.
 */
const getMeiliClient = () => {
  if (!process.env.MEILISEARCH_HOST) {
    console.warn(
      "[Meilisearch] No MEILISEARCH_HOST configured, search disabled"
    );
    return null;
  }
  return new MeiliSearch({
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_API_KEY,
  });
};

export const meiliClient = getMeiliClient();

export const CARS_INDEX = "cars";

/** Configure the cars index settings (call once on setup/deploy). */
export async function setupCarsIndex() {
  if (!meiliClient) return;
  const index = meiliClient.index(CARS_INDEX);

  await index.updateSettings({
    searchableAttributes: [
      "make",
      "model",
      "trim",
      "descriptionEn",
      "descriptionAr",
      "locationCity",
    ],
    filterableAttributes: [
      "condition",
      "source",
      "make",
      "model",
      "year",
      "bodyType",
      "fuelType",
      "transmission",
      "priceUsd",
      "mileageKm",
      "locationRegion",
      "colorExterior",
      "isFeatured",
      "status",
      "dealerId",
    ],
    sortableAttributes: [
      "priceUsd",
      "createdAt",
      "mileageKm",
      "viewsCount",
      "year",
    ],
    displayedAttributes: ["*"],
  });
}

/** Shape of a car document stored in the Meilisearch index. */
export interface MeiliCarDocument {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  condition: string;
  source: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  priceUsd: number;
  mileageKm: number;
  locationRegion: string;
  locationCity?: string | null;
  colorExterior?: string | null;
  isFeatured: boolean;
  status: string;
  dealerId: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  thumbnailUrl?: string | null;
  viewsCount: number;
  createdAt: number; // epoch ms — Meilisearch needs numeric for sorting
}

/** Index a single car document. Converts createdAt Date to epoch ms. */
export async function indexCar(car: {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  condition: string;
  source: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  priceUsd: number | { toNumber?: () => number };
  mileageKm: number;
  locationRegion: string;
  locationCity?: string | null;
  colorExterior?: string | null;
  isFeatured: boolean;
  status: string;
  dealerId: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  thumbnailUrl?: string | null;
  viewsCount: number;
  createdAt: Date;
}) {
  if (!meiliClient) return;

  // Prisma Decimal fields come as objects with toNumber(); normalise to plain number.
  const priceUsd =
    typeof car.priceUsd === "number"
      ? car.priceUsd
      : (car.priceUsd as { toNumber: () => number }).toNumber();

  await meiliClient.index(CARS_INDEX).addDocuments([
    {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      trim: car.trim,
      condition: car.condition,
      source: car.source,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      transmission: car.transmission,
      priceUsd,
      mileageKm: car.mileageKm,
      locationRegion: car.locationRegion,
      locationCity: car.locationCity,
      colorExterior: car.colorExterior,
      isFeatured: car.isFeatured,
      status: car.status,
      dealerId: car.dealerId,
      descriptionEn: car.descriptionEn,
      descriptionAr: car.descriptionAr,
      thumbnailUrl: car.thumbnailUrl,
      viewsCount: car.viewsCount,
      createdAt: car.createdAt.getTime(),
    },
  ]);
}

/** Remove a car document from the index. */
export async function removeCar(carId: string) {
  if (!meiliClient) return;
  await meiliClient.index(CARS_INDEX).deleteDocument(carId);
}

/** Search cars in Meilisearch. Returns null when Meilisearch is not configured. */
export async function searchCars(params: {
  query?: string;
  filters?: string;
  sort?: string[];
  page?: number;
  hitsPerPage?: number;
}) {
  if (!meiliClient) return null;
  return meiliClient.index(CARS_INDEX).search(params.query ?? "", {
    filter: params.filters,
    sort: params.sort,
    page: params.page ?? 1,
    hitsPerPage: params.hitsPerPage ?? 20,
  });
}
