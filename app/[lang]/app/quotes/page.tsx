import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listQuotes } from "@/lib/queries/quotes";
import { listClients } from "@/lib/queries/clients";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon, FileTextIcon } from "@/app/components/icons/Icons";
import { QuoteStatusBadge } from "./status-badge";

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.quotes.metaTitle };
}

export default async function QuotesPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/quotes`);

  const [quotes, clients] = await Promise.all([
    listQuotes(user.id),
    listClients(user.id),
  ]);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.quotes;

  const clientsById = new Map(clients.map((c) => [c.id, c]));

  const newHref =
    clients.length === 0
      ? `/${lang}/app/clients/new`
      : `/${lang}/app/quotes/new`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-white/55">{copy.subtitle}</p>
        </div>
        <Button href={newHref} size="md">
          <PlusIcon className="size-4" />
          {copy.newCta}
        </Button>
      </div>

      {quotes.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200 dark:bg-white/[0.04] dark:text-white/70 dark:ring-white/10">
            <FileTextIcon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{copy.empty.title}</h2>
          <p className="max-w-md text-sm text-neutral-500 dark:text-white/60">
            {copy.empty.description}
          </p>
          <Button href={newHref} variant="secondary" size="md">
            {clients.length === 0
              ? dict.app.clients.empty.newCta
              : copy.empty.newCta}
          </Button>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 dark:border-white/5 dark:text-white/40">
                  <th className="px-5 py-3 font-medium">{copy.columns.title}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.client}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.status}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.total}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.validUntil}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.createdAt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {quotes.map((q) => {
                  const client = clientsById.get(q.client_id);
                  const href = `/${lang}/app/quotes/${q.id}`;
                  return (
                    <tr
                      key={q.id}
                      className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-white/80 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5 align-top">
                        <a
                          href={href}
                          className="-mx-1 block rounded px-1 py-0.5 font-medium text-neutral-900 transition-colors hover:text-neutral-600 dark:text-white dark:hover:text-white"
                        >
                          {q.title}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 align-top text-neutral-500 dark:text-white/75">
                        {client?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <QuoteStatusBadge
                          status={q.status}
                          labels={copy.statusBadge}
                        />
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-neutral-500 dark:text-white/75">
                        {new Intl.NumberFormat(lang, {
                          style: "currency",
                          currency: q.currency,
                        }).format(q.total)}
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-xs text-neutral-400 dark:text-white/55">
                        {q.valid_until
                          ? new Date(q.valid_until).toLocaleDateString(lang, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-xs text-neutral-400 dark:text-white/55">
                        {new Date(q.created_at).toLocaleDateString(lang, {
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