"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/Button";
import { CloseIcon, MenuIcon } from "../icons/Icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/app/[lang]/config";

type Link = { href: string; label: string };

type MobileMenuProps = {
  lang: Locale;
  nav: {
    home: string;
    services: string;
    howItWorks: string;
    benefits: string;
    contact: string;
    login: string;
    cta: string;
  };
  switcher: { label: string; en: string; es: string };
  links: Link[];
};

export function MobileMenu({ lang, nav, switcher, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <LanguageSwitcher current={lang} labels={switcher} />
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-menu-panel"
            className="fixed inset-x-0 top-[72px] z-[60] px-4 sm:px-6"
          >
          <div className="glass-strong mx-auto mt-2 max-w-7xl rounded-2xl p-4 shadow-2xl shadow-black/60">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <a
                href={`/${lang}/login`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-center text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
              >
                {nav.login}
              </a>
              <Button
                href={`/${lang}/solicitar`}
                size="lg"
                className="w-full"
              >
                {nav.cta}
              </Button>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}