"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { NotificationBell } from "@/components/shared/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ChevronDown,
  Car,
  CarFront,
  DollarSign,
  Import,
  Star,
  BookOpen,
  Wrench,
  Building2,
  LayoutDashboard,
  Settings,
  LogOut,
  ShieldCheck,
  Store,
  GitCompareArrows,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

/** Small badge in the header showing compare list count. */
function CompareHeaderBadge() {
  const { data: count } = trpc.compare.count.useQuery(undefined, {
    retry: false,
  });

  if (!count || count === 0) return null;

  return (
    <Link
      href="/tools/compare"
      className="relative hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
      aria-label={`Compare (${count})`}
    >
      <GitCompareArrows className="h-5 w-5" />
      <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
        {count}
      </span>
    </Link>
  );
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/cars/new", labelKey: "newCars", icon: CarFront },
  { href: "/cars/used", labelKey: "usedCars", icon: Car },
  { href: "/sell-my-car", labelKey: "sellYourCar", icon: DollarSign, highlight: true },
  { href: "/cars/import", labelKey: "import", icon: Import },
  { href: "/reviews", labelKey: "reviews", icon: Star },
  { href: "/blog", labelKey: "blog", icon: BookOpen },
  { href: "/tools", labelKey: "tools", icon: Wrench },
  { href: "/dealers", labelKey: "dealers", icon: Building2 },
];

export function Header() {
  const locale = useLocale() as Locale;
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const userName = session?.user?.name || (locale === "ar" ? "حسابي" : "My Account");
  const userInitials = userName.slice(0, 2).toUpperCase();
  const userRole = (session?.user as any)?.role as string | undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top banner */}
      <div className="bg-teal-500 px-4 py-1.5 text-center text-xs font-medium text-white sm:text-sm">
        <Link href="/get-offers" className="hover:underline">
          {locale === "ar"
            ? "دع الوكلاء يتنافسون على أفضل سعر لك — احصل على عروض مجانية"
            : "Let dealers compete for you — Get free offers today"}
        </Link>
      </div>

      {/* Main nav bar */}
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-teal-500"
          >
            <Car className="h-7 w-7" />
            <span className="font-heading">
              {locale === "ar" ? "كارسوق" : "CarSouk"}
            </span>
          </Link>
        </div>

        {/* Center: Desktop nav links */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                item.highlight
                  ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                  : "text-muted-foreground"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          {isLoggedIn && <NotificationBell />}

          {isLoggedIn && (
            <Link
              href="/dashboard/saved"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              aria-label={t("savedCars")}
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}

          {isLoggedIn && <CompareHeaderBadge />}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback className="bg-teal-500 text-xs text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[100px] truncate md:inline">
                    {userName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                {(userRole === "DEALER" || userRole === "ADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/dealer" className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {locale === "ar" ? "بوابة التاجر" : "Dealer Portal"}
                    </Link>
                  </DropdownMenuItem>
                )}
                {userRole === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {locale === "ar" ? "الإعدادات" : "Settings"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              aria-label={t("login")}
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/get-offers">{t("getOffers")}</Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background lg:hidden">
          <nav className="container mx-auto max-w-7xl px-4 py-4" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      item.highlight
                        ? "bg-amber-50 text-amber-700"
                        : "text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <div className="my-2 border-t" />
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {locale === "ar" ? "الإعدادات" : "Settings"}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t("login")}
                </Link>
              )}
              <Button asChild className="mt-2 w-full">
                <Link href="/get-offers" onClick={() => setMobileMenuOpen(false)}>
                  {t("getOffers")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
