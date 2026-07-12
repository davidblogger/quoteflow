import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Logo } from "../ui/Logo";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/app/[lang]/dictionaries";

type NavbarProps = {
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
};

export function Navbar({ lang, nav, switcher }: NavbarProps) {
  const navLinks = [
    { href: "#inicio", label: nav.home },
    { href: "#servicios", label: nav.services },
    { href: "#como-funciona", label: nav.howItWorks },
    { href: "#beneficios", label: nav.benefits },
    { href: "#contacto", label: nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 -z-10 bg-[#060814]/60 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <Container size="wide" className="py-4">
        <nav
          className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 sm:px-5"
          aria-label={nav.home}
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher current={lang} labels={switcher} />
            <a
              href="#contacto"
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              {nav.login}
            </a>
            <Button href={`/${lang}/solicitar`} size="md">
              {nav.cta}
            </Button>
          </div>

          <MobileMenu
            lang={lang}
            nav={nav}
            switcher={switcher}
            links={navLinks}
          />
        </nav>
      </Container>
    </header>
  );
}