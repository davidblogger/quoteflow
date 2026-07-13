import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../dictionaries";
import { Logo } from "@/app/components/ui/Logo";
import { LanguageSwitcher } from "@/app/components/layout/LanguageSwitcher";

export default async function AuthLayout(
  props: { children: ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang satisfies Locale);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(124,140,255,0.18), transparent 60%), radial-gradient(40% 40% at 80% 100%, rgba(236,72,153,0.12), transparent 60%)",
        }}
      />

      <header className="px-6 pt-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo lang={lang} />
          <LanguageSwitcher current={lang} labels={dict.languageSwitcher} />
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">{props.children}</div>
      </main>
    </div>
  );
}