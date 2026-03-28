"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export interface WhatsAppButtonProps
  extends React.ButtonHTMLAttributes<HTMLAnchorElement> {
  /** Phone number with country code (e.g. "96170123456"). */
  phoneNumber: string;
  /** Pre-filled message text. */
  message?: string;
  /** Display variant. */
  variant?: "icon-only" | "full";
  /** Size variant. */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<WhatsAppButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const iconSizeClasses: Record<
  NonNullable<WhatsAppButtonProps["size"]>,
  string
> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconDimensions: Record<NonNullable<WhatsAppButtonProps["size"]>, number> =
  {
    sm: 14,
    md: 18,
    lg: 22,
  };

export function WhatsAppButton({
  phoneNumber,
  message,
  variant = "full",
  size = "md",
  className,
  ...props
}: WhatsAppButtonProps) {
  const href = whatsappLink(phoneNumber, message);
  const iconSize = iconDimensions[size];

  if (variant === "icon-only") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#1EBE57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
          iconSizeClasses[size],
          className
        )}
        aria-label="WhatsApp"
        {...props}
      >
        <MessageCircle size={iconSize} />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-[#25D366] font-medium text-white transition-colors hover:bg-[#1EBE57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        sizeClasses[size],
        className
      )}
      aria-label="WhatsApp"
      {...props}
    >
      <MessageCircle size={iconSize} />
      <span>WhatsApp</span>
    </a>
  );
}

export default WhatsAppButton;
