"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon, InboxIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon } from "@/app/components/icons/Icons";
import type { Notification, NotificationType } from "@/lib/types/notification";

type NotificationBellProps = {
  unreadCount: number;
  lang: string;
  copy: {
    title: string;
    empty: string;
    markAllRead: string;
    justNow: string;
    ago: string;
    viewAll: string;
  };
};

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "new_request":
      return <InboxIcon className="size-4 text-[#22d3ee]" />;
    case "quote_sent":
      return <FileTextIcon className="size-4 text-[#a78bfa]" />;
    case "quote_accepted":
      return <CheckCircleIcon className="size-4 text-[#34d399]" />;
    case "quote_rejected":
      return <AlertCircleIcon className="size-4 text-[#f87171]" />;
    case "followup_created":
      return <BellIcon className="size-4 text-[#fbbf24]" />;
  }
}

function relativeTime(dateStr: string, agoLabel: string, justNowLabel: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return justNowLabel;
  if (diffMins < 60) return `${diffMins}m ${agoLabel}`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ${agoLabel}`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ${agoLabel}`;
}

async function markAllRead(lang: string): Promise<void> {
  const { getSupabaseBrowser } = await import("@/lib/supabase/client");
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .is("read_at", null);
}

async function markOneRead(notificationId: string): Promise<void> {
  const { getSupabaseBrowser } = await import("@/lib/supabase/client");
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("profile_id", user.id)
    .is("read_at", null);
}

async function loadNotifications(lang: string): Promise<Notification[]> {
  const res = await fetch(`/api/notifications?limit=20&offset=0`);
  if (!res.ok) {
    console.error("[NotificationBell] load failed", res.status);
    return [];
  }
  const data = await res.json();
  return data.notifications ?? [];
}

export function NotificationBell({ unreadCount, lang, copy }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      setIsLoading(true);
      loadNotifications(lang).then((data) => {
        setNotifications(data);
        setHasLoaded(true);
        setIsLoading(false);
      });
    }
  }, [isOpen, hasLoaded, lang]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleMarkAllRead() {
    markAllRead(lang).then(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    });
  }

  function handleNotificationClick(notification: Notification) {
    markOneRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    window.location.href = `/${lang}/app/requests`;
    setIsOpen(false);
  }

  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#f87171] text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl glass-strong shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">{copy.title}</h3>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-accent-2 hover:text-accent-2/80"
              >
                {copy.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-white/40">
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-white/40">
                <InboxIcon className="size-8" />
                <span className="text-sm">{copy.empty}</span>
              </div>
            )}

            {!isLoading && notifications.length > 0 && (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="mt-0.5 shrink-0">{notificationIcon(notification.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-white/50 truncate">{notification.message}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-white/40">
                      {relativeTime(notification.created_at, copy.ago, copy.justNow)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 px-4 py-3">
            <a
              href={`/${lang}/app/requests`}
              className="flex items-center justify-center text-xs text-accent-2 hover:text-accent-2/80 transition-colors"
            >
              {copy.viewAll}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
