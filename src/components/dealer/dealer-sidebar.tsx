"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  MessageSquare,
  ShoppingBag,
  Gavel,
  Star,
  BarChart3,
  Settings,
  CreditCard,
  Users,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DealerSidebarProps {
  locale: string;
  open: boolean;
  onClose: () => void;
}

interface DealerNavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: DealerNavItem[] = [
  { key: "dashboard", href: "/dealer", icon: LayoutDashboard, exact: true },
  { key: "listings", href: "/dealer/listings", icon: Car },
  { key: "inquiries", href: "/dealer/inquiries", icon: MessageSquare },
  { key: "requests", href: "/dealer/requests", icon: ShoppingBag },
  { key: "auctions", href: "/dealer/auctions", icon: Gavel },
  { key: "reviews", href: "/dealer/reviews", icon: Star },
  { key: "analytics", href: "/dealer/analytics", icon: BarChart3 },
  { key: "settings", href: "/dealer/settings", icon: Settings },
  { key: "subscription", href: "/dealer/subscription", icon: CreditCard },
  { key: "team", href: "/dealer/team", icon: Users },
];

export function DealerSidebar({ locale, open, onClose }: DealerSidebarProps) {
  const t = useTranslations("dealer.nav");
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const fullPath = `/${locale}${href}`;
    if (exact) return pathname === fullPath;
    return pathname.startsWith(fullPath);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-e bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          open
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href={`/${locale}/dealer`}
            className="flex items-center gap-2 text-lg font-bold text-primary"
          >
            <Car className="h-6 w-6" />
            <span>CarSouk</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation" aria-label="Dealer navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{t(item.key)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to main site */}
        <div className="border-t p-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            <span>Back to CarSouk</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
