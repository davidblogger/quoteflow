import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listRequests,
  parseStatusFilter,
  REQUEST_STATUSES,
  type RequestStatus,
} from "@/lib/queries/requests";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon } from "@/app/components/icons/Icons";
import { RequestStatusBadge } from "./status-badge";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.requests.metaTitle };
}

type SearchParams = Promise<{ status?: string }>;

export default async function RequestsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await props.params;
  const { status: statusParam } = await props.searchParams;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/requests`);

  const filter = parseStatusFilter(statusParam);
  const requests = await listRequests(user.id, filter ?? undefined);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.requests;

  const filterItems: { key: RequestStatus | "all"; label: string }[] = [
    { key: "all", label: copy.filters.all },
    ...REQUEST_STATUSES.map((s) => ({ key: s, label: copy.filters[s] })),
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-white/55">{copy.subtitle}</p>
        </div>
        <Button href={`/${lang}/solicitar`} size="md">
          <PlusIcon className="size-4" />
          {copy.newCta}
        </Button>
      </div>

      <nav
        aria-label="Filter by status"
        className="flex flex-wrap items-center gap-2"
      >
        {filterItems.map((item) => {
          const active =
            (item.key === "all" && !filter) ||
            (item.key !== "all" && filter === item.key);
          const href =
            item.key === "all"
              ? `/${lang}/app/requests`
              : `/${lang}/app/requests?status=${item.key}`;
          return (
            <a
              key={item.key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-white text-[#060814]"
                  : "border border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {requests.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-white">{copy.empty.title}</h2>
          <p className="max-w-md text-sm text-white/60">{copy.empty.description}</p>
          <Button href={`/${lang}/solicitar`} variant="secondary" size="md">
            {copy.empty.openFormCta}
          </Button>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3 font-medium">{copy.columns.client}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.company}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.service}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.message}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.status}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.received}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((r) => {
                  const href = `/${lang}/app/requests/${r.id}`;
                  return (
                    <tr
                      key={r.id}
                      className="text-white/80 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5 align-top">
                        <a
                          href={href}
                          className="-mx-1 block rounded px-1 py-0.5 transition-colors hover:text-white"
                        >
                          <span className="block font-medium text-white">
                            {r.name}
                          </span>
                          <span className="block text-xs text-white/50">
                            {r.email}
                          </span>
                        </a>
                      </td>
                      <td className="px-5 py-3.5 align-top text-white/75">
                        {r.company ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top text-white/75">
                        {r.service ?? "—"}
                      </td>
                      <td className="max-w-xs truncate px-5 py-3.5 align-top text-white/65">
                        {r.message}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <RequestStatusBadge
                          status={r.status}
                          labels={copy.statusBadge}
                        />
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-xs text-white/55">
                        {new Date(r.created_at).toLocaleDateString(lang, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}