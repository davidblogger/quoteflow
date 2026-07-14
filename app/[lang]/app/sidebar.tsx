import { Logo } from "@/app/components/ui/Logo";
import { AppSidebar } from "@/app/components/layout/AppSidebar";
import type { Locale } from "../config";

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
};

export function Sidebar({ lang, copy }: SidebarProps) {
  return (
    <AppSidebar
      lang={lang}
      brand={copy.brand}
      nav={copy.nav}
      navGroups={copy.navGroups}
      logo={<Logo lang={lang} />}
    />
  );
}