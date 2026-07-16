"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitQuoteRequest,
  type QuoteRequestState,
} from "./actions";
import { Button } from "@/app/components/ui/Button";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type RequestFormProps = {
  copy: {
    fields: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      company: string;
      companyPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      service: string;
      servicePlaceholder: string;
      message: string;
      messagePlaceholder: string;
    };
    services: Record<string, string>;
    submit: string;
    submitting: string;
    privacy: string;
    success: {
      title: string;
      description: string;
      secondary: string;
    };
    errors: { required: string; email: string; generic: string; noProfile: string };
  };
  locale: string;
  homeHref: string;
};

const initialState: QuoteRequestState = { ok: false, message: "invalid" };

export function RequestForm({ copy, locale, homeHref }: RequestFormProps) {
  const [state, formAction] = useActionState(submitQuoteRequest, initialState);

  useActionToast(state.message, {
    success: copy.success.title,
    error: copy.errors.generic,
    formError: state.message === "noProfile" ? "noProfile" : null,
    formErrorCopy: {
      noProfile: copy.errors.noProfile,
    },
  });

  if (state.ok) {
    return <SuccessState copy={copy.success} homeHref={homeHref} />;
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label={copy.fields.name}
          placeholder={copy.fields.namePlaceholder}
          error={fe.name ? copy.errors[fe.name as "required" | "email"] : undefined}
          required
          autoComplete="name"
        />
        <Field
          id="email"
          label={copy.fields.email}
          placeholder={copy.fields.emailPlaceholder}
          type="email"
          inputMode="email"
          error={
            fe.email
              ? copy.errors[fe.email as "required" | "email"]
              : undefined
          }
          required
          autoComplete="email"
        />
        <Field
          id="company"
          label={copy.fields.company}
          placeholder={copy.fields.companyPlaceholder}
          error={
            fe.company
              ? copy.errors[fe.company as "required" | "email"]
              : undefined
          }
          required
          autoComplete="organization"
        />
        <Field
          id="phone"
          label={copy.fields.phone}
          placeholder={copy.fields.phonePlaceholder}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <SelectField
        id="service"
        label={copy.fields.service}
        placeholder={copy.fields.servicePlaceholder}
        options={copy.services}
        error={
          fe.service
            ? copy.errors[fe.service as "required" | "email"]
            : undefined
        }
        required
      />

      <TextareaField
        id="message"
        label={copy.fields.message}
        placeholder={copy.fields.messagePlaceholder}
        error={
          fe.message
            ? copy.errors[fe.message as "required" | "email"]
            : undefined
        }
        required
        rows={5}
      />

      {state.message === "noProfile" && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span>{copy.errors.noProfile}</span>
        </p>
      )}

      {state.message === "error" && (
        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span>{copy.errors.generic}</span>
        </p>
      )}

      <SubmitButton
        idleLabel={copy.submit}
        pendingLabel={copy.submitting}
      />

      <p className="text-center text-xs leading-relaxed text-white/45">
        {copy.privacy}
      </p>

      <input type="hidden" name="locale" value={locale} />
    </form>
  );
}

function SuccessState({
  copy,
  homeHref,
}: {
  copy: RequestFormProps["copy"]["success"];
  homeHref: string;
}) {
  return (
    <div className="glass-strong flex flex-col items-center gap-5 rounded-3xl p-10 text-center sm:p-14">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-success/15 text-success shadow-[0_0_30px_rgba(52,211,153,0.4)]">
        <CheckCircleIcon className="size-9" />
      </span>
      <h3 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
        {copy.title}
      </h3>
      <p className="max-w-md text-pretty text-sm leading-relaxed text-white/65 sm:text-base">
        {copy.description}
      </p>
      <Button href={homeHref} variant="secondary" size="lg">
        {copy.secondary}
      </Button>
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
    <Button
      type="submit"
      size="lg"
      className="w-full sm:w-auto sm:self-start"
      {...{ disabled: pending }}
    >
      {pending ? pendingLabel : idleLabel}
      {!pending && <ArrowRightIcon className="size-4" />}
    </Button>
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
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url" | "search";
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

function SelectField({
  id,
  label,
  placeholder,
  options,
  required,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: Record<string, string>;
  required?: boolean;
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
      <div className="relative">
        <select
          id={id}
          name={id}
          required={required}
          defaultValue=""
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full appearance-none rounded-xl border bg-white/[0.03] px-4 pr-10 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] ${
            error
              ? "border-danger/50 focus:border-danger"
              : "border-white/10 focus:border-white/25"
          }`}
        >
          <option value="" disabled className="bg-[#0a0e1a] text-white/50">
            {placeholder}
          </option>
          {Object.entries(options).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#0a0e1a]">
              {label}
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
  required,
  rows = 4,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  rows?: number;
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
      <textarea
        id={id}
        name={id}
        required={required}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] resize-y ${
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