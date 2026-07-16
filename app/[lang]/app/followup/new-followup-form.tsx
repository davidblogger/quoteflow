"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createFollowupAction, type FollowupFormState } from "./actions";
import { PlusIcon, AlertCircleIcon, CheckCircleIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type NewFollowupFormProps = {
  lang: string;
  copy: {
    newTitle: string;
    form: {
      subject: string;
      subjectPlaceholder: string;
      client: string;
      clientPlaceholder: string;
      dueAt: string;
      dueAtOptional: string;
      notes: string;
      notesPlaceholder: string;
    };
    submit: string;
    submitting: string;
    success: string;
    errors: {
      required: string;
      generic: string;
    };
  };
  clients: { id: string; label: string; company: string | null }[];
  defaultClientId?: string;
};

const initialState: FollowupFormState = { ok: false, message: "idle" };

export function NewFollowupForm({
  lang,
  copy,
  clients,
  defaultClientId,
}: NewFollowupFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createFollowupAction, initialState);

  useActionToast(state.message, { error: copy.errors.generic });
  const fe = state.fieldErrors ?? {};

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)]"
      >
        <PlusIcon className="size-4" />
        {copy.newTitle}
      </button>
    );
  }

  if (state.message === "success") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-success/30 bg-success/10 p-5">
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircleIcon className="size-4" />
          {copy.success}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="self-start text-xs text-white/55 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02 p-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subject"
          className="text-xs font-medium uppercase tracking-wider text-white/55"
        >
          {copy.form.subject}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          defaultValue=""
          placeholder={copy.form.subjectPlaceholder}
          aria-invalid={Boolean(fe.subject)}
          aria-describedby={fe.subject ? "subject-error" : undefined}
          className={`h-11 rounded-xl border bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
            fe.subject
              ? "border-danger/50 focus:border-danger"
              : "border-white/10 focus:border-white/25"
          }`}
        />
        {fe.subject && (
          <span
            id="subject-error"
            className="flex items-center gap-1 text-xs text-danger"
          >
            <AlertCircleIcon className="size-3" />
            {copy.errors.required}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="clientId"
            className="text-xs font-medium uppercase tracking-wider text-white/55"
          >
            {copy.form.client}
          </label>
          <div className="relative">
            <select
              id="clientId"
              name="clientId"
              defaultValue={defaultClientId ?? ""}
              className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25"
            >
              <option value="" className="bg-[#0a0e1a] text-white/65">
                {copy.form.clientPlaceholder}
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dueAt"
            className="text-xs font-medium uppercase tracking-wider text-white/55"
          >
            {copy.form.dueAt}{" "}
            <span className="text-white/40 normal-case">
              ({copy.form.dueAtOptional})
            </span>
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notes"
          className="text-xs font-medium uppercase tracking-wider text-white/55"
        >
          {copy.form.notes}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder={copy.form.notesPlaceholder}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25 resize-y"
        />
      </div>

      {state.formError === "generic" && (
        <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircleIcon className="size-4" />
          {copy.errors.generic}
        </p>
      )}

      <input type="hidden" name="lang" value={lang} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-transparent px-5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)] disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}