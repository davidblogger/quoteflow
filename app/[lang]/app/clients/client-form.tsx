"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createClientAction,
  updateClientAction,
  type ClientFormState,
} from "./actions";
import type { ClientInsert } from "@/lib/types/client";
import { Button } from "@/app/components/ui/Button";
import { AlertCircleIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type ClientFormProps = {
  mode: "create" | "edit";
  copy: {
    fields: {
      name: string;
      namePlaceholder: string;
      company: string;
      companyPlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      address: string;
      addressPlaceholder: string;
      notes: string;
      notesPlaceholder: string;
    };
    submitNew: string;
    submitEdit: string;
    submitting: string;
    cancel: string;
    successCreate: string;
    successUpdate: string;
    errors: { required: string; email: string; generic: string };
  };
  lang: string;
  cancelHref: string;
  initial?: Partial<ClientInsert>;
  clientId?: string;
};

const initialState: ClientFormState = { ok: false, message: "idle" };

export function ClientForm({
  mode,
  copy,
  lang,
  cancelHref,
  initial,
  clientId,
}: ClientFormProps) {
  const action = mode === "create" ? createClientAction : updateClientAction;
  const [state, formAction] = useActionState(action, initialState);

  useActionToast(state.message, {
    success:
      mode === "create" ? copy.successCreate : copy.successUpdate,
    error: copy.errors.generic,
  });

  const fe = state.fieldErrors ?? {};
  const showSuccess =
    (mode === "create" && state.message === "successCreate") ||
    (mode === "edit" && state.message === "successUpdate");

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label={copy.fields.name}
          placeholder={copy.fields.namePlaceholder}
          defaultValue={initial?.name ?? ""}
          autoComplete="name"
          required
          error={fe.name ? copy.errors[fe.name as "required" | "email"] : undefined}
        />
        <Field
          id="company"
          label={copy.fields.company}
          placeholder={copy.fields.companyPlaceholder}
          defaultValue={initial?.company ?? ""}
          autoComplete="organization"
        />
        <Field
          id="email"
          type="email"
          inputMode="email"
          label={copy.fields.email}
          placeholder={copy.fields.emailPlaceholder}
          defaultValue={initial?.email ?? ""}
          autoComplete="email"
          error={fe.email ? copy.errors[fe.email as "required" | "email"] : undefined}
        />
        <Field
          id="phone"
          type="tel"
          inputMode="tel"
          label={copy.fields.phone}
          placeholder={copy.fields.phonePlaceholder}
          defaultValue={initial?.phone ?? ""}
          autoComplete="tel"
        />
      </div>

      <Field
        id="address"
        label={copy.fields.address}
        placeholder={copy.fields.addressPlaceholder}
        defaultValue={initial?.address ?? ""}
        autoComplete="street-address"
      />

      <TextareaField
        id="notes"
        label={copy.fields.notes}
        placeholder={copy.fields.notesPlaceholder}
        defaultValue={initial?.notes ?? ""}
        rows={4}
      />

      {state.message === "error" && (
        <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircleIcon className="size-4" />
          {copy.errors.generic}
        </p>
      )}

      {showSuccess && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {mode === "create" ? copy.successCreate : copy.successUpdate}
        </p>
      )}

      <input type="hidden" name="lang" value={lang} />
      {clientId && <input type="hidden" name="id" value={clientId} />}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          idleLabel={mode === "create" ? copy.submitNew : copy.submitEdit}
          pendingLabel={copy.submitting}
        />
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
  autoComplete,
  inputMode,
  defaultValue,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url" | "search";
  defaultValue?: string;
  error?: string;
}) {
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
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
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