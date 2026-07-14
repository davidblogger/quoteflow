"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateQuoteAction, type EditQuoteFormState } from "./actions";
import type { Quote } from "@/lib/types/quote";
import { AlertCircleIcon } from "@/app/components/icons/Icons";

type EditQuoteFormProps = {
  quote: Quote;
  clientName: string;
  lang: string;
  cancelHref: string;
  copy: {
    title: string;
    hint: string;
    fields: {
      title: string;
      currency: string;
      taxRate: string;
      validUntil: string;
      notes: string;
      notesPlaceholder: string;
    };
    saveChanges: string;
    saving: string;
    cancel: string;
    errors: {
      required: string;
      invalidNumber: string;
      generic: string;
    };
  };
};

const initialState: EditQuoteFormState = { ok: false, message: "idle" };

export function EditQuoteForm({
  quote,
  clientName,
  lang,
  cancelHref,
  copy,
}: EditQuoteFormProps) {
  const [state, formAction] = useActionState(updateQuoteAction, initialState);
  const fe = state.fieldErrors ?? {};

  const validUntilValue = quote.valid_until
    ? quote.valid_until.slice(0, 10)
    : "";

  return (
    <form
      action={formAction}
      className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02 p-5 sm:p-6"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">
          {copy.title}
        </h2>
        <span className="text-xs text-white/50">{copy.hint}</span>
      </div>

      <Field
        id="title"
        label={copy.fields.title}
        defaultValue={quote.title}
        required
        error={fe.title ? copy.errors.required : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="currency"
          label={copy.fields.currency}
          defaultValue={quote.currency}
        />
        <Field
          id="taxRate"
          label={copy.fields.taxRate}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          max="100"
          defaultValue={String(Number(quote.tax_rate))}
          error={fe.taxRate ? copy.errors.invalidNumber : undefined}
        />
        <Field
          id="validUntil"
          label={copy.fields.validUntil}
          type="date"
          defaultValue={validUntilValue}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notes"
          className="text-xs font-medium uppercase tracking-wider text-white/55"
        >
          {copy.fields.notes}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder={copy.fields.notesPlaceholder}
          defaultValue={quote.notes ?? ""}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25 resize-y"
        />
      </div>

      {state.message === "error" && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircleIcon className="size-4" />
          {copy.errors.generic}
        </p>
      )}

      <p className="text-xs text-white/45">
        {clientName}
      </p>

      <input type="hidden" name="quoteId" value={quote.id} />
      <input type="hidden" name="lang" value={lang} />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton idleLabel={copy.saveChanges} pendingLabel={copy.saving} />
        <a
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-white/65 transition-colors hover:text-white"
        >
          {copy.cancel}
        </a>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  required,
  inputMode,
  defaultValue,
  error,
  ...rest
}: {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url" | "search" | "decimal";
  defaultValue?: string;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "defaultValue">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-white/55"
      >
        {label}
        {required && <span className="ml-1 text-accent-2">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
        className={`h-11 rounded-xl border bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
          error
            ? "border-danger/50 focus:border-danger"
            : "border-white/10 focus:border-white/25"
        }`}
      />
      {error && (
        <span
          id={`${id}-error`}
          className="flex items-center gap-1 text-xs text-danger"
        >
          <AlertCircleIcon className="size-3" />
          {error}
        </span>
      )}
    </div>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-accent px-6 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)] disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}