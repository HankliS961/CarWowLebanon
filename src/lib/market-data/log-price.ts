import { PrismaClient } from "@prisma/client";

/**
 * Log when a bid is accepted on a sell listing (real transaction price).
 */
export async function logSellListingAccepted(
  db: PrismaClient,
  data: {
    make: string;
    model: string;
    year: number;
    trim?: string | null;
    mileageKm?: number | null;
    condition?: string | null;
    carSource?: string | null;
    finalPriceUsd: number;
    askingPriceUsd?: number | null;
    bidCount: number;
    auctionDurationHrs?: number | null;
    region?: string | null;
    sellListingId: string;
  }
) {
  try {
    await db.marketPriceData.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        trim: data.trim,
        mileageKm: data.mileageKm,
        source: "SELL_AUCTION_ACCEPTED",
        condition: data.condition as any,
        carSource: data.carSource as any,
        finalPriceUsd: data.finalPriceUsd,
        askingPriceUsd: data.askingPriceUsd,
        bidCount: data.bidCount,
        auctionDurationHrs: data.auctionDurationHrs,
        region: data.region as any,
        sellListingId: data.sellListingId,
      },
    });
  } catch (error) {
    console.error("[MarketData] Failed to log sell listing accepted:", error);
  }
}

/**
 * Log when a dealer creates an active listing (asking price data point).
 */
export async function logDealerListingCreated(
  db: PrismaClient,
  data: {
    make: string;
    model: string;
    year: number;
    trim?: string | null;
    mileageKm?: number | null;
    condition?: string | null;
    carSource?: string | null;
    askingPriceUsd: number;
    region?: string | null;
    carListingId: string;
  }
) {
  try {
    await db.marketPriceData.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        trim: data.trim,
        mileageKm: data.mileageKm,
        source: "DEALER_LISTING_CREATED",
        condition: data.condition as any,
        carSource: data.carSource as any,
        askingPriceUsd: data.askingPriceUsd,
        region: data.region as any,
        carListingId: data.carListingId,
      },
    });
  } catch (error) {
    console.error("[MarketData] Failed to log dealer listing created:", error);
  }
}

/**
 * Log when a dealer marks a listing as sold (confirmed sale price).
 */
export async function logDealerListingSold(
  db: PrismaClient,
  data: {
    make: string;
    model: string;
    year: number;
    trim?: string | null;
    mileageKm?: number | null;
    condition?: string | null;
    carSource?: string | null;
    finalPriceUsd: number;
    region?: string | null;
    carListingId: string;
  }
) {
  try {
    await db.marketPriceData.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        trim: data.trim,
        mileageKm: data.mileageKm,
        source: "DEALER_LISTING_SOLD",
        condition: data.condition as any,
        carSource: data.carSource as any,
        finalPriceUsd: data.finalPriceUsd,
        region: data.region as any,
        carListingId: data.carListingId,
      },
    });
  } catch (error) {
    console.error("[MarketData] Failed to log dealer listing sold:", error);
  }
}
