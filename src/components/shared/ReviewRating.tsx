"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export interface CategoryRating {
  label: string;
  /** Translation key for the label (falls back to label if translation missing). */
  labelKey?: string;
  score: number;
}

export interface ReviewRatingProps {
  /** Overall rating out of 10. */
  overall: number;
  /** Category breakdown ratings (each out of 10). */
  categories?: CategoryRating[];
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes. */
  className?: string;
}

const sizeConfig = {
  sm: {
    starSize: 14,
    scoreText: "text-lg font-bold",
    maxText: "text-xs",
    barHeight: "h-1.5",
    labelText: "text-xs",
    scoreLabel: "text-xs",
  },
  md: {
    starSize: 18,
    scoreText: "text-2xl font-bold",
    maxText: "text-sm",
    barHeight: "h-2",
    labelText: "text-sm",
    scoreLabel: "text-sm",
  },
  lg: {
    starSize: 22,
    scoreText: "text-4xl font-bold",
    maxText: "text-base",
    barHeight: "h-2.5",
    labelText: "text-base",
    scoreLabel: "text-base",
  },
};

function StarRating({
  score,
  maxScore = 10,
  starSize,
}: {
  score: number;
  maxScore?: number;
  starSize: number;
}) {
  // Convert 10-scale to 5 stars
  const starCount = 5;
  const filledStars = (score / maxScore) * starCount;

  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: starCount }, (_, i) => {
        const fill =
          i < Math.floor(filledStars)
            ? "full"
            : i < filledStars
              ? "partial"
              : "empty";

        return (
          <Star
            key={i}
            size={starSize}
            className={cn(
              fill === "full" && "fill-amber-400 text-amber-400",
              fill === "partial" && "fill-amber-400/50 text-amber-400",
              fill === "empty" && "fill-neutral-200 text-neutral-200"
            )}
          />
        );
      })}
    </div>
  );
}

export function ReviewRating({
  overall,
  categories,
  size = "md",
  className,
}: ReviewRatingProps) {
  const t = useTranslations("reviews.ratings");
  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Overall score display */}
      <div className="flex items-center gap-3">
        <StarRating score={overall} starSize={config.starSize} />
        <div className="flex items-baseline gap-1">
          <span className={cn(config.scoreText, "font-mono text-charcoal")}>
            {overall.toFixed(1)}
          </span>
          <span className={cn(config.maxText, "text-muted-foreground")}>
            /10
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      {categories && categories.length > 0 && (
        <div className="flex flex-col gap-2.5" role="list" aria-label="Rating breakdown">
          {categories.map((category) => {
            const percentage = (category.score / 10) * 100;
            let translatedLabel: string;
            try {
              translatedLabel = category.labelKey
                ? t(category.labelKey)
                : category.label;
            } catch {
              translatedLabel = category.label;
            }

            return (
              <div
                key={category.label}
                className="flex items-center gap-3"
                role="listitem"
              >
                <span
                  className={cn(
                    config.labelText,
                    "w-24 shrink-0 text-muted-foreground"
                  )}
                >
                  {translatedLabel}
                </span>
                <div
                  className={cn(
                    "flex-1 overflow-hidden rounded-full bg-neutral-100",
                    config.barHeight
                  )}
                  role="progressbar"
                  aria-valuenow={category.score}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-label={`${translatedLabel}: ${category.score} out of 10`}
                >
                  <div
                    className={cn(
                      "rounded-full bg-teal-500 transition-all duration-500",
                      config.barHeight
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span
                  className={cn(
                    config.scoreLabel,
                    "w-8 shrink-0 text-end font-mono font-medium text-charcoal"
                  )}
                >
                  {category.score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReviewRating;
