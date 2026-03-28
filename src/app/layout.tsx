import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "CarSouk - Lebanon's Car Marketplace",
    template: "%s | CarSouk",
  },
  description:
    "Lebanon's first reverse car marketplace. Dealers compete to give you the best price on new and used cars.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

/**
 * Root layout — minimal wrapper that delegates to locale-specific layout.
 * This layout does not add html/body tags because the locale layout handles them.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
