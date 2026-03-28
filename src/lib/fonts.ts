import { IBM_Plex_Sans_Arabic, Noto_Sans, Noto_Sans_Arabic, DM_Sans } from "next/font/google";

/**
 * IBM Plex Sans Arabic — used for headings and display text.
 * Supports Arabic script with excellent readability.
 */
export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-arabic",
});

/**
 * Noto Sans — Latin body/UI text.
 */
export const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

/**
 * Noto Sans Arabic — Arabic body/UI text.
 */
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
});

/**
 * DM Sans — used for prices, numbers, and English headings.
 */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

/**
 * Combined font class names for the <body> tag.
 */
export const fontVariables = [
  ibmPlexSansArabic.variable,
  notoSans.variable,
  notoSansArabic.variable,
  dmSans.variable,
].join(" ");
