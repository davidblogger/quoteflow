"use client";

import { useFormStatus } from "react-dom";
import { updateClientStatusAction } from "../actions";
import type { ClientStatus } from "@/lib/types/client";
import { CheckCircleIcon } from "@/app/components/icons/Icons";

type ClientStatusSelectorProps = {
  lang: string;
  clientId: string;
  currentStatus: ClientStatus;
  copy: {
    label: string;
    active: string;
    paused: string;
    closed: string;
    saved: string;
  };
};

const STATUSES: ClientStatus[] = ["active", "paused", "closed"];

export function ClientStatusSelector({
  lang,
  clientId,
  currentStatus,
  copy,
}: ClientStatusSelectorProps) {
  return (
    <form
      action={updateClientStatusAction}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="id" value={clientId} />
      <input type="hidden" name="lang" value={lang} />

      <label
        htmlFor="client-status"
        className="text-[10px] font-semibold uppercase tracking-wider text-white/45"
      >
        {copy.label}
      </label>

      <div className="relative">
        <select
          id="client-status"
          name="status"
          defaultValue={currentStatus}
          className="h-9 appearance-none rounded-full border border-white/10 bg-white/[0.04 pl-3 pr-8 text-xs font-medium text-white transition-colors hover:border-white/20 focus:outline-none focus:border-white/30"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#0a0e1a] text-white">
              {copy[s]}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-white/40"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <AutoSubmitHint copy={copy} />
    </form>
  );
}

/**
 * Small UX nicety: a tiny "Saved." line that appears while the form is
 * pending (Server Action is in-flight). No toast, no alert — just a
 * short confirmation that the change went through.
 */
function AutoSubmitHint({ copy }: { copy: { saved: string } }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <p
      role="status"
      className="flex items-center gap-1 text-[11px] text-success"
    >
      <CheckCircleIcon className="size-3" />
      {copy.saved}
    </p>
  );
}