"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteClientAction } from "../actions";
import { confirmToast } from "@/app/components/ui/toast";

export function DeleteClientButton({
  lang,
  clientId,
  label,
  confirmMessage,
  confirmLabel,
  cancelLabel,
}: {
  lang: string;
  clientId: string;
  label: string;
  confirmMessage: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={deleteClientAction} className="contents">
        <input type="hidden" name="id" value={clientId} />
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
      onClick={() => {
        confirmToast({
          message: confirmMessage,
          confirmLabel,
          cancelLabel,
          tone: "danger",
          onConfirm: () => formRef.current?.requestSubmit(),
        });
      }}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
    >
      {label}
    </button>
  );
}

function DeleteSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? "…" : label}
    </button>
  );
}