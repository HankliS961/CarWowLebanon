"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/i18n/config";

export interface MegaMenuSection {
  /** Section title in English. */
  title: string;
  /** Section title in Arabic. */
  titleAr: string;
  /** Links in this section. */
  links: Array<{
    label: string;
    labelAr: string;
    href: string;
    /** Optional image URL (for brand logos etc). */
    imageUrl?: string;
  }>;
  /** "See All" link. */
  seeAllHref?: string;
}

export interface MegaMenuItemConfig {
  /** Trigger label in English. */
  label: string;
  /** Trigger label in Arabic. */
  labelAr: string;
  /** Sections within the mega menu dropdown. */
  sections: MegaMenuSection[];
  /** Variant affects the mega menu width/style. */
  variant?: "full" | "compact";
}

export interface MegaMenuProps {
  /** Array of mega menu items. */
  items: MegaMenuItemConfig[];
  /** Additional CSS classes. */
  className?: string;
}

function MegaMenuItem({ item }: { item: MegaMenuItemConfig }) {
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerLabel = locale === "ar" ? item.labelAr : item.label;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          open && "bg-muted text-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        {triggerLabel}
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute start-0 top-full z-50 mt-1 animate-mega-menu-open rounded-xl border border-border bg-card shadow-lg",
            item.variant === "compact" ? "w-64" : "w-[600px] lg:w-[800px]"
          )}
          role="menu"
        >
          <div
            className={cn(
              "grid gap-6 p-5",
              item.variant === "compact"
                ? "grid-cols-1"
                : "grid-cols-2 lg:grid-cols-3"
            )}
          >
            {item.sections.map((section, sIdx) => {
              const sectionTitle =
                locale === "ar" ? section.titleAr : section.title;

              return (
                <div key={sIdx}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {sectionTitle}
                  </h3>
                  <ul className="flex flex-col gap-1" role="group">
                    {section.links.map((link, lIdx) => {
                      const linkLabel =
                        locale === "ar" ? link.labelAr : link.label;

                      return (
                        <li key={lIdx} role="menuitem">
                          <Link
                            href={link.href}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-teal-500"
                            onClick={() => setOpen(false)}
                          >
                            {link.imageUrl && (
                              <img
                                src={link.imageUrl}
                                alt=""
                                className="h-5 w-5 shrink-0 rounded object-contain"
                              />
                            )}
                            {linkLabel}
                          </Link>
                        </li>
                      );
                    })}
                    {section.seeAllHref && (
                      <li role="menuitem">
                        <Link
                          href={section.seeAllHref}
                          className="mt-1 block px-2 py-1 text-xs font-medium text-teal-500 transition-colors hover:text-teal-700"
                          onClick={() => setOpen(false)}
                        >
                          {locale === "ar" ? "عرض الكل" : "See All"} &rarr;
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function MegaMenu({ items, className }: MegaMenuProps) {
  return (
    <nav
      className={cn("hidden items-center gap-1 lg:flex", className)}
      aria-label="Main navigation"
    >
      {items.map((item, index) => (
        <MegaMenuItem key={index} item={item} />
      ))}
    </nav>
  );
}

export default MegaMenu;
