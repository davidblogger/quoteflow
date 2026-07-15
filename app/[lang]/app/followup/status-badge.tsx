import type { FollowupStatus } from "@/lib/types/followup";
import type { ClientStatus } from "@/lib/types/client";

const FOLLOWUP_TONE: Record<
  FollowupStatus,
  { bg: string; text: string; ring: string; dot: string }
> = {
  pending: {
    bg: "bg-accent-2/15",
    text: "text-accent-2",
    ring: "ring-accent-2/30",
    dot: "bg-accent-2",
  },
  done: {
    bg: "bg-success/15",
    text: "text-success",
    ring: "ring-success/30",
    dot: "bg-success",
  },
  cancelled: {
    bg: "bg-white/10",
    text: "text-white/55",
    ring: "ring-white/15",
    dot: "bg-white/40",
  },
};

export function FollowupStatusBadge({
  status,
  labels,
}: {
  status: FollowupStatus;
  labels: Record<FollowupStatus, string>;
}) {
  const tone = FOLLOWUP_TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone.bg} ${tone.text} ${tone.ring}`}
    >
      <span className={`size-1.5 rounded-full ${tone.dot}`} />
      {labels[status]}
    </span>
  );
}

const CLIENT_TONE: Record<ClientStatus, { bg: string; text: string; ring: string }> = {
  active: {
    bg: "bg-success/15",
    text: "text-success",
    ring: "ring-success/30",
  },
  paused: {
    bg: "bg-amber-400/15",
    text: "text-amber-200",
    ring: "ring-amber-300/30",
  },
  closed: {
    bg: "bg-white/10",
    text: "text-white/55",
    ring: "ring-white/15",
  },
};

export function ClientStatusBadge({
  status,
  labels,
}: {
  status: ClientStatus;
  labels: Record<ClientStatus, string>;
}) {
  const tone = CLIENT_TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone.bg} ${tone.text} ${tone.ring}`}
    >
      <span className={`size-1.5 rounded-full ${CLIENT_TONE[status].bg.replace("/15", "")}`} />
      {labels[status]}
    </span>
  );
}