/** Supported locales for CarSouk. Arabic is the default. */
export const locales = ["ar", "en"] as const;

/** The default locale for the application. */
export const defaultLocale = "ar" as const;

/** Type for supported locale values. */
export type Locale = (typeof locales)[number];

/** Locale labels for the language switcher UI. */
export const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
};

/** Map locale to text direction. */
export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
