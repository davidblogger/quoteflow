import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon } from "@/app/components/icons/Icons";
import { RequestStatusBadge } from "./requests/status-badge";
import {
  countNewRequestsThisWeek,
  countPendingQuotes,
  countActiveClientsLast30Days,
} from "@/lib/queries/dashboard";
import { countFollowupsByUrgency } from "@/lib/queries/followups";
import { listRequests } from "@/lib/queries/requests";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.shell.overview.metaTitle };
}

function timeAgo(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "<1m";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
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

  const [profileResult, dict, requestsDict, [newRequests, pendingQuotes, activeClients, followupCounts, recentRequests]] = await Promise.all([
    supabase.from("profiles").select("company_name").eq("id", user.id).single(),
    getDictionary(lang satisfies Locale),
    getDictionary(lang satisfies Locale).then((d) => d.app.requests.statusBadge),
    Promise.all([
      countNewRequestsThisWeek(user.id),
      countPendingQuotes(user.id),
      countActiveClientsLast30Days(user.id),
      countFollowupsByUrgency(user.id),
      listRequests(user.id, undefined).then((r) => r.slice(0, 5)),
    ]),
  ]);

  const copy = dict.app.shell.overview;
  const displayName =
    profileResult.data?.company_name?.trim() || user.email?.split("@")[0] || "";

  const kpis = [
    { value: newRequests, label: copy.kpis[0].label, note: copy.kpis[0].note },
    { value: pendingQuotes, label: copy.kpis[1].label, note: copy.kpis[1].note },
    { value: activeClients, label: copy.kpis[2].label, note: copy.kpis[2].note },
    { value: followupCounts.overdue + followupCounts.dueToday, label: copy.kpis[3].label, note: copy.kpis[3].note },
  ];

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
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-5">
            <p className="text-sm font-medium text-white/75">{kpi.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {kpi.value}
            </p>
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
          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-12 text-center">
              <p className="text-sm text-white/65">{copy.emptyRequests}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                    <th className="pb-3 pr-4 font-medium">{copy.columns.client}</th>
                    <th className="pb-3 pr-4 font-medium">{copy.columns.service}</th>
                    <th className="pb-3 pr-4 font-medium">{copy.columns.status}</th>
                    <th className="pb-3 font-medium">{copy.columns.ago}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentRequests.map((r) => (
                    <tr key={r.id} className="text-white/80">
                      <td className="py-3 pr-4">
                        <a
                          href={`/${lang}/app/requests/${r.id}`}
                          className="block hover:text-white"
                        >
                          <span className="font-medium">{r.name}</span>
                          <span className="ml-2 text-xs text-white/50">
                            {r.company ?? r.email}
                          </span>
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-white/65">{r.service ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <RequestStatusBadge status={r.status} labels={requestsDict} />
                      </td>
                      <td className="py-3 whitespace-nowrap text-xs text-white/50">
                        {timeAgo(r.created_at, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
