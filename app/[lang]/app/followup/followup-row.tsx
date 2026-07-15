"use client";

import { FollowupStatusBadge } from "./status-badge";
import {
  completeFollowupAction,
  cancelFollowupAction,
  reopenFollowupAction,
  deleteFollowupAction,
} from "./actions";
import type { Followup, FollowupStatus } from "@/lib/types/followup";

type FollowupRowProps = {
  followup: Followup;
  clientName: string | null;
  lang: string;
  copy: {
    table: {
      subject: string;
      client: string;
      due: string;
      status: string;
    };
    statusBadge: Record<FollowupStatus, string>;
    actions: {
      complete: string;
      cancel: string;
      completeConfirm: string;
      cancelConfirm: string;
      deleteConfirm: string;
    };
  };
  dateFormatter: Intl.DateTimeFormat;
  reopenLabel: string;
  deleteLabel: string;
};

export function FollowupRow({
  followup,
  clientName,
  lang,
  copy,
  dateFormatter,
  reopenLabel,
  deleteLabel,
}: FollowupRowProps) {
  return (
    <tr className="text-white/85">
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-white">{followup.subject}</span>
          {followup.notes && (
            <span className="whitespace-pre-wrap text-xs text-white/55">
              {followup.notes}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 align-top text-sm text-white/75">
        {clientName ?? "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right align-top text-sm text-white/75">
        {followup.due_at ? dateFormatter.format(new Date(followup.due_at)) : "—"}
      </td>
      <td className="px-4 py-3 align-top">
        <FollowupStatusBadge
          status={followup.status}
          labels={copy.statusBadge}
        />
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center justify-end gap-1">
          {followup.status === "pending" && (
            <ActionForm
              action={completeFollowupAction}
              lang={lang}
              clientId={followup.client_id}
              followupId={followup.id}
              label={copy.actions.complete}
              confirm={copy.actions.completeConfirm}
              tone="success"
            />
          )}
          {followup.status === "pending" && (
            <ActionForm
              action={cancelFollowupAction}
              lang={lang}
              clientId={followup.client_id}
              followupId={followup.id}
              label={copy.actions.cancel}
              confirm={copy.actions.cancelConfirm}
              tone="muted"
            />
          )}
          {followup.status !== "pending" && (
            <ActionForm
              action={reopenFollowupAction}
              lang={lang}
              clientId={followup.client_id}
              followupId={followup.id}
              label={reopenLabel}
              confirm={null}
              tone="muted"
            />
          )}
          <ActionForm
            action={deleteFollowupAction}
            lang={lang}
            clientId={followup.client_id}
            followupId={followup.id}
            label={deleteLabel}
            confirm={copy.actions.deleteConfirm}
            tone="danger"
          />
        </div>
      </td>
    </tr>
  );
}

type ActionFormProps = {
  action: (formData: FormData) => Promise<void> | void;
  lang: string;
  clientId: string | null;
  followupId: string;
  label: string;
  confirm: string | null;
  tone: "success" | "muted" | "danger";
};

function ActionForm({
  action,
  lang,
  clientId,
  followupId,
  label,
  confirm,
  tone,
}: ActionFormProps) {
  const buttonClass =
    tone === "success"
      ? "text-emerald-300 hover:bg-emerald-400/10"
      : tone === "danger"
        ? "text-white/35 hover:bg-danger/10 hover:text-danger"
        : "text-white/45 hover:bg-white/5 hover:text-white";

  return (
    <form action={action} className="contents">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="followupId" value={followupId} />
      {clientId && <input type="hidden" name="clientId" value={clientId} />}
      <button
        type="submit"
        onClick={(e) => {
          if (confirm && !window.confirm(confirm)) e.preventDefault();
        }}
        aria-label={label}
        title={label}
        className={`inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[11px] font-medium transition-colors ${buttonClass}`}
      >
        {label}
      </button>
    </form>
  );
}