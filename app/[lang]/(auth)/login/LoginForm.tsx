"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  signInAction,
  type AuthFormState,
} from "../actions";
import { Button } from "@/app/components/ui/Button";
import { ArrowRightIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type LoginFormProps = {
  copy: {
    title: string;
    subtitle: string;
    fields: {
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
    };
    submit: string;
    submitting: string;
    noAccount: string;
    signupCta: string;
    back: string;
    errors: {
      required: string;
      email: string;
      invalidCredentials: string;
      generic: string;
    };
  };
  lang: string;
  signupHref: string;
  homeHref: string;
  next?: string;
};

const initialState: AuthFormState = { ok: false, message: "" };

export function LoginForm({
  copy,
  lang,
  signupHref,
  homeHref,
  next,
}: LoginFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const fe = state.fieldErrors ?? {};

  useActionToast(state.message, {
    success: copy.title,
    error: copy.errors.generic,
    formError: state.formError ?? null,
    formErrorCopy: {
      invalidCredentials: copy.errors.invalidCredentials,
    },
  });

  return (
    <div className="glass-strong rounded-3xl p-7 sm:p-9">
      <header className="mb-7 flex flex-col gap-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-white/65">
          {copy.subtitle}
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <Field
          id="email"
          type="email"
          inputMode="email"
          label={copy.fields.email}
          placeholder={copy.fields.emailPlaceholder}
          autoComplete="email"
          required
          error={
            fe.email
              ? copy.errors[fe.email as "required" | "email"]
              : undefined
          }
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider text-white/55"
          >
            {copy.fields.password}
            <span className="ml-1 text-accent-2">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={passwordRevealed ? "text" : "password"}
              autoComplete="current-password"
              placeholder={copy.fields.passwordPlaceholder}
              required
              aria-invalid={Boolean(fe.password)}
              aria-describedby={fe.password ? "password-error" : undefined}
              className={`h-11 w-full rounded-xl border bg-white/[0.03] pr-11 pl-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
                fe.password
                  ? "border-danger/50 focus:border-danger"
                  : "border-white/10 focus:border-white/25"
              }`}
            />
            <button
              type="button"
              onClick={() => setPasswordRevealed((v) => !v)}
              aria-label={passwordRevealed ? "Hide password" : "Show password"}
              aria-pressed={passwordRevealed}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {passwordRevealed ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {fe.password && (
            <span id="password-error" className="flex items-center gap-1 text-xs text-danger">
              <AlertCircleIcon className="size-3" />
              {copy.errors.required}
            </span>
          )}
        </div>

        {state.formError === "invalidCredentials" && (
          <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircleIcon className="size-4" />
            {copy.errors.invalidCredentials}
          </p>
        )}

        <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />

        <input type="hidden" name="lang" value={lang} />
        {next && <input type="hidden" name="next" value={next} />}
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-white/60">
        <p>
          {copy.noAccount}{" "}
          <a
            href={signupHref}
            className="font-medium text-accent-2 underline-offset-4 hover:underline"
          >
            {copy.signupCta}
          </a>
        </p>
        <Button href={homeHref} variant="ghost" size="md">
          {copy.back}
        </Button>
      </div>
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
      className="mt-2 w-full"
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