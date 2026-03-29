"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User, ArrowRight } from "lucide-react";
import { BLOG_CATEGORIES } from "@/types/content";
import type { Locale } from "@/i18n/config";

export interface BlogPostCardProps {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string | null;
  excerptAr: string | null;
  category: string;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  author: {
    name: string | null;
    avatarUrl: string | null;
  };
  className?: string;
}

export function BlogPostCard({
  slug,
  titleEn,
  titleAr,
  excerptEn,
  excerptAr,
  category,
  featuredImageUrl,
  publishedAt,
  author,
  className,
}: BlogPostCardProps) {
  const locale = useLocale() as Locale;

  const title = locale === "ar" ? titleAr : titleEn;
  const excerpt = locale === "ar" ? excerptAr : excerptEn;
  const categoryMeta = BLOG_CATEGORIES.find((c) => c.dbValue === category);
  const categoryLabel = categoryMeta
    ? locale === "ar"
      ? categoryMeta.labelAr
      : categoryMeta.labelEn
    : category;
  const categorySlug = categoryMeta?.slug || category.toLowerCase();

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString(locale === "ar" ? "ar-LB" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={featuredImageUrl || "/images/blog-placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <Badge
          className="absolute start-3 top-3 bg-teal-500 text-white"
        >
          {categoryLabel}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-teal-500 transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        {/* Author & Date */}
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name || ""}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>{author.name || (locale === "ar" ? "فريق كارسوق" : "CarSouk Team")}</span>
          </div>
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Read More */}
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-teal-500">
          <span>{locale === "ar" ? "اقرأ المزيد" : "Read More"}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </div>
      </div>
    </Link>
  );
}

export default BlogPostCard;
