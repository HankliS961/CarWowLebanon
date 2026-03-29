export {
  createNotification,
  notifyNewBid,
  notifyBidAccepted,
  notifyNewOffer,
  notifyNewInquiry,
  notifyPriceDrop,
  notifyListingMatch,
  notifyReviewReceived,
} from "./create";

export {
  sendNewBidEmail,
  sendBidAcceptedEmail,
  sendInquiryEmail,
  sendPriceDropEmail,
  sendWelcomeEmail,
  sendNewOfferEmail,
  sendAlertMatchEmail,
} from "./email";

export {
  generateWhatsAppNotification,
  generateWhatsAppDeepLink,
  whatsappNewBid,
  whatsappBidAccepted,
  whatsappNewInquiry,
  whatsappNewOffer,
} from "./whatsapp";

export type { WhatsAppResult } from "./whatsapp";

export { getNotificationHref } from "./href";
