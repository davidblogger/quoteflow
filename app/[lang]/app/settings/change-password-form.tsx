"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction, type PasswordFormState } from "./actions";
import { AlertCircleIcon, CheckCircleIcon } from "@/app/components/icons/Icons";

type ChangePasswordFormProps = {
  lang: string;
  copy: {
    title: string;
    description: string;
    fields: {
      current: string;
      currentPlaceholder: string;
      next: string;
      nextPlaceholder: string;
      confirm: string;
      confirmPlaceholder: string;
    };
    submit: string;
    submitting: string;
    success: string;
    errors: {
      required: string;
      tooShort: string;
      mismatch: string;
      currentIncorrect: string;
      generic: string;
    };
  };
};

const initialState: PasswordFormState = { ok: false, message: "idle" };

export function ChangePasswordForm({ lang, copy }: ChangePasswordFormProps) {
  const [state, formAction] = useActionState(changePasswordAction, initialState);
  const fe = state.fieldErrors ?? {};

  if (state.message === "success") {
    return (
      <section className="glass rounded-2xl p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">
            {copy.title}
          </h2>
        </header>
        <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircleIcon className="size-4" />
          {copy.success}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-medium text-white transition-colors hover:bg-white/10"
        >
          {copy.submit}
        </button>
      </section>
    );
  }

  return (
    <section className="glass rounded-2xl p-6 sm:p-8">
      <header className="mb-5 flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">
          {copy.title}
        </h2>
        <p className="text-sm text-white/55">{copy.description}</p>
      </header>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <Field
          id="current"
          type="password"
          label={copy.fields.current}
          placeholder={copy.fields.currentPlaceholder}
          autoComplete="current-password"
          error={fe.current ? copy.errors.required : undefined}
        />
        <Field
          id="next"
          type="password"
          label={copy.fields.next}
          placeholder={copy.fields.nextPlaceholder}
          autoComplete="new-password"
          error={
            fe.next
              ? copy.errors[fe.next as "required" | "tooShort" | "mismatch"]
              : undefined
          }
        />
        <Field
          id="confirm"
          type="password"
          label={copy.fields.confirm}
          placeholder={copy.fields.confirmPlaceholder}
          autoComplete="new-password"
          error={
            fe.confirm
              ? copy.errors[fe.confirm as "required" | "tooShort" | "mismatch"]
              : undefined
          }
        />

        {state.formError === "currentIncorrect" && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            <AlertCircleIcon className="size-4 shrink-0" />
            {copy.errors.currentIncorrect}
          </p>
        )}
        {state.formError === "generic" && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            <AlertCircleIcon className="size-4 shrink-0" />
            {copy.errors.generic}
          </p>
        )}

        <input type="hidden" name="lang" value={lang} />

        <div className="flex justify-end pt-1">
          <SubmitButton
            idleLabel={copy.submit}
            pendingLabel={copy.submitting}
          />
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-white/55"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
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