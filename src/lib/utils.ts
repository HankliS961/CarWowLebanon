import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes with proper conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in USD with proper locale formatting.
 * @param price - The price to format
 * @param locale - The locale for formatting (defaults to en-US)
 */
export function formatPriceUsd(price: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format a price in LBP with proper locale formatting.
 * @param price - The price to format
 * @param locale - The locale for formatting
 */
export function formatPriceLbp(price: number, locale = "ar-LB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "LBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format mileage with proper locale formatting.
 * @param km - The mileage in kilometers
 * @param locale - The locale for formatting
 */
export function formatMileage(km: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(km) + " km";
}

/**
 * Generate a URL-friendly slug from a string.
 * @param text - The text to slugify
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a maximum length with an ellipsis.
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Generate a WhatsApp deep link URL.
 * @param phone - The phone number (with country code, no + prefix)
 * @param message - Optional pre-filled message
 */
export function whatsappLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const base = `https://wa.me/${cleanPhone}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/** Get the absolute URL for a given path. */
export function absoluteUrl(path: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}
