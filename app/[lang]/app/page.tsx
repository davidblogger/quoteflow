import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon } from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.shell.overview.metaTitle };
}

export default async function AppOverview(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", user.id)
    .single();

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.shell.overview;

  const displayName =
    profile?.company_name?.trim() || user.email?.split("@")[0] || "";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {copy.greeting.replace("{name}", displayName)}
          </h1>
          <p className="text-sm text-white/55">{copy.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="md" href={`/${lang}/quotes/new`}>
            <PlusIcon className="size-4" />
            {copy.newQuoteCta}
          </Button>
        </div>
      </div>

      <section
        aria-label="KPIs"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {copy.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="glass rounded-2xl p-5"
          >
            <p className="text-sm font-medium text-white/75">{kpi.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">—</p>
            <p className="mt-1 text-xs text-white/45">{kpi.note}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label={copy.tableTitle}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{copy.tableTitle}</h2>
            <a
              href={`/${lang}/app/requests`}
              className="text-xs text-white/40 transition-colors hover:text-white"
            >
              {copy.viewAll} →
            </a>
          </header>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-12 text-center">
            <p className="text-sm text-white/65">{copy.emptyRequests}</p>
          </div>
        </section>

        <section aria-label={copy.activityTitle} className="glass rounded-2xl p-5">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {copy.activityTitle}
            </h2>
            <span className="text-xs text-white/40">{copy.activityToday}</span>
          </header>
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/55">
            {copy.emptyKpis}
          </p>
        </section>
      </div>
    </div>
  );
}