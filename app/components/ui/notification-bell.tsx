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
      className="relative inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
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
