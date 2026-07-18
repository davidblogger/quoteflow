import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listFollowups,
  countFollowupsByUrgency,
} from "@/lib/queries/followups";
import { listClients } from "@/lib/queries/clients";
import { bucketOf, type FollowupBucket, type Followup } from "@/lib/types/followup";
import { NewFollowupForm } from "./new-followup-form";
import { FollowupRow } from "./followup-row";
import { UsersIcon } from "@/app/components/icons/Icons";

type SearchParams = Promise<{ tab?: string }>;

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.followup.metaTitle };
}

const TAB_KEYS: FollowupBucket[] = ["overdue", "today", "upcoming", "completed"];

function parseTab(input: string | undefined): FollowupBucket {
  if (input && (TAB_KEYS as string[]).includes(input)) {
    return input as FollowupBucket;
  }
  return "overdue";
}

export default async function FollowupPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await props.params;
  const { tab } = await props.searchParams;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/followup`);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.followup;

  const [followups, clients, counts] = await Promise.all([
    listFollowups(user.id),
    listClients(user.id),
    countFollowupsByUrgency(user.id),
  ]);

  const activeTab = parseTab(tab);

  // Group client_id -> name for the row display, so we don't fetch
  // each one inside the map.
  const clientsById = new Map(clients.map((c) => [c.id, c]));

  const visible = followups.filter(
    (f) => bucketOf(f) === activeTab,
  );

  const tabCount = (key: FollowupBucket) => {
    if (key === "overdue") return counts.overdue;
    if (key === "today") return counts.dueToday;
    if (key === "upcoming") return counts.upcoming;
    return counts.completed;
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-white/55">{copy.subtitle}</p>
      </header>

      <nav
        aria-label="Filter by status"
        className="flex flex-wrap items-center gap-2"
      >
        {TAB_KEYS.map((key) => {
          const active = activeTab === key;
          const label = copy.tabs[key];
          const count = tabCount(key);
          return (
            <a
              key={key}
              href={`/${lang}/app/followup?tab=${key}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-[#060814]"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white"
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] ${
                    active
                      ? "bg-white text-neutral-900 dark:bg-[#060814] dark:text-white"
                      : "bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-white/55"
                  }`}
                >
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="flex justify-end">
        <NewFollowupForm
          lang={lang}
          copy={copy}
          clients={clients.map((c) => ({
            id: c.id,
            label: c.name,
            company: c.company,
          }))}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          copy={copy.empty}
          ctaHref={`/${lang}/app/followup?tab=overdue`}
          activeTab={activeTab}
        />
      ) : (
        <FollowupTable
          followups={visible}
          clientsById={clientsById}
          copy={copy}
          lang={lang}
        />
      )}
    </div>
  );
}

function FollowupTable({
  followups,
  clientsById,
  copy,
  lang,
}: {
  followups: Followup[];
  clientsById: Map<string, { id: string; name: string; company: string | null }>;
  copy: Awaited<ReturnType<typeof getDictionary>>["app"]["followup"];
  lang: string;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 dark:border-white/5 dark:text-white/40">
              <th className="px-4 py-3 font-medium">{copy.table.subject}</th>
              <th className="px-4 py-3 font-medium">{copy.table.client}</th>
              <th className="px-4 py-3 text-right font-medium">
                {copy.table.due}
              </th>
              <th className="px-4 py-3 font-medium">{copy.table.status}</th>
              <th
                className="px-4 py-3 text-right font-medium"
                aria-label={copy.table.actions}
              ></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
            {followups.map((f) => (
              <FollowupRow
                key={f.id}
                followup={f}
                clientName={
                  f.client_id ? clientsById.get(f.client_id)?.name ?? null : null
                }
                lang={lang}
                copy={copy}
                reopenLabel="Reopen"
                deleteLabel="Delete"
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({
  copy,
  ctaHref,
  activeTab,
}: {
  copy: {
    title: string;
    description: string;
    cta: string;
  };
  ctaHref: string;
  activeTab: FollowupBucket;
}) {
  // On the "completed" tab we show a different framing — there's nothing
  // pending to act on, just a calm "all done" message.
  if (activeTab === "completed") {
    return (
      <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-14 text-center">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{copy.title}</p>
        <p className="max-w-md text-xs text-neutral-500 dark:text-white/55">{copy.description}</p>
      </div>
    );
  }
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200 dark:bg-white/[0.04] dark:text-white/70 dark:ring-white/10">
        <UsersIcon className="size-5" />
      </span>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{copy.title}</h2>
      <p className="max-w-md text-sm text-neutral-500 dark:text-white/60">{copy.description}</p>
      <a
        href={ctaHref}
        className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
      >
        {copy.cta}
      </a>
    </div>
  );
}