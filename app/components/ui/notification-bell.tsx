"use client";

import { BellIcon } from "@/app/components/icons/Icons";
import Link from "next/link";

type NotificationBellProps = {
  unreadCount: number;
  lang: string;
};

export function NotificationBell({ unreadCount, lang }: NotificationBellProps) {
  return (
    <Link
      href={`/${lang}/app/notifications`}
      className="relative inline-flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white"
    >
      <BellIcon className="size-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#f87171] text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
