"use client";

import type { ComponentType, ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ChartIcon,
  InboxIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
} from "@/app/components/icons/Icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type AppSidebarProps = {
  lang: string;
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
  logo: ReactNode;
};

export function AppSidebar({
  lang,
  brand,
  nav,
  navGroups,
  logo,
}: AppSidebarProps) {
  const pathname = usePathname();

  const main: NavItem[] = [
    { href: `/${lang}/app`, label: nav.dashboard, icon: ChartIcon },
    { href: `/${lang}/app/requests`, label: nav.requests, icon: InboxIcon },
    { href: `/${lang}/app/quotes`, label: nav.quotes, icon: FileTextIcon },
    { href: `/${lang}/app/clients`, label: nav.clients, icon: UsersIcon },
  ];
  const general: NavItem[] = [
    { href: `/${lang}/app/settings`, label: nav.settings, icon: SettingsIcon },
  ];

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col gap-6 border-r border-white/5 bg-[#060814]/40 backdrop-blur-xl print:hidden lg:flex">
      <div className="flex h-16 items-center px-5">{logo}</div>

      <nav
        aria-label={brand}
        className="flex flex-1 flex-col gap-6 px-3 pb-6"
      >
        <NavGroup title={navGroups.main} items={main} pathname={pathname} />
        <NavGroup
          title={navGroups.general}
          items={general}
          pathname={pathname}
        />
      </nav>
    </aside>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
        {title}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  // Treat the dashboard link (/app) as "only exact", so it stops being
  // highlighted when we're on /app/clients, /app/settings, etc.
  if (href.endsWith("/app")) return false;
  return pathname.startsWith(`${href}/`);
}