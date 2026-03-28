import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, localeDirection, type Locale } from "@/i18n/config";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "CarSouk - Lebanon's Car Marketplace",
    template: "%s | CarSouk",
  },
  description:
    "Lebanon's first reverse car marketplace. Dealers compete to give you the best price on new and used cars.",
  openGraph: {
    type: "website",
    siteName: "CarSouk",
    locale: "ar_LB",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * Locale-specific layout.
 * Sets the correct direction (RTL for Arabic) and loads i18n messages.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate the locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const direction = localeDirection[typedLocale];
  const messages = await getMessages();

  return (
    <html lang={typedLocale} dir={direction} suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${fontVariables}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
              <Footer />
              <MobileNav />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
