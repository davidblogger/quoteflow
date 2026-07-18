import { NextResponse } from "next/server";
import { hasLocale, getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/app/[lang]/config";
import { getQuoteByIdUnfiltered } from "@/lib/queries/quotes";
import { getClientByIdUnfiltered } from "@/lib/queries/clients";
import { listItemsUnfiltered } from "@/lib/queries/quote-items";
import { getProfileAdmin } from "@/lib/queries/profile";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ lang: string; id: string }> }
) {
  try {
    const { lang, id } = await props.params;
    console.log("[PDF API] lang:", lang, "id:", id);

    if (!hasLocale(lang)) {
      return new NextResponse("Invalid locale", { status: 400 });
    }

    const quote = await getQuoteByIdUnfiltered(id);
    console.log("[PDF API] quote:", quote ? "found" : "null");
    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    const [profile, items, client] = await Promise.all([
      getProfileAdmin(),
      listItemsUnfiltered(id),
      quote.client_id ? getClientByIdUnfiltered(quote.client_id) : null,
    ]);
    console.log("[PDF API] profile:", profile ? "found" : "null", "items:", items.length);

    const dict = await getDictionary(lang as Locale);
    const copy = dict.app.quotes.detail.pdf;
    console.log("[PDF API] dict loaded");

    const currencyFormatter = new Intl.NumberFormat(lang, {
      style: "currency",
      currency: quote.currency,
    });

  const taxAmount = Number(quote.subtotal) * (Number(quote.tax_rate) / 100);
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

  const itemsHtml = items.length === 0
    ? `<tr><td colspan="4" class="py-6 text-center text-sm text-neutral-500">${copy.noItems}</td></tr>`
    : items.map((it) => {
        const lineSubtotal = Number(it.quantity) * Number(it.unit_price);
        return `
          <tr class="border-b border-neutral-100 align-top">
            <td class="py-2 pr-3 text-neutral-800"><span class="whitespace-pre-wrap">${it.description}</span></td>
            <td class="py-2 pr-3 text-right tabular-nums text-neutral-800">${Number(it.quantity)}</td>
            <td class="py-2 pr-3 text-right tabular-nums text-neutral-800">${currencyFormatter.format(Number(it.unit_price))}</td>
            <td class="py-2 text-right tabular-nums font-medium text-neutral-900">${currencyFormatter.format(lineSubtotal)}</td>
          </tr>
        `;
      }).join("");

  const taxHtml = Number(quote.tax_rate) > 0
    ? `<div class="flex items-center justify-between text-neutral-700">
        <dt>${copy.totals.tax} (${quote.tax_rate}%)</dt>
        <dd class="tabular-nums">${currencyFormatter.format(taxAmount)}</dd>
      </div>`
    : "";

  const notesHtml = quote.notes
    ? `<section>
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">${dict.app.quotes.form.fields.notes}</h3>
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">${quote.notes}</p>
      </section>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${quote.title} - QuoteFlow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; color: black; }
    .container { max-width: 3xl; margin: 0 auto; padding: 2rem; }
    header { border-bottom: 1px solid #e5e7eb; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: 1rem; }
    .flex-col { flex-direction: column; }
    .items-end { align-items: flex-end; }
    .text-right { text-align: right; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .uppercase { text-transform: uppercase; }
    .tracking-widest { letter-spacing: 0.1em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .text-neutral-500 { color: #6b7280; }
    .text-neutral-600 { color: #4b5563; }
    .text-neutral-700 { color: #374151; }
    .text-neutral-800 { color: #1f2937; }
    .text-neutral-900 { color: #111827; }
    .whitespace-pre-wrap { white-space: pre-wrap; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .gap-8 { gap: 2rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .pr-3 { padding-right: 0.75rem; }
    .border-b { border-bottom-width: 1px; border-bottom-color: #e5e7eb; }
    .border-t { border-top-width: 1px; border-top-color: #d1d5db; }
    .border-collapse { border-collapse: collapse; }
    .w-full { width: 100%; }
    .max-w-xs { max-width: 14rem; }
    .ml-auto { margin-left: auto; }
    .grid { display: grid; }
    .gap-4 { gap: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 0.5rem 0.75rem 0.5rem 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #d1d5db; }
    td { padding: 0.5rem 0.75rem 0.5rem 0; font-size: 0.875rem; color: #1f2937; border-bottom: 1px solid #f3f4f6; }
    dl { display: flex; flex-direction: column; gap: 0.375rem; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .pt-2 { padding-top: 0.5rem; }
    @media print {
      body { padding: 0; }
      .container { max-width: none; padding: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="flex justify-between gap-4">
        <div class="flex flex-col">
          <span class="text-xs font-semibold uppercase tracking-widest text-neutral-500">${copy.quoteLabel}</span>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">${quote.title}</h1>
        </div>
        <div class="flex flex-col items-end text-right">
          <span class="text-lg font-semibold text-neutral-900">${profile?.company_name ?? "QuoteFlow"}</span>
          ${profile?.email ? `<span class="text-xs text-neutral-600">${profile.email}</span>` : ""}
          ${profile?.phone ? `<span class="text-xs text-neutral-600">${profile.phone}</span>` : ""}
          ${profile?.address ? `<span class="text-xs text-neutral-600" style="white-space: pre-line">${profile.address}</span>` : ""}
        </div>
      </div>
      <div class="mt-4 grid gap-4 text-sm" style="grid-template-columns: repeat(2, 1fr);">
        <div>
          <dt class="text-xs uppercase tracking-wider text-neutral-500">${copy.preparedFor}</dt>
          <dd class="mt-0.5 font-medium text-neutral-900">${client?.name ?? "—"}</dd>
          ${client?.company ? `<dd class="text-xs text-neutral-600">${client.company}</dd>` : ""}
          ${client?.email ? `<dd class="text-xs text-neutral-600">${client.email}</dd>` : ""}
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-neutral-500">${copy.issueDate}</dt>
          <dd class="mt-0.5 font-medium text-neutral-900">${issuedAt}</dd>
          ${validUntil ? `
          <dt class="mt-2 text-xs uppercase tracking-wider text-neutral-500">${copy.validUntil}</dt>
          <dd class="text-xs text-neutral-700">${validUntil}</dd>
          ` : ""}
        </div>
      </div>
    </header>

    <section class="mb-8">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-neutral-300 text-xs uppercase tracking-wider text-neutral-600">
            <th class="py-2 pr-3 font-medium">${copy.table.description}</th>
            <th class="py-2 pr-3 text-right font-medium">${copy.table.quantity}</th>
            <th class="py-2 pr-3 text-right font-medium">${copy.table.unitPrice}</th>
            <th class="py-2 text-right font-medium">${copy.table.subtotal}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </section>

    <section class="ml-auto max-w-xs">
      <dl class="flex flex-col gap-1.5 text-sm">
        <div class="flex items-center justify-between text-neutral-700">
          <dt>${copy.totals.subtotal}</dt>
          <dd class="tabular-nums">${currencyFormatter.format(Number(quote.subtotal))}</dd>
        </div>
        ${taxHtml}
        <div class="flex items-center justify-between border-t border-neutral-300 pt-2 text-lg font-semibold text-neutral-900">
          <dt>${copy.totals.total}</dt>
          <dd class="tabular-nums">${currencyFormatter.format(Number(quote.total))}</dd>
        </div>
      </dl>
    </section>

    ${notesHtml}
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
  } catch (error) {
    console.error("[PDF API] Error:", error);
    return new NextResponse("Internal server error: " + (error instanceof Error ? error.message : String(error)), { status: 500 });
  }
}
