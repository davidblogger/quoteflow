import type { QuoteStatus } from "@/lib/types/quote";

const TONE: Record<QuoteStatus, { bg: string; text: string; ring: string }> = {
  draft: { bg: "bg-white/10", text: "text-white/65", ring: "ring-white/15" },
  sent: { bg: "bg-cyan-400/15", text: "text-cyan-300", ring: "ring-cyan-300/30" },
  accepted: { bg: "bg-success/15", text: "text-success", ring: "ring-success/30" },
  rejected: { bg: "bg-danger/15", text: "text-danger", ring: "ring-danger/30" },
};

export function QuoteStatusBadge({
  status,
  labels,
}: {
  status: QuoteStatus;
  labels: Record<QuoteStatus, string>;
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