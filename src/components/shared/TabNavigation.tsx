"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

export interface TabItem {
  /** English label. */
  label: string;
  /** Arabic label. */
  labelAr: string;
  /** URL path for this tab. */
  href: string;
  /** Whether this tab is currently active. */
  isActive?: boolean;
}

export interface TabNavigationProps {
  /** Array of tab items. */
  tabs: TabItem[];
  /** Additional CSS classes. */
  className?: string;
}

export function TabNavigation({ tabs, className }: TabNavigationProps) {
  const locale = useLocale();
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeTab = activeTabRef.current;

      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      // Check if tab is out of view
      if (
        tabRect.left < containerRect.left ||
        tabRect.right > containerRect.right
      ) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [tabs]);

  return (
    <nav
      aria-label="Tab navigation"
      className={cn("border-b border-border", className)}
    >
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const displayLabel = locale === "ar" ? tab.labelAr : tab.label;

          return (
            <Link
              key={index}
              ref={tab.isActive ? activeTabRef : undefined}
              href={tab.href}
              role="tab"
              aria-selected={tab.isActive}
              aria-current={tab.isActive ? "page" : undefined}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                "hover:text-teal-500",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                tab.isActive
                  ? "text-teal-500"
                  : "text-muted-foreground"
              )}
            >
              {displayLabel}
              {tab.isActive && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-500"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default TabNavigation;
