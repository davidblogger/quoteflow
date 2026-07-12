import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { RequestForm } from "./RequestForm";
import { getDictionary, hasLocale, locales } from "../dictionaries";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.requestPage.metaTitle,
    description: dict.requestPage.description,
    alternates: {
      canonical: `/${lang}/solicitar`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/solicitar`]),
      ),
    },
  };
}

export default async function RequestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar lang={lang} nav={dict.nav} switcher={dict.languageSwitcher} />
      <main className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,140,255,0.18),transparent_70%)]"
        />
        <Container size="narrow" className="pt-16 pb-24 sm:pt-20 sm:pb-32">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-accent-2 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
              {dict.requestPage.eyebrow}
            </span>
            <h1 className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {dict.requestPage.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
              {dict.requestPage.description}
            </p>
          </div>

          <div className="glass-strong mt-12 rounded-3xl p-6 sm:p-10">
            <RequestForm
              copy={dict.requestPage}
              locale={lang}
              homeHref={`/${lang}`}
            />
          </div>
        </Container>
      </main>
      <Footer lang={lang} footer={dict.footer} />
    </>
  );
}