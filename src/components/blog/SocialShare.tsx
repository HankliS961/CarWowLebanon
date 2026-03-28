"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Link2, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
}

export function SocialShare({ url, title, className }: SocialShareProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">
        {locale === "ar" ? "مشاركة:" : "Share:"}
      </span>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copied
          ? locale === "ar"
            ? "تم النسخ"
            : "Copied"
          : locale === "ar"
            ? "نسخ الرابط"
            : "Copy Link"}
      </Button>

      {/* WhatsApp */}
      <Button variant="outline" size="sm" asChild>
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </Button>

      {/* Twitter/X */}
      <Button variant="outline" size="sm" asChild>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Twitter"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </Button>

      {/* Facebook */}
      <Button variant="outline" size="sm" asChild>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      </Button>
    </div>
  );
}

export default SocialShare;
