"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ChartIcon,
  InboxIcon,
  FileTextIcon,
  UsersIcon,
  BellIcon,
  SettingsIcon,
  CloseIcon,
  MenuIcon,
} from "@/app/components/icons/Icons";
import type { Locale } from "@/app/[lang]/config";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
};

type DashboardMobileMenuProps = {
  lang: Locale;
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
  followupBadge: number;
};

export function DashboardMobileMenu({
  lang,
  brand,
  nav,
  navGroups,
  logo,
  followupBadge,
}: DashboardMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    // Close the drawer when the URL changes (back/forward, programmatic nav).
    // The URL is an external system we synchronize with; we cannot derive `open`
    // from `pathname`, so a direct setState is the right tool here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const main: NavItem[] = [
    { href: `/${lang}/app`, label: nav.dashboard, icon: ChartIcon },
    { href: `/${lang}/app/requests`, label: nav.requests, icon: InboxIcon },
    { href: `/${lang}/app/quotes`, label: nav.quotes, icon: FileTextIcon },
    { href: `/${lang}/app/clients`, label: nav.clients, icon: UsersIcon },
  ];
  const followup: NavItem[] = [
    {
      href: `/${lang}/app/followup`,
      label: nav.followup,
      icon: BellIcon,
      badge: followupBadge,
    },
  ];
  const general: NavItem[] = [
    { href: `/${lang}/app/settings`, label: nav.settings, icon: SettingsIcon },
  ];

  return (
    <div className="flex items-center lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="dashboard-mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {open &&
        createPortal(
          <div
            id="dashboard-mobile-menu-portal"
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <aside
              id="dashboard-mobile-menu-panel"
              aria-label={brand}
              role="dialog"
              aria-modal="true"
              className="relative flex h-full w-[85%] max-w-xs flex-col gap-6 border-r border-white/5 bg-[#060814]/95 shadow-2xl shadow-black/70 backdrop-blur-xl"
            >
              <div className="flex h-16 items-center justify-between px-5">
                {logo}
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-6">
                <NavGroup
                  title={navGroups.main}
                  items={main}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
                <NavGroup
                  title={navGroups.followup}
                  items={followup}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
                <NavGroup
                  title={navGroups.general}
                  items={general}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
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
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent-2/20 px-1.5 text-[10px] font-semibold text-accent-2">
                    {item.badge}
                  </span>
                )}
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
  if (href.endsWith("/app")) return false;
  return pathname.startsWith(`${href}/`);
}