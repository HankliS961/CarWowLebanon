"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "sonner";

/**
 * Client-side providers that wrap the entire application.
 * Includes: Auth session, tRPC/React Query, Theme (dark mode), Toast notifications.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
