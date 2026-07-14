import type { Locale } from "../config";
import { Logo } from "@/app/components/ui/Logo";
import {
  ChartIcon,
  InboxIcon,
  FileTextIcon,
  UsersIcon,
  BellIcon,
  SettingsIcon,
} from "@/app/components/icons/Icons";

type SidebarProps = {
  lang: Locale;
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
  };
  currentPath: string;
};

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function Sidebar({ lang, copy, currentPath }: SidebarProps) {
  const main: Item[] = [
    { href: `/${lang}/app`, label: copy.nav.dashboard, icon: ChartIcon },
    { href: `/${lang}/app/requests`, label: copy.nav.requests, icon: InboxIcon },
    { href: `/${lang}/app/quotes`, label: copy.nav.quotes, icon: FileTextIcon },
    { href: `/${lang}/app/clients`, label: copy.nav.clients, icon: UsersIcon },
  ];
  const followup: Item[] = [
    { href: `/${lang}/app/followup`, label: copy.nav.followup, icon: BellIcon },
  ];
  const general: Item[] = [
    { href: `/${lang}/app/settings`, label: copy.nav.settings, icon: SettingsIcon },
  ];

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col gap-6 border-r border-white/5 bg-[#060814]/40 backdrop-blur-xl print:hidden lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo lang={lang} />
      </div>

      <nav aria-label={copy.brand} className="flex flex-1 flex-col gap-6 px-3 pb-6">
        <NavGroup title={copy.navGroups.main} items={main} currentPath={currentPath} />
        <NavGroup title={copy.navGroups.followup} items={followup} currentPath={currentPath} />
        <NavGroup title={copy.navGroups.general} items={general} currentPath={currentPath} />
      </nav>
    </aside>
  );
}

function NavGroup({
  title,
  items,
  currentPath,
}: {
  title: string;
  items: Item[];
  currentPath: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
        {title}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            currentPath === item.href ||
            (item.href !== `/${"en"}/app` && currentPath.startsWith(`${item.href}/`));
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