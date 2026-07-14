import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listClients } from "@/lib/queries/clients";
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

  const clients = await listClients(user.id);
  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.clients;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-white/55">{copy.subtitle}</p>
        </div>
        <Button href={`/${lang}/app/clients/new`} size="md">
          <PlusIcon className="size-4" />
          {copy.newCta}
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <UsersIcon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold text-white">{copy.empty.title}</h2>
          <p className="max-w-md text-sm text-white/60">
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
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3 font-medium">{copy.columns.name}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.company}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.email}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.phone}</th>
                  <th className="px-5 py-3 font-medium">{copy.columns.createdAt}</th>
                  <th className="px-5 py-3 text-right font-medium">
                    {copy.columns.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((c) => {
                  const href = `/${lang}/app/clients/${c.id}`;
                  const newQuoteHref = `/${lang}/app/quotes/new?client=${c.id}`;
                  return (
                    <tr
                      key={c.id}
                      className="text-white/80 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5 align-top">
                        <a
                          href={href}
                          className="-mx-1 block rounded px-1 py-0.5 transition-colors hover:text-white"
                        >
                          <span className="block font-medium text-white">
                            {c.name}
                          </span>
                        </a>
                      </td>
                      <td className="px-5 py-3.5 align-top text-white/75">
                        {c.company ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top text-white/75">
                        {c.email ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top text-white/75">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 align-top whitespace-nowrap text-xs text-white/55">
                        {new Date(c.created_at).toLocaleDateString(lang, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 align-top text-right">
                        <a
                          href={newQuoteHref}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04 px-3 text-xs font-medium text-white transition-colors hover:bg-white/10 hover:border-white/20"
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