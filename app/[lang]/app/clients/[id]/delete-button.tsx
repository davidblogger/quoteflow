"use client";

import { useFormStatus } from "react-dom";
import { deleteClientAction } from "../actions";

export function DeleteClientButton({
  lang,
  clientId,
  label,
  confirmMessage,
}: {
  lang: string;
  clientId: string;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form action={deleteClientAction} className="contents">
      <input type="hidden" name="id" value={clientId} />
      <input type="hidden" name="lang" value={lang} />
      <DeleteSubmitButton label={label} confirmMessage={confirmMessage} />
    </form>
  );
}

function DeleteSubmitButton({
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
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? "…" : label}
    </button>
  );
}