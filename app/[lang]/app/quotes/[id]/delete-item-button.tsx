"use client";

import { useFormStatus } from "react-dom";
import { deleteQuoteItemAction } from "./actions";

export function DeleteItemButton({
  lang,
  quoteId,
  itemId,
  label,
  confirmMessage,
}: {
  lang: string;
  quoteId: string;
  itemId: string;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form action={deleteQuoteItemAction} className="contents">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <input type="hidden" name="lang" value={lang} />
      <DeleteSubmit label={label} confirmMessage={confirmMessage} />
    </form>
  );
}

function DeleteSubmit({
  label,
  confirmMessage,
}: {
  label: string;
  confirmMessage: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:pointer-events-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}