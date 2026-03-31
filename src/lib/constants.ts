// =============================================================================
// RE-EXPORT UI-ORIENTED CONSTANTS (with bilingual labels)
// =============================================================================

export {
  REGIONS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CAR_CONDITIONS,
  CAR_SOURCES,
  PAGINATION,
  EXCHANGE_RATE_USD_LBP,
} from "./constants/index";

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

/** Listing status enum values matching Prisma schema. */
export const LISTING_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  EXPIRED: "EXPIRED",
} as const;
export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

/** Inquiry status enum values matching Prisma schema. */
export const INQUIRY_STATUS = {
  NEW: "NEW",
  VIEWED: "VIEWED",
  RESPONDED: "RESPONDED",
  CONVERTED: "CONVERTED",
  CLOSED: "CLOSED",
} as const;
export type InquiryStatus = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

/** Configuration status for reverse marketplace. */
export const CONFIGURATION_STATUS = {
  OPEN: "OPEN",
  MATCHED: "MATCHED",
  CLOSED: "CLOSED",
  EXPIRED: "EXPIRED",
} as const;
export type ConfigurationStatus = (typeof CONFIGURATION_STATUS)[keyof typeof CONFIGURATION_STATUS];

/** Offer status for dealer offers on buyer configurations. */
export const OFFER_STATUS = {
  PENDING: "PENDING",
  VIEWED: "VIEWED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;
export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

/** Sell listing status for auction system. */
export const SELL_LISTING_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  LIVE: "LIVE",
  SOLD: "SOLD",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type SellListingStatus = (typeof SELL_LISTING_STATUS)[keyof typeof SELL_LISTING_STATUS];

/** Bid status for dealer bids on sell listings. */
export const BID_STATUS = {
  PENDING: "PENDING",
  WINNING: "WINNING",
  OUTBID: "OUTBID",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;
export type BidStatus = (typeof BID_STATUS)[keyof typeof BID_STATUS];

/** Dealer review status. */
export const REVIEW_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

/** Subscription tiers. */
export const SUBSCRIPTION_TIER = {
  FREE: "FREE",
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
} as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIER)[keyof typeof SUBSCRIPTION_TIER];

/** Dealer account status. */
export const DEALER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type DealerStatus = (typeof DEALER_STATUS)[keyof typeof DEALER_STATUS];

/** User roles. */
export const USER_ROLE = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  DEALER: "DEALER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/** Lebanon regions. */
export const REGION = {
  BEIRUT: "BEIRUT",
  MOUNT_LEBANON: "MOUNT_LEBANON",
  NORTH: "NORTH",
  SOUTH: "SOUTH",
  BEKAA: "BEKAA",
  NABATIEH: "NABATIEH",
} as const;
export type Region = (typeof REGION)[keyof typeof REGION];

/** Contact methods for inquiries. */
export const CONTACT_METHOD = {
  WHATSAPP: "WHATSAPP",
  CALL: "CALL",
  EMAIL: "EMAIL",
  IN_APP: "IN_APP",
} as const;
export type ContactMethod = (typeof CONTACT_METHOD)[keyof typeof CONTACT_METHOD];

// =============================================================================
// STATUS BADGE STYLING
// =============================================================================

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Listing status
  DRAFT: { bg: "bg-gray-100", text: "text-gray-700" },
  ACTIVE: { bg: "bg-emerald/10", text: "text-emerald" },
  SOLD: { bg: "bg-blue-100", text: "text-blue-700" },
  EXPIRED: { bg: "bg-red-100", text: "text-red-700" },
  // Inquiry status
  NEW: { bg: "bg-amber-100", text: "text-amber-700" },
  VIEWED: { bg: "bg-blue-100", text: "text-blue-700" },
  RESPONDED: { bg: "bg-emerald/10", text: "text-emerald" },
  CONVERTED: { bg: "bg-purple-100", text: "text-purple-700" },
  CLOSED: { bg: "bg-gray-100", text: "text-gray-700" },
  // Configuration / offer
  OPEN: { bg: "bg-emerald/10", text: "text-emerald" },
  MATCHED: { bg: "bg-blue-100", text: "text-blue-700" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { bg: "bg-emerald/10", text: "text-emerald" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  // Sell listing
  PENDING_REVIEW: { bg: "bg-amber-100", text: "text-amber-700" },
  LIVE: { bg: "bg-emerald/10", text: "text-emerald" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-700" },
  // Bid
  WINNING: { bg: "bg-emerald/10", text: "text-emerald" },
  OUTBID: { bg: "bg-red-100", text: "text-red-700" },
  // Review
  APPROVED: { bg: "bg-emerald/10", text: "text-emerald" },
  // Dealer status
  SUSPENDED: { bg: "bg-red-100", text: "text-red-700" },
  // Content
  PUBLISHED: { bg: "bg-emerald/10", text: "text-emerald" },
};

// =============================================================================
// SUBSCRIPTION TIER LIMITS
// =============================================================================

export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    maxListings: number;
    reverseMarketplace: boolean;
    analytics: boolean;
    featuredListings: number;
    teamMembers: number;
    buyerRequests: boolean;
    pricePerMonth: number;
  }
> = {
  FREE: {
    maxListings: 5,
    reverseMarketplace: false,
    analytics: false,
    featuredListings: 0,
    teamMembers: 1,
    buyerRequests: false,
    pricePerMonth: 0,
  },
  BRONZE: {
    maxListings: 25,
    reverseMarketplace: true,
    analytics: false,
    featuredListings: 2,
    teamMembers: 3,
    buyerRequests: true,
    pricePerMonth: 49,
  },
  SILVER: {
    maxListings: 75,
    reverseMarketplace: true,
    analytics: true,
    featuredListings: 5,
    teamMembers: 5,
    buyerRequests: true,
    pricePerMonth: 99,
  },
  GOLD: {
    maxListings: 9999,
    reverseMarketplace: true,
    analytics: true,
    featuredListings: 20,
    teamMembers: 15,
    buyerRequests: true,
    pricePerMonth: 199,
  },
};

/** Max active car requests per buyer. */
export const BUYER_REQUEST_LIMITS: Record<string, number> = {
  FREE: 1,
  BRONZE: 3,
  SILVER: 5,
  GOLD: 10,
};

/** Default car request duration in days (admin-adjustable). */
export const DEFAULT_REQUEST_DURATION_DAYS = 7;

// =============================================================================
// CAR FEATURES LIST
// =============================================================================

export const CAR_FEATURES = [
  "sunroof",
  "leather_seats",
  "backup_camera",
  "navigation",
  "parking_sensors",
  "bluetooth",
  "apple_carplay",
  "android_auto",
  "heated_seats",
  "cooled_seats",
  "cruise_control",
  "adaptive_cruise",
  "lane_assist",
  "blind_spot",
  "keyless_entry",
  "push_start",
  "power_seats",
  "memory_seats",
  "panoramic_roof",
  "led_headlights",
  "fog_lights",
  "alloy_wheels",
  "roof_rack",
  "tow_hitch",
  "third_row",
  "rear_ac",
  "dual_zone_ac",
  "heads_up_display",
  "wireless_charging",
  "premium_audio",
  "surround_camera",
  "air_suspension",
] as const;

/** Extras a dealer can include in an offer. */
export const DEALER_OFFER_EXTRAS = [
  "free_floor_mats",
  "tinted_windows",
  "extended_warranty",
  "free_first_service",
  "free_registration",
  "ceramic_coating",
  "paint_protection",
  "dash_camera",
  "roof_rack",
  "cargo_liner",
] as const;
