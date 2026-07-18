import { redirect } from "next/navigation";
import { hasLocale, getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/app/[lang]/config";
import { getQuoteByIdUnfiltered } from "@/lib/queries/quotes";
import { getClientByIdUnfiltered } from "@/lib/queries/clients";
import { listItemsUnfiltered } from "@/lib/queries/quote-items";
import { getProfileAdmin } from "@/lib/queries/profile";
import { ArrowRightIcon } from "@/app/components/icons/Icons";
import { AutoPrint } from "./auto-print";

export const dynamic = "force-dynamic";

export default async function QuotePdfPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const [quote, profile, items, client] = await Promise.all([
    getQuoteByIdUnfiltered(id),
    getProfileAdmin(),
    listItemsUnfiltered(id),
    getQuoteByIdUnfiltered(id).then(async (q) =>
      q ? getClientByIdUnfiltered(q.client_id) : null,
    ),
  ]);

  if (!quote) redirect(`/${lang}/app/quotes`);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.quotes.detail.pdf;

  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: "currency",
    currency: quote.currency,
  });

  const taxAmount =
    Number(quote.subtotal) * (Number(quote.tax_rate) / 100);
  const issuedAt = new Date(quote.created_at).toLocaleDateString(lang, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const validUntil = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString(lang, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black sm:px-8 sm:py-12 print:px-0 print:py-0">
      <AutoPrint delay={400} />

      <div className="mx-auto flex max-w-3xl flex-col gap-2 print:hidden">
        <a
          href={`/${lang}/app/quotes/${quote.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {copy.backCta}
        </a>
        <p className="text-xs text-neutral-500">{copy.autoPrintHint}</p>
      </div>

      <article className="mx-auto mt-6 flex max-w-3xl flex-col gap-8 bg-white p-6 text-black sm:p-10 print:mt-0 print:p-8">
        <header className="flex flex-col gap-2 border-b border-neutral-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {copy.quoteLabel}
              </span>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {quote.title}
              </h1>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-base font-semibold text-neutral-900">
                {profile?.company_name ?? "QuoteFlow"}
              </span>
              {profile?.email && (
                <span className="text-xs text-neutral-600">{profile.email}</span>
              )}
              {profile?.phone && (
                <span className="text-xs text-neutral-600">{profile.phone}</span>
              )}
              {profile?.address && (
                <span className="text-xs text-neutral-600 whitespace-pre-line">
                  {profile.address}
                </span>
              )}
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">
                {copy.preparedFor}
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">
                {client?.name ?? "—"}
              </dd>
              {client?.company && (
                <dd className="text-xs text-neutral-600">{client.company}</dd>
              )}
              {client?.email && (
                <dd className="text-xs text-neutral-600">{client.email}</dd>
              )}
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">
                {copy.issueDate}
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{issuedAt}</dd>
              {validUntil && (
                <>
                  <dt className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
                    {copy.validUntil}
                  </dt>
                  <dd className="text-xs text-neutral-700">{validUntil}</dd>
                </>
              )}
            </div>
          </dl>
        </header>

        <section>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-xs uppercase tracking-wider text-neutral-600">
                <th className="py-2 pr-3 font-medium">{copy.table.description}</th>
                <th className="py-2 pr-3 text-right font-medium">{copy.table.quantity}</th>
                <th className="py-2 pr-3 text-right font-medium">{copy.table.unitPrice}</th>
                <th className="py-2 text-right font-medium">{copy.table.subtotal}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-neutral-500">
                    {copy.noItems}
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const lineSubtotal = Number(it.quantity) * Number(it.unit_price);
                  return (
                    <tr key={it.id} className="border-b border-neutral-100 align-top">
                      <td className="py-2 pr-3 text-neutral-800">
                        <span className="whitespace-pre-wrap">{it.description}</span>
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-neutral-800">
                        {Number(it.quantity)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-neutral-800">
                        {currencyFormatter.format(Number(it.unit_price))}
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium text-neutral-900">
                        {currencyFormatter.format(lineSubtotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <section className="ml-auto w-full max-w-xs">
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between text-neutral-700">
              <dt>{copy.totals.subtotal}</dt>
              <dd className="tabular-nums">{currencyFormatter.format(Number(quote.subtotal))}</dd>
            </div>
            {Number(quote.tax_rate) > 0 && (
              <div className="flex items-center justify-between text-neutral-700">
                <dt>{copy.totals.tax} ({quote.tax_rate}%)</dt>
                <dd className="tabular-nums">{currencyFormatter.format(taxAmount)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-neutral-300 pt-2 text-base font-semibold text-neutral-900">
              <dt>{copy.totals.total}</dt>
              <dd className="tabular-nums">{currencyFormatter.format(Number(quote.total))}</dd>
            </div>
          </dl>
        </section>

        {quote.notes && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {dict.app.quotes.form.fields.notes}
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {quote.notes}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}
