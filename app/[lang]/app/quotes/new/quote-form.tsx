"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createQuoteAction,
  type QuoteFormState,
} from "../actions";
import { AlertCircleIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

export type QuoteFormClient = {
  id: string;
  label: string;
  company: string | null;
};

type QuoteFormProps = {
  copy: {
    fields: {
      client: string;
      title: string;
      titlePlaceholder: string;
      currency: string;
      taxRate: string;
      validUntil: string;
      notes: string;
      notesPlaceholder: string;
    };
    selectClient: string;
    submit: string;
    submitting: string;
    cancel: string;
    errors: { required: string; clientRequired: string; generic: string };
  };
  lang: string;
  cancelHref: string;
  clients: QuoteFormClient[];
  initialClientId?: string;
  defaults?: {
    currency?: string;
    taxRate?: number;
  };
};

const initialState: QuoteFormState = { ok: false, message: "idle" };

export function QuoteForm({
  copy,
  lang,
  cancelHref,
  clients,
  initialClientId,
  defaults,
}: QuoteFormProps) {
  const [state, formAction] = useActionState(createQuoteAction, initialState);
  const fe = state.fieldErrors ?? {};

  useActionToast(state.message, {
    error: copy.errors.generic,
  });

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="clientId"
          className="text-xs font-medium uppercase tracking-wider text-white/55"
        >
          {copy.fields.client}
          <span className="ml-1 text-accent-2">*</span>
        </label>
        <div className="relative">
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={initialClientId ?? ""}
            aria-invalid={Boolean(fe.client)}
            aria-describedby={fe.client ? "clientId-error" : undefined}
            className={`h-11 w-full appearance-none rounded-xl border bg-white/[0.03] px-4 pr-10 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] ${
              fe.client
                ? "border-danger/50 focus:border-danger"
                : "border-white/10 focus:border-white/25"
            }`}
          >
            <option value="" disabled className="bg-[#0a0e1a] text-white/50">
              {copy.selectClient}
            </option>
            {clients.map((c) => (
              <option
                key={c.id}
                value={c.id}
                className="bg-[#0a0e1a] text-white"
              >
                {c.label}
                {c.company ? ` · ${c.company}` : ""}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {fe.client && (
          <span
            id="clientId-error"
            className="flex items-center gap-1 text-xs text-danger"
          >
            <AlertCircleIcon className="size-3" />
            {copy.errors.clientRequired}
          </span>
        )}
      </div>

      <Field
        id="title"
        label={copy.fields.title}
        placeholder={copy.fields.titlePlaceholder}
        required
        error={fe.title ? copy.errors.required : undefined}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          id="currency"
          label={copy.fields.currency}
          defaultValue={defaults?.currency ?? "USD"}
        />
        <Field
          id="taxRate"
          label={copy.fields.taxRate}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          max="100"
          defaultValue={defaults?.taxRate?.toString() ?? "0"}
        />
        <Field
          id="validUntil"
          label={copy.fields.validUntil}
          type="date"
        />
      </div>

      <TextareaField
        id="notes"
        label={copy.fields.notes}
        placeholder={copy.fields.notesPlaceholder}
        rows={4}
      />

      {state.message === "error" && (
        <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircleIcon className="size-4" />
          {copy.errors.generic}
        </p>
      )}

      <input type="hidden" name="lang" value={lang} />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />
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

function TextareaField({
  id,
  label,
  placeholder,
  defaultValue,
  rows = 4,
}: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-white/55"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25 resize-y"
      />
    </div>
  );
}