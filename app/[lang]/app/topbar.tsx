import type { Locale } from "../config";
import { signOutAction } from "../(auth)/actions";
import { SearchIcon } from "@/app/components/icons/Icons";
import { Logo } from "@/app/components/ui/Logo";
import { DashboardMobileMenu } from "@/app/components/layout/DashboardMobileMenu";
import { NotificationBell } from "@/app/components/ui/notification-bell";

type TopbarProps = {
  lang: Locale;
  email: string;
  copy: {
    brand: string;
    nav: {
      dashboard: string;
      requests: string;
      quotes: string;
      clients: string;
      followup: string;
      settings: string;
    };
    navGroups: {
      main: string;
      followup: string;
      general: string;
    };
    topbar: {
      search: string;
      signOut: string;
    };
    notifications: {
      title: string;
      empty: string;
      markAllRead: string;
      justNow: string;
      ago: string;
      viewAll: string;
    };
  };
  followupBadge: number;
  unreadNotifications: number;
};

export function Topbar({ lang, email, copy, followupBadge, unreadNotifications }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-[#060814]/60 px-4 backdrop-blur-xl print:hidden sm:gap-4 sm:px-6">
      <DashboardMobileMenu
        lang={lang}
        brand={copy.brand}
        nav={copy.nav}
        navGroups={copy.navGroups}
        logo={<Logo lang={lang} />}
        followupBadge={followupBadge}
      />

      <label className="relative flex h-10 flex-1 items-center">
        <span className="pointer-events-none absolute left-3.5 flex items-center text-white/40">
          <SearchIcon className="size-4" />
        </span>
        <input
          type="search"
          placeholder={copy.topbar.search}
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:outline-none focus:bg-white/[0.06] focus:border-white/20"
        />
      </label>

      <NotificationBell
        unreadCount={unreadNotifications}
        lang={lang}
        copy={copy.notifications}
      />

      <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-4">
        <div className="hidden flex-col text-right sm:flex">
          <span className="text-xs font-medium text-white">{email}</span>
        </div>
        <form action={signOutAction.bind(null, lang)}>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04 px-4 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            {copy.topbar.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}