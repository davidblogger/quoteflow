"use client";

import { useState, useEffect } from "react";
import { BellIcon, InboxIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon } from "@/app/components/icons/Icons";
import type { Notification, NotificationType } from "@/lib/types/notification";

type NotificationPageProps = {
  lang: string;
  copy: {
    title: string;
    empty: string;
    markAllRead: string;
    justNow: string;
    ago: string;
  };
};

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "new_request":
      return <InboxIcon className="size-5 text-[#22d3ee]" />;
    case "quote_sent":
      return <FileTextIcon className="size-5 text-[#a78bfa]" />;
    case "quote_accepted":
      return <CheckCircleIcon className="size-5 text-[#34d399]" />;
    case "quote_rejected":
      return <AlertCircleIcon className="size-5 text-[#f87171]" />;
    case "followup_created":
      return <BellIcon className="size-5 text-[#fbbf24]" />;
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

export function NotificationPageClient({ lang, copy }: NotificationPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadNotifications() {
    const res = await fetch(`/api/notifications?limit=50&offset=0`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.notifications ?? [];
  }

  useEffect(() => {
    loadNotifications().then((data) => {
      setNotifications(data);
      setIsLoading(false);
    });
  }, []);

  async function markOneRead(notificationId: string) {
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

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
    );

    window.location.href = `/${lang}/app/requests`;
  }

  async function handleMarkAllRead() {
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

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  }

  const hasUnread = notifications.some((n) => !n.read_at);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-neutral-400 dark:text-white/40">Loading...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          {copy.title}
        </h1>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm text-accent-2 hover:text-accent-2/80 transition-colors"
          >
            {copy.markAllRead}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <InboxIcon className="size-10 text-neutral-300 dark:text-white/20" />
          <p className="text-neutral-500 dark:text-white/50">{copy.empty}</p>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="divide-y divide-neutral-200 dark:divide-white/5">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markOneRead(notification.id)}
                className={`flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03] ${
                  !notification.read_at ? "bg-neutral-50 dark:bg-white/[0.02]" : ""
                }`}
              >
                <span className="mt-0.5 shrink-0">{notificationIcon(notification.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600 dark:text-white dark:hover:text-white/90">{notification.title}</p>
                  {notification.message && (
                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2 dark:text-white/50">{notification.message}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-neutral-400 dark:text-white/40">
                  {relativeTime(notification.created_at, copy.ago, copy.justNow)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
