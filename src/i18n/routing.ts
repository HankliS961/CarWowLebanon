import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

/**
 * next-intl routing configuration.
 * Defines locale prefixing strategy and default locale.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

/**
 * Navigation utilities that are locale-aware.
 * Use these instead of next/link and next/navigation.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
