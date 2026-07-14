import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profile";
import { SettingsForm } from "./settings-form";
import { ensureProfileAction } from "./ensure-profile-action";
import { UsersIcon } from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.settings.metaTitle };
}

export default async function SettingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/settings`);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.settings;

  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <ProfileSetupCard
        email={user.email ?? ""}
        lang={lang}
        title={copy.title}
        subtitle={copy.subtitle}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="text-sm text-white/55">{copy.subtitle}</p>
      </header>

      <SettingsForm profile={profile} lang={lang} copy={copy} />
    </div>
  );
}

function ProfileSetupCard({
  email,
  lang,
  title,
  subtitle,
}: {
  email: string;
  lang: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-white/55">{subtitle}</p>
      </header>

      <div className="glass-strong flex flex-col items-start gap-5 rounded-2xl p-6 sm:p-8">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
          <UsersIcon className="size-5" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-white">
            {email}
          </h2>
          <p className="text-sm text-white/65">
            Your account is signed in but the company profile hasn&apos;t
            been created yet. Click below to create it with sensible
            defaults — you can edit everything afterwards.
          </p>
        </div>

        <form action={ensureProfileAction}>
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-accent px-6 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)]"
          >
            Create my profile
          </button>
        </form>
      </div>
    </div>
  );
}