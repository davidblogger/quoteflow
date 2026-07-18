import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listClients } from "@/lib/queries/clients";
import { countQuotesByClient } from "@/lib/queries/quotes";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon, UsersIcon } from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.clients.metaTitle };
}

export default async function ClientsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/clients`);

  const [clients, quoteCounts] = await Promise.all([
    listClients(user.id),
    countQuotesByClient(user.id),
  ]);
  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.clients;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-white/55">{copy.subtitle}</p>
        </div>
        <Button href={`/${lang}/app/clients/new`} size="md">
          <PlusIcon className="size-4" />
          {copy.newCta}
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200 dark:bg-white/[0.04] dark:text-white/70 dark:ring-white/10">
            <UsersIcon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{copy.empty.title}</h2>
          <p className="max-w-md text-sm text-neutral-500 dark:text-white/60">
            {copy.empty.description}
          </p>
          <Button href={`/${lang}/app/clients/new`} variant="secondary" size="md">
            {copy.empty.newCta}
          </Button>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 dark:border-white/5 dark:text-white/40">
                  <th className="px-5 py-3 font-medium">{copy.columns.name}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.company}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.email}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.phone}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.createdAt}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.quotes}</th>
                  <th className="px-5 py-3 text-right font-medium">
                    {copy.columns.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {clients.map((c) => {
                  const href = `/${lang}/app/clients/${c.id}`;
                  const newQuoteHref = `/${lang}/app/quotes/new?client=${c.id}`;
                  return (
                    <tr
                      key={c.id}
                      className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-white/80 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5 align-top">
                        <a
                          href={href}
                          className="-mx-1 block rounded px-1 py-0.5 transition-colors hover:text-neutral-900 dark:hover:text-white"
                        >
                          <span className="block font-medium text-neutral-900 dark:text-white">
                            {c.name}
                          </span>
                        </a>
                      </td>
                      <td className="px-5 py-3.5 align-top text-neutral-500 dark:text-white/75">
                        {c.company ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top text-neutral-500 dark:text-white/75">
                        {c.email ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top text-neutral-500 dark:text-white/75">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-xs text-neutral-400 dark:text-white/55">
                        {new Date(c.created_at).toLocaleDateString(lang, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <QuotesBadge
                          counts={quoteCounts.get(c.id)}
                          copy={copy.columns.quotesCount}
                        />
                      </td>
                      <td className="px-5 py-3.5 align-top text-right">
                        <a
                          href={newQuoteHref}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10 dark:hover:border-white/20"
                        >
                          <PlusIcon className="size-3.5" />
                          {copy.columns.newQuote}
                        </a>
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

function QuotesBadge({
  counts,
  copy,
}: {
  counts: { total: number; active: number } | undefined;
  copy: {
    activeOne: string;
    activeMany: string;
    historicalOnly: string;
    noQuotes: string | null;
  };
}) {
  if (!counts || counts.total === 0) {
    return <span className="text-neutral-300 dark:text-white/30">—</span>;
  }

  if (counts.active > 0) {
    const label =
      counts.active === 1
        ? copy.activeOne
        : copy.activeMany.replace("{count}", String(counts.active));
    const tone =
      "bg-success/15 text-success ring-1 ring-inset ring-success/30";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone}`}
      >
        <span className="size-1.5 rounded-full bg-success" />
        {counts.total} <span className="text-success/70">·</span> {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 ring-1 ring-inset ring-neutral-300 dark:bg-white/10 dark:text-white/55 dark:ring-white/15">
      <span className="size-1.5 rounded-full bg-neutral-400 dark:bg-white/40" />
      {counts.total}
      <span className="text-neutral-400 dark:text-white/35">·</span>
      {copy.historicalOnly}
    </span>
  );
}