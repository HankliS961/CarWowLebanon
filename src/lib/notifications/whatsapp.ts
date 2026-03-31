import twilio from "twilio";
import { whatsappLink } from "@/lib/utils";

/**
 * WhatsApp notifications via Twilio WhatsApp API.
 * Falls back to deep-link generation when Twilio credentials are not configured.
 */

/** Result returned by every WhatsApp notification function. */
export interface WhatsAppResult {
  /** Whether the message was actually sent via Twilio WhatsApp API. */
  sent: boolean;
  /** WhatsApp deep link URL (always available as a fallback). */
  deepLink: string;
}

/** Lazily create a Twilio client; returns null when credentials are missing. */
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

/**
 * Send a WhatsApp message via Twilio. Returns true on success, false otherwise.
 * When credentials are missing or the send fails, the caller can still use the
 * deep-link URL as a fallback.
 */
async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<boolean> {
  // [DEV BYPASS] Skip all WhatsApp sending — log to console instead
  // REVERT: Remove this block
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV BYPASS] WhatsApp skipped → to: ${to}, body: ${body.slice(0, 80)}...`);
    return true;
  }

  const client = getTwilioClient();
  if (!client) {
    console.log("[WhatsApp] No Twilio credentials, skipping API send.");
    return false;
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.warn("[WhatsApp] TWILIO_PHONE_NUMBER not set, skipping API send.");
    return false;
  }

  try {
    await client.messages.create({
      body,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
    });
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}

/**
 * Generate a WhatsApp deep link (always works, no credentials needed).
 */
export function generateWhatsAppDeepLink(
  phone: string,
  message: string
): string {
  return whatsappLink(phone, message);
}

// Keep the old export name as an alias for backwards compatibility
export const generateWhatsAppNotification = generateWhatsAppDeepLink;

export async function whatsappNewBid({
  sellerPhone,
  bidAmount,
  dealerName,
  carTitle,
}: {
  sellerPhone: string;
  bidAmount: number;
  dealerName: string;
  carTitle: string;
}): Promise<WhatsAppResult> {
  const message = `[CarSouk] New bid on your ${carTitle}! ${dealerName} offered $${bidAmount.toLocaleString()}. Check your dashboard to view all bids.`;
  const deepLink = generateWhatsAppDeepLink(sellerPhone, message);
  const sent = await sendWhatsAppMessage(sellerPhone, message);
  return { sent, deepLink };
}

export async function whatsappBidAccepted({
  dealerPhone,
  carTitle,
  bidAmount,
}: {
  dealerPhone: string;
  carTitle: string;
  bidAmount: number;
}): Promise<WhatsAppResult> {
  const message = `[CarSouk] Congratulations! Your bid of $${bidAmount.toLocaleString()} for ${carTitle} has been accepted. Please coordinate pickup with the seller.`;
  const deepLink = generateWhatsAppDeepLink(dealerPhone, message);
  const sent = await sendWhatsAppMessage(dealerPhone, message);
  return { sent, deepLink };
}

export async function whatsappNewInquiry({
  dealerPhone,
  buyerName,
  carTitle,
}: {
  dealerPhone: string;
  buyerName: string;
  carTitle: string;
}): Promise<WhatsAppResult> {
  const message = `[CarSouk] New inquiry from ${buyerName} about your ${carTitle}. Log in to respond.`;
  const deepLink = generateWhatsAppDeepLink(dealerPhone, message);
  const sent = await sendWhatsAppMessage(dealerPhone, message);
  return { sent, deepLink };
}

export async function whatsappCarRequestApproved({
  buyerPhone,
  carDesc,
}: {
  buyerPhone: string;
  carDesc: string;
}): Promise<WhatsAppResult> {
  const message = `[CarSouk] Your car request for a ${carDesc} has been approved! Dealers are now reviewing it and will contact you if they have a match.`;
  const deepLink = generateWhatsAppDeepLink(buyerPhone, message);
  const sent = await sendWhatsAppMessage(buyerPhone, message);
  return { sent, deepLink };
}

export async function whatsappNewOffer({
  buyerPhone,
  dealerName,
  price,
}: {
  buyerPhone: string;
  dealerName: string;
  price: number;
}): Promise<WhatsAppResult> {
  const message = `[CarSouk] ${dealerName} has sent you an offer of $${price.toLocaleString()} for your requested car. Check your dashboard!`;
  const deepLink = generateWhatsAppDeepLink(buyerPhone, message);
  const sent = await sendWhatsAppMessage(buyerPhone, message);
  return { sent, deepLink };
}
