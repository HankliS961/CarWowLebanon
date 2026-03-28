import { whatsappLink } from "@/lib/utils";

/**
 * WhatsApp notification via deep links.
 * In production, this would use WhatsApp Business API.
 * For now, generate deep link URLs that can be opened by the system.
 */

export function generateWhatsAppNotification(
  phone: string,
  message: string
): string {
  return whatsappLink(phone, message);
}

export function whatsappNewBid({
  sellerPhone,
  bidAmount,
  dealerName,
  carTitle,
}: {
  sellerPhone: string;
  bidAmount: number;
  dealerName: string;
  carTitle: string;
}): string {
  const message = `[CarSouk] New bid on your ${carTitle}! ${dealerName} offered $${bidAmount.toLocaleString()}. Check your dashboard to view all bids.`;
  return generateWhatsAppNotification(sellerPhone, message);
}

export function whatsappBidAccepted({
  dealerPhone,
  carTitle,
  bidAmount,
}: {
  dealerPhone: string;
  carTitle: string;
  bidAmount: number;
}): string {
  const message = `[CarSouk] Congratulations! Your bid of $${bidAmount.toLocaleString()} for ${carTitle} has been accepted. Please coordinate pickup with the seller.`;
  return generateWhatsAppNotification(dealerPhone, message);
}

export function whatsappNewInquiry({
  dealerPhone,
  buyerName,
  carTitle,
}: {
  dealerPhone: string;
  buyerName: string;
  carTitle: string;
}): string {
  const message = `[CarSouk] New inquiry from ${buyerName} about your ${carTitle}. Log in to respond.`;
  return generateWhatsAppNotification(dealerPhone, message);
}

export function whatsappNewOffer({
  buyerPhone,
  dealerName,
  price,
}: {
  buyerPhone: string;
  dealerName: string;
  price: number;
}): string {
  const message = `[CarSouk] ${dealerName} has sent you an offer of $${price.toLocaleString()} for your requested car. Check your dashboard!`;
  return generateWhatsAppNotification(buyerPhone, message);
}
