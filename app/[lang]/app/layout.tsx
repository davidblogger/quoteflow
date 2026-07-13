import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../dictionaries";
import { getUser } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export default async function AppLayout(
  props: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const user = await getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app`);

  const dict = await getDictionary(lang satisfies Locale);

  return (
    <div className="flex min-h-dvh bg-[#060814] text-white">
      <Sidebar lang={lang} copy={dict.app.shell} currentPath={`/${lang}/app`} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar lang={lang} email={user.email ?? ""} copy={dict.app.shell.topbar} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}