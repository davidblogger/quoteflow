import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getQuoteById } from "@/lib/queries/quotes";
import { getClientById } from "@/lib/queries/clients";
import { QuoteStatusBadge } from "../status-badge";
import { QuoteStatusChanger } from "./status-changer";
import { ItemsSection } from "./items-section";
import { ArrowRightIcon, FileTextIcon } from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string; id: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.quotes.metaTitle };
}

export default async function QuoteDetailPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/quotes/${id}`);

  const quote = await getQuoteById(user.id, id);
  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.quotes;
  const listHref = `/${lang}/app/quotes`;

  if (!quote) {
    return <NotFoundState listHref={listHref} copy={copy.detail.notFound} />;
  }

  const client = await getClientById(user.id, quote.client_id);

  const createdAt = new Date(quote.created_at).toLocaleString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const updatedAt = new Date(quote.updated_at).toLocaleString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const validUntil = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString(lang, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: "currency",
    currency: quote.currency,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <a
          href={listHref}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {copy.detail.backCta}
        </a>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <FileTextIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {quote.title}
            </h1>
            <p className="text-sm text-white/55">
              {client?.name ?? copy.detail.empty}
            </p>
          </div>
        </div>
        <QuoteStatusBadge status={quote.status} labels={copy.statusBadge} />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <ItemsSection
          quoteId={quote.id}
          lang={lang}
          currency={quote.currency}
          copy={copy.detail.items}
        />

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.detail.sections.totals}
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-white/60">{copy.detail.fields.subtotal}</dt>
              <dd className="text-white/85">
                {currencyFormatter.format(quote.subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <dt className="font-medium text-white">
                {copy.detail.fields.total}
              </dt>
              <dd className="text-lg font-semibold text-white">
                {currencyFormatter.format(quote.total)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-white/5 pt-5">
            <QuoteStatusChanger
              quoteId={quote.id}
              currentStatus={quote.status}
              lang={lang}
              copy={copy.statusChanger}
              labels={copy.statusBadge}
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.detail.sections.info}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Row label={copy.detail.fields.client} value={client?.name ?? null} empty={copy.detail.empty} />
            <Row label={copy.detail.fields.currency} value={quote.currency} />
            <Row label={copy.detail.fields.taxRate} value={`${quote.tax_rate}%`} />
            <Row
              label={copy.detail.fields.validUntil}
              value={validUntil}
              empty={copy.detail.empty}
            />
          </dl>
          {quote.notes && (
            <div className="mt-5 border-t border-white/5 pt-5">
              <h3 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                {copy.detail.fields.notes}
              </h3>
              <p className="whitespace-pre-wrap text-sm text-white/75">
                {quote.notes}
              </p>
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.detail.sections.meta}
          </h2>
          <dl className="flex flex-col gap-3 text-xs">
            <div>
              <dt className="text-white/45">{copy.detail.fields.createdAt}</dt>
              <dd className="mt-0.5 text-white/85">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.detail.fields.updatedAt}</dt>
              <dd className="mt-0.5 text-white/85">{updatedAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.detail.fields.id}</dt>
              <dd className="mt-0.5 break-all font-mono text-[11px] text-white/60">
                {quote.id}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  empty,
}: {
  label: string;
  value: string | null;
  empty?: string;
}) {
  const isEmpty = !value;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-white/40">{label}</dt>
      <dd className={`text-sm ${isEmpty ? "text-white/35" : "text-white/85"}`}>
        {isEmpty ? (empty ?? "—") : value}
      </dd>
    </div>
  );
}

function NotFoundState({
  listHref,
  copy,
}: {
  listHref: string;
  copy: { title: string; description: string; backCta: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-white">{copy.title}</h1>
      <p className="text-sm text-white/60">{copy.description}</p>
      <a
        href={listHref}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {copy.backCta}
      </a>
    </div>
  );
}