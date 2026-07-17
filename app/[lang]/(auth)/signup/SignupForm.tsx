"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type AuthFormState } from "../actions";
import { Button } from "@/app/components/ui/Button";
import { ArrowRightIcon, AlertCircleIcon, CheckCircleIcon, EyeIcon, EyeOffIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type FieldKey = "company" | "email" | "password" | "confirmPassword";
type ErrorKey = "required" | "email" | "passwordTooShort" | "passwordMismatch" | "emailTaken";

type SignupFormProps = {
  copy: SignupCopy;
  lang: string;
  loginHref: string;
  homeHref: string;
  next?: string;
};

type SignupCopy = {
  title: string;
  subtitle: string;
  checkEmailTitle: string;
  checkEmailDescription: string;
  checkEmailLoginCta: string;
  fields: {
    company: string;
    companyPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
  };
  submit: string;
  submitting: string;
  haveAccount: string;
  loginCta: string;
  back: string;
  errors: {
    required: string;
    email: string;
    passwordTooShort: string;
    passwordMismatch: string;
    emailTaken: string;
    generic: string;
  };
};

const initialState: AuthFormState = { ok: false, message: "" };

export function SignupForm({ copy, lang, loginHref, homeHref, next }: SignupFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [confirmPasswordRevealed, setConfirmPasswordRevealed] = useState(false);

  useActionToast(state.message, {
    success: copy.checkEmailTitle,
    error: copy.errors.generic,
    formError: state.formError ?? null,
  });

  if (state.ok && state.message === "checkEmail" && state.checkEmail) {
    return <CheckEmailState email={state.checkEmail} copy={copy} loginHref={loginHref} />;
  }

  const fe = state.fieldErrors ?? {};
  const errFor = (key: FieldKey) => (fe[key] ? copy.errors[fe[key] as ErrorKey] : undefined);

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
        <Field id="company" label={copy.fields.company} placeholder={copy.fields.companyPlaceholder} autoComplete="organization" required error={errFor("company")} />
        <Field id="email" type="email" inputMode="email" label={copy.fields.email} placeholder={copy.fields.emailPlaceholder} autoComplete="email" required error={errFor("email")} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-white/55">
            {copy.fields.password}
            <span className="ml-1 text-accent-2">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={passwordRevealed ? "text" : "password"}
              autoComplete="new-password"
              placeholder={copy.fields.passwordPlaceholder}
              required
              aria-invalid={Boolean(fe.password)}
              aria-describedby={fe.password ? "password-error" : undefined}
              className={`h-11 w-full rounded-xl border bg-white/[0.03] pr-11 pl-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
                fe.password ? "border-danger/50 focus:border-danger" : "border-white/10 focus:border-white/25"
              }`}
            />
            <button
              type="button"
              onClick={() => setPasswordRevealed((v) => !v)}
              aria-label={passwordRevealed ? "Hide password" : "Show password"}
              aria-pressed={passwordRevealed}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {passwordRevealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
          {fe.password && (
            <span id="password-error" className="flex items-center gap-1 text-xs text-danger">
              <AlertCircleIcon className="size-3" />
              {copy.errors[fe.password as ErrorKey]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-white/55">
            {copy.fields.confirmPassword}
            <span className="ml-1 text-accent-2">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={confirmPasswordRevealed ? "text" : "password"}
              autoComplete="new-password"
              placeholder={copy.fields.confirmPasswordPlaceholder}
              required
              aria-invalid={Boolean(fe.confirmPassword)}
              aria-describedby={fe.confirmPassword ? "confirmPassword-error" : undefined}
              className={`h-11 w-full rounded-xl border bg-white/[0.03] pr-11 pl-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
                fe.confirmPassword ? "border-danger/50 focus:border-danger" : "border-white/10 focus:border-white/25"
              }`}
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordRevealed((v) => !v)}
              aria-label={confirmPasswordRevealed ? "Hide password" : "Show password"}
              aria-pressed={confirmPasswordRevealed}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {confirmPasswordRevealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
          {fe.confirmPassword && (
            <span id="confirmPassword-error" className="flex items-center gap-1 text-xs text-danger">
              <AlertCircleIcon className="size-3" />
              {copy.errors[fe.confirmPassword as ErrorKey]}
            </span>
          )}
        </div>

        {state.formError === "generic" && !fe.email && (
          <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircleIcon className="size-4" />
            {copy.errors.generic}
          </p>
        )}

        <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />

        <input type="hidden" name="lang" value={lang} />
        {next && <input type="hidden" name="next" value={next} />}
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-white/60">
        <p>
          {copy.haveAccount}{" "}
          <a href={loginHref} className="font-medium text-accent-2 underline-offset-4 hover:underline">
            {copy.loginCta}
          </a>
        </p>
        <Button href={homeHref} variant="ghost" size="md">
          {copy.back}
        </Button>
      </div>
    </div>
  );
}

function CheckEmailState({
  email,
  copy,
  loginHref,
}: {
  email: string;
  copy: SignupCopy;
  loginHref: string;
}) {
  return (
    <div className="glass-strong flex flex-col items-center gap-5 rounded-3xl p-10 text-center sm:p-14">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-success/15 text-success shadow-[0_0_30px_rgba(52,211,153,0.4)]">
        <CheckCircleIcon className="size-9" />
      </span>
      <h1 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
        {copy.checkEmailTitle}
      </h1>
      <p className="max-w-md text-pretty text-sm leading-relaxed text-white/65 sm:text-base">
        {copy.checkEmailDescription.replace("{email}", email)}
      </p>
      <Button href={loginHref} variant="secondary" size="lg">
        {copy.checkEmailLoginCta}
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
    <Button type="submit" size="lg" className="mt-2 w-full" {...{ disabled: pending }}>
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
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-white/55">
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
          error ? "border-danger/50 focus:border-danger" : "border-white/10 focus:border-white/25"
        }`}
      />
      {error && (
        <span id={`${id}-error`} className="flex items-center gap-1 text-xs text-danger">
          <AlertCircleIcon className="size-3" />
          {error}
        </span>
      )}
    </div>
  );
}