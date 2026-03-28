import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "./config";

/**
 * next-intl request configuration.
 * Loads the correct message bundle based on the current locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is supported
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../i18n/messages/${locale}.json`)).default,
  };
});
