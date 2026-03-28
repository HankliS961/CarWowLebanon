"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAppStore } from "@/store/app-store";
import {
  Home,
  Search,
  DollarSign,
  Heart,
  User,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

export interface MobileNavProps {
  /** Additional CSS classes. */
  className?: string;
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/cars", labelKey: "search", icon: Search },
  { href: "/sell-my-car", labelKey: "sellYourCar", icon: DollarSign, highlight: true },
  { href: "/dashboard/saved", labelKey: "savedCars", icon: Heart },
  { href: "/dashboard", labelKey: "account", icon: User },
];

export function MobileNav({ className }: MobileNavProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const savedCount = useAppStore((s) => s.savedCarIds.length);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 lg:hidden",
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const label = t(item.labelKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                item.highlight
                  ? "text-amber-600"
                  : isActive
                    ? "text-teal-500"
                    : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Highlight ring for sell CTA */}
              {item.highlight && (
                <span className="absolute -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 shadow-md">
                  <Icon size={20} className="text-white" />
                </span>
              )}

              {!item.highlight && (
                <span className="relative">
                  <Icon size={20} />
                  {/* Badge for saved count */}
                  {item.labelKey === "savedCars" && savedCount > 0 && (
                    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
                      {savedCount > 99 ? "99+" : savedCount}
                    </span>
                  )}
                </span>
              )}

              <span className={cn(item.highlight && "mt-5")}>
                {label}
              </span>

              {/* Active indicator */}
              {isActive && !item.highlight && (
                <span
                  className="absolute -bottom-1.5 h-0.5 w-4 rounded-full bg-teal-500"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area spacer for devices with bottom notches */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export default MobileNav;
