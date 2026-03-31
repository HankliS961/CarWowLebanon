/**
 * Maps a notification type (and optional JSON data) to the relevant app route.
 * Role-aware: dealers see dealer portal routes, buyers see buyer dashboard routes.
 * Used by NotificationBell and the dashboard recent-activity section.
 */
export function getNotificationHref(
  type: string,
  data?: Record<string, unknown> | null,
  role?: string,
): string {
  const isDealer = role === "DEALER" || role === "ADMIN";

  switch (type) {
    case "NEW_INQUIRY":
      return isDealer ? "/dealer/inquiries" : "/dashboard/inquiries";
    case "NEW_OFFER":
      return "/get-offers/dashboard";
    case "PRICE_DROP":
      return data?.carId ? `/cars/${data.carId}` : "/dashboard/saved";
    case "NEW_BID":
      return isDealer ? "/dealer/auctions" : "/dashboard/selling";
    case "NEW_AUCTION":
      return "/dealer/auctions";
    case "LISTING_WARNING":
      return isDealer ? "/dealer/listings" : "/dashboard";
    case "REVIEW_RECEIVED":
      return isDealer ? "/dealer/reviews" : "/dashboard";
    case "LISTING_MATCH":
      return "/cars";
    case "NEW_CAR_REQUEST":
      return role === "ADMIN" ? "/admin/car-requests" : isDealer ? "/dealer/requests" : "/dashboard/requests";
    case "CAR_REQUEST_MATCH":
      return data?.carId ? `/cars/${data.carId}` : "/dashboard/requests";
    default:
      return "/dashboard";
  }
}
