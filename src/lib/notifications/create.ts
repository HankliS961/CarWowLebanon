import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

/**
 * Create an in-app notification for a user.
 * Also dispatches to other channels based on user preferences (future).
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body: body ?? undefined,
      data: (data as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

/**
 * Notify seller about a new bid on their sell listing.
 */
export async function notifyNewBid({
  sellerId,
  carTitle,
  bidAmount,
  dealerName,
  sellListingId,
}: {
  sellerId: string;
  carTitle: string;
  bidAmount: number;
  dealerName: string;
  sellListingId: string;
}) {
  return createNotification({
    userId: sellerId,
    type: "NEW_BID",
    title: `New bid on your ${carTitle}`,
    body: `${dealerName} bid $${bidAmount.toLocaleString()} on your car.`,
    data: { sellListingId, bidAmount, dealerName },
  });
}

/**
 * Notify a dealer that their bid was accepted.
 */
export async function notifyBidAccepted({
  dealerUserId,
  carTitle,
  bidAmount,
  sellListingId,
}: {
  dealerUserId: string;
  carTitle: string;
  bidAmount: number;
  sellListingId: string;
}) {
  return createNotification({
    userId: dealerUserId,
    type: "NEW_BID",
    title: `Your bid was accepted!`,
    body: `Your bid of $${bidAmount.toLocaleString()} for ${carTitle} has been accepted.`,
    data: { sellListingId, bidAmount, accepted: true },
  });
}

/**
 * Notify buyer about a new offer on their configuration.
 */
export async function notifyNewOffer({
  buyerId,
  dealerName,
  priceOffered,
  configurationId,
}: {
  buyerId: string;
  dealerName: string;
  priceOffered: number;
  configurationId: string;
}) {
  return createNotification({
    userId: buyerId,
    type: "NEW_OFFER",
    title: "New offer on your configuration",
    body: `${dealerName} offered $${priceOffered.toLocaleString()} for your requested car.`,
    data: { configurationId, dealerName, priceOffered },
  });
}

/**
 * Notify dealer about a new inquiry.
 */
export async function notifyNewInquiry({
  dealerUserId,
  buyerName,
  carTitle,
  inquiryId,
}: {
  dealerUserId: string;
  buyerName: string;
  carTitle: string;
  inquiryId: string;
}) {
  return createNotification({
    userId: dealerUserId,
    type: "NEW_INQUIRY",
    title: `New inquiry on ${carTitle}`,
    body: `${buyerName} is interested in this car.`,
    data: { inquiryId, buyerName },
  });
}

/**
 * Notify users who saved a car about a price drop.
 */
export async function notifyPriceDrop({
  userId,
  carTitle,
  oldPrice,
  newPrice,
  carId,
}: {
  userId: string;
  carTitle: string;
  oldPrice: number;
  newPrice: number;
  carId: string;
}) {
  const savings = oldPrice - newPrice;
  return createNotification({
    userId,
    type: "PRICE_DROP",
    title: `Price drop on ${carTitle}`,
    body: `Price reduced by $${savings.toLocaleString()} — now $${newPrice.toLocaleString()}.`,
    data: { carId, oldPrice, newPrice },
  });
}

/**
 * Notify user that a new listing matches their search alert.
 */
export async function notifyListingMatch({
  userId,
  carTitle,
  carId,
  alertId,
}: {
  userId: string;
  carTitle: string;
  carId: string;
  alertId: string;
}) {
  return createNotification({
    userId,
    type: "LISTING_MATCH",
    title: "New car matches your alert",
    body: `A ${carTitle} was just listed and matches your saved search.`,
    data: { carId, alertId },
  });
}

/**
 * Notify all verified dealers about a new auction listing.
 */
export async function notifyNewAuction({
  sellListingId,
  carTitle,
  askingPrice,
  sellerName,
}: {
  sellListingId: string;
  carTitle: string;
  askingPrice?: number;
  sellerName: string;
}) {
  // Get all verified dealers' user IDs
  const dealers = await prisma.dealer.findMany({
    where: { isVerified: true },
    select: { userId: true },
  });

  if (dealers.length === 0) return;

  const priceText = askingPrice
    ? ` — asking $${askingPrice.toLocaleString()}`
    : "";

  await prisma.notification.createMany({
    data: dealers.map((d) => ({
      userId: d.userId,
      type: "NEW_AUCTION" as const,
      title: `New auction: ${carTitle}`,
      body: `${sellerName} listed a ${carTitle} for bidding${priceText}. Place your bid now!`,
      data: { sellListingId },
    })),
  });
}

/**
 * Notify buyer that a new dealer listing matches their car request.
 */
export async function notifyCarRequestMatch({
  buyerId,
  dealerName,
  make,
  model,
  carId,
}: {
  buyerId: string;
  dealerName: string;
  make: string;
  model: string;
  carId?: string;
}) {
  return createNotification({
    userId: buyerId,
    type: "CAR_REQUEST_MATCH",
    title: `${dealerName} has the car you're looking for!`,
    body: `${dealerName} responded to your request for a ${make} ${model}.`,
    data: { dealerName, make, model, carId },
  });
}

/**
 * Notify all verified BRONZE+ dealers about a new buyer car request.
 * Uses createMany for bulk efficiency.
 */
export async function notifyNewCarRequest({
  make,
  model,
  yearFrom,
  yearTo,
}: {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}) {
  const dealers = await prisma.dealer.findMany({
    where: {
      isVerified: true,
      subscriptionTier: { in: ["BRONZE", "SILVER", "GOLD"] },
    },
    select: { userId: true },
  });

  if (dealers.length === 0) return;

  const yearRange = yearFrom === yearTo ? `${yearFrom}` : `${yearFrom}-${yearTo}`;
  const carDesc = `${yearRange} ${make} ${model}`;

  await prisma.notification.createMany({
    data: dealers.map((d) => ({
      userId: d.userId,
      type: "NEW_CAR_REQUEST" as const,
      title: `Someone is looking for a ${carDesc}`,
      body: `A buyer in the market is searching for a ${carDesc}. If you have one or can source it, check Buyer Requests to respond.`,
      data: { make, model, yearFrom, yearTo },
    })),
  });
}

/**
 * Notify dealer about a new review.
 */
export async function notifyReviewReceived({
  dealerUserId,
  reviewerName,
  rating,
  dealerId,
}: {
  dealerUserId: string;
  reviewerName: string;
  rating: number;
  dealerId: string;
}) {
  return createNotification({
    userId: dealerUserId,
    type: "REVIEW_RECEIVED",
    title: "New review received",
    body: `${reviewerName} left a ${rating}-star review.`,
    data: { dealerId, rating },
  });
}
