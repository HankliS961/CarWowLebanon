"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Check, MessageSquare, DollarSign, Tag, Star, Search, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { Link, useRouter } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import { getNotificationHref } from "@/lib/notifications/href";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  NEW_BID: DollarSign,
  NEW_OFFER: Tag,
  NEW_INQUIRY: MessageSquare,
  PRICE_DROP: TrendingDown,
  LISTING_MATCH: Search,
  REVIEW_RECEIVED: Star,
};

function timeAgo(date: Date, locale: string): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return locale === "ar" ? "الآن" : "Just now";
  if (diffMin < 60) return locale === "ar" ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  if (diffHrs < 24) return locale === "ar" ? `منذ ${diffHrs} ساعة` : `${diffHrs}h ago`;
  return locale === "ar" ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
}

export function NotificationBell() {
  const locale = useLocale() as Locale;
  const t = useTranslations("notifications");
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
    retry: false,
  });

  const { data: notifications } = trpc.notifications.list.useQuery(
    { limit: 10, offset: 0 },
    { enabled: isOpen }
  );

  const utils = trpc.useUtils();

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const router = useRouter();

  const userRole = (session?.user as any)?.role as string | undefined;

  const handleNotificationClick = (
    id: string,
    isRead: boolean,
    type: string,
    data?: Record<string, unknown> | null,
  ) => {
    if (!isRead) {
      markReadMutation.mutate({ id });
    }
    setIsOpen(false);
    router.push(getNotificationHref(type, data, userRole));
  };

  const count = unreadCount ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${t("title")} ${count > 0 ? `(${count})` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-card shadow-xl sm:w-96"
          role="dialog"
          aria-label={t("title")}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t("title")}</h3>
            {count > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-teal-600 hover:text-teal-700"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {!notifications?.items?.length ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{t("emptySubtitle")}</p>
              </div>
            ) : (
              notifications.items.map((notif) => {
                const Icon = NOTIFICATION_ICONS[notif.type] ?? Bell;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50",
                      !notif.isRead && "bg-teal-50/50"
                    )}
                    onClick={() =>
                      handleNotificationClick(
                        notif.id,
                        notif.isRead,
                        notif.type,
                        notif.data as Record<string, unknown> | null,
                      )
                    }
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        !notif.isRead ? "bg-teal-100 text-teal-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "line-clamp-1 text-sm",
                          !notif.isRead ? "font-semibold" : "font-medium text-muted-foreground"
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notif.body}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                        {timeAgo(notif.createdAt, locale)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications?.items && notifications.items.length > 0 && (
            <div className="border-t px-4 py-2.5 text-center">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-teal-600 hover:text-teal-700"
                onClick={() => setIsOpen(false)}
              >
                {t("viewAll")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
