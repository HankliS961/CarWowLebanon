"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Car } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function Footer() {
  const locale = useLocale() as Locale;
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  const currentYear = new Date().getFullYear();
  const appName = locale === "ar" ? "كارسوق" : "CarSouk";

  const sections = [
    {
      title: t("marketplace"),
      links: [
        { href: "/cars/new", label: tn("newCars") },
        { href: "/cars/used", label: tn("usedCars") },
        { href: "/cars/import", label: tn("import") },
        { href: "/get-offers", label: tn("getOffers") },
        { href: "/sell-my-car", label: tn("sellYourCar") },
        { href: "/dealers", label: tn("dealers") },
      ],
    },
    {
      title: locale === "ar" ? "الأدوات" : "Tools & Reviews",
      links: [
        { href: "/reviews", label: tn("reviews") },
        { href: "/tools/import-calculator", label: locale === "ar" ? "حاسبة الاستيراد" : "Import Calculator" },
        { href: "/tools/loan-calculator", label: locale === "ar" ? "حاسبة القروض" : "Loan Calculator" },
        { href: "/tools/compare", label: locale === "ar" ? "مقارنة السيارات" : "Compare Cars" },
        { href: "/blog", label: tn("blog") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("aboutUs") },
        { href: "/about/how-it-works", label: t("howItWorks") },
        { href: "/about/careers", label: t("careers") },
        { href: "/about/contact", label: t("contact") },
        { href: "/dealers/join", label: locale === "ar" ? "انضم كوكيل" : "Join as Dealer" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/legal/terms", label: t("terms") },
        { href: "/legal/privacy", label: t("privacy") },
        { href: "/legal/cookie-policy", label: t("cookies") },
      ],
    },
  ];

  return (
    <footer className="border-t bg-charcoal text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {/* Top section: logo + description + nav columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-teal-300">
              <Car className="h-6 w-6" />
              <span className="font-heading">{appName}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
          </div>

          {/* Navigation columns */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-white">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/50">
              &copy; {currentYear} {appName}. {t("copyright")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
