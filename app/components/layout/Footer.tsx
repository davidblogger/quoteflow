import { Container } from "../ui/Container";
import { Logo } from "../ui/Logo";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "../icons/Icons";

type FooterProps = {
  footer: {
    description: string;
    sections: Array<{
      title: string;
      links: Array<{ label: string }>;
    }>;
    legal: { terms: string; privacy: string; cookies: string };
    copyright: string;
  };
};

const social = [
  { label: "LinkedIn", href: "#", icon: LinkedinIcon },
  { label: "Twitter", href: "#", icon: TwitterIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "GitHub", href: "#", icon: GithubIcon },
];

export function Footer({ footer }: FooterProps) {
  return (
    <footer className="relative mt-10 border-t border-white/5 pt-16 pb-10 sm:pt-20">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              {footer.description}
            </p>
            <div className="flex items-center gap-2">
              {social.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footer.sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href="#"
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-white/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} QuoteFlow. {footer.copyright}
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white/80">
              {footer.legal.terms}
            </a>
            <a href="#" className="hover:text-white/80">
              {footer.legal.privacy}
            </a>
            <a href="#" className="hover:text-white/80">
              {footer.legal.cookies}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}