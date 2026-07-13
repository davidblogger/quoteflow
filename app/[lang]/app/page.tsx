import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../dictionaries";
import { getUser } from "@/lib/supabase/server";
import { Container } from "@/app/components/ui/Container";
import { CheckCircleIcon } from "@/app/components/icons/Icons";
import { LogoutButton } from "./logout-button";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.placeholder.metaTitle };
}

export default async function AppHome(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const user = await getUser();
  if (!user) {
    redirect(`/${lang}/login?next=/${lang}/app`);
  }

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.placeholder;

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
      <Container size="default" className="flex min-h-dvh items-center py-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <div className="mb-6 flex flex-col items-center gap-4 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-success/15 text-success shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                <CheckCircleIcon className="size-8" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-accent-2">
                {copy.eyebrow}
              </span>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {copy.title}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-white/65">
                {copy.subtitle.replace("{email}", user.email ?? "")}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <LogoutButton lang={lang} label={copy.signOut} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}