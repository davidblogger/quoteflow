"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateClientStatusAction } from "../actions";
import type { ClientStatus } from "@/lib/types/client";
import { toast } from "sonner";

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

      <SavedToastOnComplete copy={copy} />
    </form>
  );
}

/**
 * Watches the form's pending state. When the form finishes submitting
 * (pending goes from true to false), fires a success toast and forgets
 * the saved value. The status is reset so subsequent renders don't
 * double-fire.
 */
function SavedToastOnComplete({
  copy,
}: {
  copy: { saved: string };
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      toast.success(copy.saved);
    }
    wasPending.current = pending;
  }, [pending, copy.saved]);

  return null;
}