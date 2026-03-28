"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import type { TocItem } from "@/lib/content/toc";

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const locale = useLocale();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={locale === "ar" ? "جدول المحتويات" : "Table of Contents"}
      className={cn("rounded-lg border bg-card p-4", className)}
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        {locale === "ar" ? "جدول المحتويات" : "Table of Contents"}
      </h3>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(item.id);
                }
              }}
              className={cn(
                "block rounded px-2 py-1 text-sm transition-colors",
                item.level === 3 && "ps-4",
                activeId === item.id
                  ? "bg-teal-50 font-medium text-teal-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
