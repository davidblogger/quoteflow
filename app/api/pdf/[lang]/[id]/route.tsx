import React from "react";
import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { hasLocale, getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/app/[lang]/config";
import { getQuoteByIdUnfiltered } from "@/lib/queries/quotes";
import { getClientByIdUnfiltered } from "@/lib/queries/clients";
import { listItemsUnfiltered } from "@/lib/queries/quote-items";
import { getProfileAdmin } from "@/lib/queries/profile";
import { QuotePdfDocument } from "@/lib/pdf/quote-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ lang: string; id: string }> }
) {
  try {
    const { lang, id } = await props.params;

    if (!hasLocale(lang)) {
      return new NextResponse("Invalid locale", { status: 400 });
    }

    const quote = await getQuoteByIdUnfiltered(id);
    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    const [profile, items, client] = await Promise.all([
      getProfileAdmin(),
      listItemsUnfiltered(id),
      quote.client_id ? getClientByIdUnfiltered(quote.client_id) : null,
    ]);

    const dict = await getDictionary(lang as Locale);
    const copy = dict.app.quotes.detail.pdf;

    const currencyFormatter = new Intl.NumberFormat(lang, {
      style: "currency",
      currency: quote.currency,
    });

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

    const pdfStream = await renderToStream(
      <QuotePdfDocument
        quote={quote}
        client={client}
        profile={profile}
        items={items}
        copy={copy}
        currencyFormatter={currencyFormatter}
        issuedAt={issuedAt}
        validUntil={validUntil}
      />
    );

    const filename = `${quote.title.replace(/[^a-zA-Z0-9]/g, "-")}-${id.slice(0, 8)}.pdf`;

    return new NextResponse(pdfStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[PDF API] Error:", error);
    return new NextResponse(
      "Internal server error: " + (error instanceof Error ? error.message : String(error)),
      { status: 500 }
    );
  }
}
