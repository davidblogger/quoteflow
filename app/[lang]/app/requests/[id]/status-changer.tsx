"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateStatusAction,
  type UpdateStatusState,
} from "./actions";
import {
  REQUEST_STATUSES,
  type RequestStatus,
} from "@/lib/types/request";
import { AlertCircleIcon } from "@/app/components/icons/Icons";
import { useActionToast } from "@/app/components/ui/toast";

type StatusChangerProps = {
  requestId: string;
  currentStatus: RequestStatus;
  lang: string;
  backHref: string;
  copy: {
    label: string;
    save: string;
    saving: string;
    success: string;
    error: string;
  };
  labels: Record<RequestStatus, string>;
};

const initialState: UpdateStatusState = { ok: false, message: "idle" };

export function StatusChanger({
  requestId,
  currentStatus,
  lang,
  backHref,
  copy,
  labels,
}: StatusChangerProps) {
  const [state, formAction] = useActionState(updateStatusAction, initialState);

  useActionToast(state.message, {
    success: copy.success,
    error: copy.error,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="status"
          className="text-xs font-medium uppercase tracking-wider text-white/55"
        >
          {copy.label}
        </label>
        <div className="relative">
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] focus:border-white/25"
          >
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#0a0e1a] text-white">
                {labels[s]}
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

      <input type="hidden" name="id" value={requestId} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="back" value={backHref} />

      <SubmitButton idleLabel={copy.save} pendingLabel={copy.saving} />
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
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)] disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}