import type { RequestStatus } from "@/lib/queries/requests";

const TONE: Record<RequestStatus, { bg: string; text: string; ring: string }> = {
  new: { bg: "bg-accent-2/15", text: "text-accent-2", ring: "ring-accent-2/30" },
  contacted: { bg: "bg-cyan-400/15", text: "text-cyan-300", ring: "ring-cyan-300/30" },
  qualified: { bg: "bg-violet-400/15", text: "text-violet-300", ring: "ring-violet-300/30" },
  converted: { bg: "bg-success/15", text: "text-success", ring: "ring-success/30" },
  closed: { bg: "bg-white/10", text: "text-white/55", ring: "ring-white/10" },
};

export function RequestStatusBadge({
  status,
  labels,
}: {
  status: RequestStatus;
  labels: Record<RequestStatus, string>;
}) {
  const tone = TONE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone.bg} ${tone.text} ${tone.ring}`}
    >
      {labels[status]}
    </span>
  );
}