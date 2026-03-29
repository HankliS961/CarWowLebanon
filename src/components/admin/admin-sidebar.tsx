"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  FileText,
  Star,
  ImageIcon,
  Settings,
  BarChart3,
  ScrollText,
  X,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  locale: string;
  open: boolean;
  onClose: () => void;
}

interface AdminNavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: AdminNavItem[] = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "dealers", href: "/admin/dealers", icon: Building2 },
  { key: "listings", href: "/admin/listings", icon: Car },
  { key: "content", href: "/admin/content", icon: FileText },
  { key: "featured", href: "/admin/featured", icon: Star },
  { key: "siteImages", href: "/admin/site-images", icon: ImageIcon },
  { key: "settings", href: "/admin/settings", icon: Settings },
  { key: "analytics", href: "/admin/analytics", icon: BarChart3 },
  { key: "logs", href: "/admin/logs", icon: ScrollText },
];

export function AdminSidebar({ locale, open, onClose }: AdminSidebarProps) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const fullPath = `/${locale}${href}`;
    if (exact) return pathname === fullPath;
    return pathname.startsWith(fullPath);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-e bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-2 text-lg font-bold text-primary"
          >
            <Shield className="h-6 w-6" />
            <span>Admin Panel</span>
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

        <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation" aria-label="Admin navigation">
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
