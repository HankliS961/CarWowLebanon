/**
 * Email notification sender.
 * Uses Resend SDK when configured, otherwise logs to console.
 * Templates for each notification type with CarSouk branding.
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email notification. Falls back to console.log in development
 * or when Resend is not configured.
 */
async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log("[Email] Resend not configured. Would send:", {
      to: payload.to,
      subject: payload.subject,
    });
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "CarSouk <notifications@carsouk.com>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Email] Resend error:", err);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return { success: false };
  }
}

function brandedTemplate(content: string, ctaUrl?: string, ctaText?: string): string {
  const cta = ctaUrl && ctaText
    ? `<div style="text-align:center;margin:24px 0"><a href="${ctaUrl}" style="background-color:#0A7E8C;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${ctaText}</a></div>`
    : "";

  return `<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa"><div style="max-width:600px;margin:0 auto;padding:20px"><div style="text-align:center;padding:24px 0"><span style="font-size:24px;font-weight:700;color:#0A7E8C">CarSouk</span></div><div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">${content}${cta}</div><div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px"><p>CarSouk - Lebanon's Car Marketplace</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com"}" style="color:#0A7E8C">Visit CarSouk</a></p></div></div></body></html>`;
}

export async function sendNewBidEmail(
  sellerEmail: string,
  carTitle: string,
  bidAmount: number,
  dealerName: string,
  sellListingId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: sellerEmail,
    subject: `New bid on your ${carTitle} - $${bidAmount.toLocaleString()}`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">New Bid Received!</h2><p style="color:#4b5563;line-height:1.6"><strong>${dealerName}</strong> has placed a bid of <strong style="color:#0A7E8C">$${bidAmount.toLocaleString()}</strong> on your <strong>${carTitle}</strong>.</p><p style="color:#4b5563;line-height:1.6">Log in to your dashboard to review this bid and see all offers.</p>`,
      `${baseUrl}/en/dashboard/selling`,
      "View My Bids"
    ),
  });
}

export async function sendBidAcceptedEmail(
  dealerEmail: string,
  carTitle: string,
  bidAmount: number,
  sellListingId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: dealerEmail,
    subject: `Congratulations! Your bid for ${carTitle} was accepted`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">Bid Accepted!</h2><p style="color:#4b5563;line-height:1.6">Your bid of <strong style="color:#10B981">$${bidAmount.toLocaleString()}</strong> for <strong>${carTitle}</strong> has been accepted by the seller.</p><p style="color:#4b5563;line-height:1.6">Please coordinate pickup and payment with the seller.</p>`,
      `${baseUrl}/en/dealer/auctions`,
      "View Details"
    ),
  });
}

export async function sendInquiryEmail(
  dealerEmail: string,
  buyerName: string,
  carTitle: string,
  inquiryId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: dealerEmail,
    subject: `New inquiry on ${carTitle}`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">New Inquiry</h2><p style="color:#4b5563;line-height:1.6"><strong>${buyerName}</strong> is interested in your <strong>${carTitle}</strong>.</p><p style="color:#4b5563;line-height:1.6">Respond quickly to increase your chances of closing the deal.</p>`,
      `${baseUrl}/en/dealer/inquiries`,
      "View Inquiry"
    ),
  });
}

export async function sendPriceDropEmail(
  userEmail: string,
  carTitle: string,
  oldPrice: number,
  newPrice: number,
  carId: string
) {
  const savings = oldPrice - newPrice;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: userEmail,
    subject: `Price drop! ${carTitle} is now $${newPrice.toLocaleString()}`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">Price Drop Alert</h2><p style="color:#4b5563;line-height:1.6">A car you saved has dropped in price!</p><div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;font-size:18px"><strong>${carTitle}</strong></p><p style="margin:8px 0 0;color:#6b7280"><s>$${oldPrice.toLocaleString()}</s> <span style="color:#10B981;font-weight:700;font-size:20px">$${newPrice.toLocaleString()}</span></p><p style="margin:4px 0 0;color:#10B981;font-weight:600">Save $${savings.toLocaleString()}</p></div>`,
      `${baseUrl}/en/cars/${carId}`,
      "View Car"
    ),
  });
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: userEmail,
    subject: "Welcome to CarSouk!",
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">Welcome, ${userName}!</h2><p style="color:#4b5563;line-height:1.6">Thank you for joining CarSouk, Lebanon's car marketplace where dealers compete to give you the best price.</p><ul style="color:#4b5563;line-height:2"><li><strong>Buy:</strong> Search cars or let dealers compete with offers</li><li><strong>Sell:</strong> List your car and receive bids from verified dealers</li><li><strong>Save:</strong> Bookmark cars and set up price alerts</li></ul>`,
      `${baseUrl}/en`,
      "Start Exploring"
    ),
  });
}

export async function sendNewOfferEmail(
  buyerEmail: string,
  dealerName: string,
  priceOffered: number,
  configurationId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: buyerEmail,
    subject: `New offer: ${dealerName} - $${priceOffered.toLocaleString()}`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">New Dealer Offer</h2><p style="color:#4b5563;line-height:1.6"><strong>${dealerName}</strong> has submitted an offer of <strong style="color:#0A7E8C">$${priceOffered.toLocaleString()}</strong> for your requested car.</p><p style="color:#4b5563;line-height:1.6">View and compare all offers on your dashboard.</p>`,
      `${baseUrl}/en/get-offers/dashboard`,
      "View Offers"
    ),
  });
}

export async function sendAlertMatchEmail(
  userEmail: string,
  carTitle: string,
  carId: string,
  price: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carsouk.com";
  return sendEmail({
    to: userEmail,
    subject: `New listing: ${carTitle} - $${price.toLocaleString()}`,
    html: brandedTemplate(
      `<h2 style="color:#1a1a2e;margin:0 0 16px">New Listing Alert</h2><p style="color:#4b5563;line-height:1.6">A car matching your saved search has been listed:</p><div style="background:#f0f9ff;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;font-size:18px;font-weight:600">${carTitle}</p><p style="margin:8px 0 0;color:#0A7E8C;font-weight:700;font-size:20px">$${price.toLocaleString()}</p></div>`,
      `${baseUrl}/en/cars/${carId}`,
      "View Car"
    ),
  });
}
