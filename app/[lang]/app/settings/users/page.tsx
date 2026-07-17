import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile, listWorkspaceUsers } from "@/lib/queries/profile";
import { UsersList } from "@/app/components/ui/UsersList";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.app.settings.users.title} — ${dict.app.settings.metaTitle}` };
}

export default async function UsersSettingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/settings/users`);

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/${lang}/app/settings`);

  if (profile.role !== "admin") {
    redirect(`/${lang}/app/settings`);
  }

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.settings.users;

  const users = await listWorkspaceUsers();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="text-sm text-white/55">{copy.subtitle}</p>
      </header>

      <UsersList
        users={users}
        currentUserId={profile.id}
        lang={lang}
        copy={copy}
      />
    </div>
  );
}
