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
      return "/dashboard/selling";
    case "REVIEW_RECEIVED":
      return isDealer ? "/dealer/reviews" : "/dashboard";
    case "LISTING_MATCH":
      return "/cars";
    default:
      return "/dashboard";
  }
}
