"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateProfileAction,
  type SettingsFormState,
} from "./actions";
import type { Profile } from "@/lib/supabase/types";
import { AlertCircleIcon, CheckCircleIcon, SettingsIcon } from "@/app/components/icons/Icons";

type SettingsFormProps = {
  profile: Profile;
  lang: string;
  copy: {
    sections: { company: string; defaults: string };
    fields: {
      companyName: string;
      companyNamePlaceholder: string;
      email: string;
      emailHint: string;
      phone: string;
      phonePlaceholder: string;
      address: string;
      addressPlaceholder: string;
      currency: string;
      taxRate: string;
    };
    submit: string;
    submitting: string;
    saveSuccess: string;
    errors: {
      required: string;
      invalidTaxRate: string;
      generic: string;
    };
  };
};

const CURRENCIES = [
  "USD", "EUR", "MXN", "COP", "ARS", "BRL", "CLP", "GBP",
] as const;

const initialState: SettingsFormState = { ok: false, message: "idle" };

export function SettingsForm({ profile, lang, copy }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="lang" value={lang} />

      <section className="glass rounded-2xl p-6 sm:p-8">
        <header className="mb-5 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <SettingsIcon className="size-5" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">
            {copy.sections.company}
          </h2>
        </header>

        <div className="flex flex-col gap-4">
          <Field
            id="companyName"
            label={copy.fields.companyName}
            placeholder={copy.fields.companyNamePlaceholder}
            defaultValue={profile.company_name}
            required
            error={fe.companyName ? copy.errors.required : undefined}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-white/55"
            >
              {copy.fields.email}
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              disabled
              aria-readonly
              className="h-11 rounded-xl border border-white/10 bg-white/[0.02 px-4 text-sm text-white/60"
            />
            <p className="text-xs text-white/45">{copy.fields.emailHint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="phone"
              label={copy.fields.phone}
              placeholder={copy.fields.phonePlaceholder}
              defaultValue={profile.phone ?? ""}
              type="tel"
            />
            <Field
              id="address"
              label={copy.fields.address}
              placeholder={copy.fields.addressPlaceholder}
              defaultValue={profile.address ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">
            {copy.sections.defaults}
          </h2>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="currency"
              className="text-xs font-medium uppercase tracking-wider text-white/55"
            >
              {copy.fields.currency}
            </label>
            <div className="relative">
              <select
                id="currency"
                name="currency"
                defaultValue={profile.currency}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-sm uppercase text-white transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0a0e1a] text-white">
                    {c}
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
          </div>

          <Field
            id="taxRate"
            label={copy.fields.taxRate}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            defaultValue={String(Number(profile.tax_rate))}
            error={fe.taxRate ? copy.errors.invalidTaxRate : undefined}
          />
        </div>
      </section>

      {state.message === "error" && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircleIcon className="size-4" />
          {copy.errors.generic}
        </p>
      )}
      {state.message === "success" && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CheckCircleIcon className="size-4" />
          {copy.saveSuccess}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />
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