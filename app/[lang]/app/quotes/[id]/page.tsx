import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getQuoteById } from "@/lib/queries/quotes";
import { getClientById } from "@/lib/queries/clients";
import { getCurrentProfile } from "@/lib/queries/profile";
import { QuoteStatusBadge } from "../status-badge";
import { QuoteStatusChanger } from "./status-changer";
import { ItemsSection } from "./items-section";
import { EditQuoteLink } from "./edit-quote-link";
import { EditQuoteForm } from "./edit-quote-form";
import {
  ArrowRightIcon,
  FileTextIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/app/components/icons/Icons";
import {
  formatShareMessage,
  formatWhatsAppUrl,
  formatMailtoUrl,
} from "@/lib/utils";

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
  searchParams: Promise<{ edit?: string }>;
}) {
  const { lang, id } = await props.params;
  const { edit } = await props.searchParams;
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

  const editingHeader = edit === "header";
  const editingItemId =
    edit && edit !== "header" && edit !== "new" ? edit : null;

  const client = await getClientById(user.id, quote.client_id);
  const profile = await getCurrentProfile();

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const siteUrl = `${protocol}://${host}`;
  const pdfUrl = `${siteUrl}/api/pdf/${lang}/${quote.id}`;

  const shareMessage = profile && client
    ? formatShareMessage({ quote, client, profile, pdfUrl, lang })
    : null;
  const emailHref =
    client?.email && shareMessage
      ? formatMailtoUrl(
          client.email,
          (copy.detail.share.quoteSubject as string).replace("{title}", quote.title),
          shareMessage,
        )
      : null;
  const whatsappHref =
    client?.phone && shareMessage
      ? formatWhatsAppUrl(client.phone, shareMessage)
      : null;

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
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-white/60 dark:hover:text-white"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {copy.detail.backCta}
        </a>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200 dark:bg-white/[0.04] dark:text-white/70 dark:ring-white/10">
            <FileTextIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              {quote.title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-white/55">
              {client?.name ?? copy.detail.empty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!editingHeader && (
            <>
              <a
                href={`/api/pdf/${lang}/${quote.id}`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
              >
                {copy.detail.pdf.downloadCta}
              </a>
              {client?.email && emailHref && (
                <a
                  href={emailHref}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
                >
                  <MailIcon className="size-3.5" />
                  {copy.detail.share.email}
                </a>
              )}
              {client?.phone && whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
                >
                  <WhatsAppIcon className="size-3.5" />
                  {copy.detail.share.whatsApp}
                </a>
              )}
              <EditQuoteLink
                href={`/${lang}/app/quotes/${quote.id}?edit=header`}
                label={copy.detail.edit.cta}
              />
            </>
          )}
          <QuoteStatusBadge status={quote.status} labels={copy.statusBadge} />
        </div>
      </header>

      {editingHeader && (
        <EditQuoteForm
          quote={quote}
          clientName={client?.name ?? copy.detail.empty}
          lang={lang}
          cancelHref={`/${lang}/app/quotes/${quote.id}`}
          copy={copy.detail.edit}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ItemsSection
          quoteId={quote.id}
          lang={lang}
          currency={quote.currency}
          editingItemId={editingItemId}
          copy={copy.detail.items}
        />

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
            {copy.detail.sections.totals}
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500 dark:text-white/60">{copy.detail.fields.subtotal}</dt>
              <dd className="text-neutral-700 dark:text-white/85">
                {currencyFormatter.format(quote.subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-2 dark:border-white/5">
              <dt className="font-medium text-neutral-900 dark:text-white">
                {copy.detail.fields.total}
              </dt>
              <dd className="text-lg font-semibold text-neutral-900 dark:text-white">
                {currencyFormatter.format(quote.total)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-neutral-200 pt-5 dark:border-white/5">
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
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
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
            <div className="mt-5 border-t border-neutral-200 pt-5 dark:border-white/5">
              <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-400 dark:text-white/40">
                {copy.detail.fields.notes}
              </h3>
              <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-white/75">
                {quote.notes}
              </p>
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
            {copy.detail.sections.meta}
          </h2>
          <dl className="flex flex-col gap-3 text-xs">
            <div>
              <dt className="text-neutral-400 dark:text-white/45">{copy.detail.fields.createdAt}</dt>
              <dd className="mt-0.5 text-neutral-700 dark:text-white/85">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-neutral-400 dark:text-white/45">{copy.detail.fields.updatedAt}</dt>
              <dd className="mt-0.5 text-neutral-700 dark:text-white/85">{updatedAt}</dd>
            </div>
            <div>
              <dt className="text-neutral-400 dark:text-white/45">{copy.detail.fields.id}</dt>
              <dd className="mt-0.5 break-all font-mono text-[11px] text-neutral-500 dark:text-white/60">
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
      <dt className="text-xs uppercase tracking-wider text-neutral-400 dark:text-white/40">{label}</dt>
      <dd className={`text-sm ${isEmpty ? "text-neutral-300 dark:text-white/35" : "text-neutral-700 dark:text-white/85"}`}>
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
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{copy.title}</h1>
      <p className="text-sm text-neutral-500 dark:text-white/60">{copy.description}</p>
      <a
        href={listHref}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
      >
        {copy.backCta}
      </a>
    </div>
  );
}