"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteQuoteItemAction } from "./actions";
import { confirmToast } from "@/app/components/ui/toast";

export function DeleteItemButton({
  lang,
  quoteId,
  itemId,
  label,
  confirmMessage,
  confirmLabel = "Delete",
  cancelLabel = "Keep",
}: {
  lang: string;
  quoteId: string;
  itemId: string;
  label: string;
  confirmMessage: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      <form ref={formRef} action={deleteQuoteItemAction} className="contents">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="quoteId" value={quoteId} />
        <input type="hidden" name="lang" value={lang} />
      </form>
      <DeleteTrigger
        formRef={formRef}
        label={label}
        confirmMessage={confirmMessage}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
      />
    </>
  );
}

function DeleteTrigger({
  formRef,
  label,
  confirmMessage,
  confirmLabel,
  cancelLabel,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  label: string;
  confirmMessage: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        confirmToast({
          message: confirmMessage,
          confirmLabel,
          cancelLabel,
          tone: "danger",
          onConfirm: () => formRef.current?.requestSubmit(),
        });
      }}
      className="inline-flex size-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-danger/10 hover:text-danger"
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

function DeleteSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
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