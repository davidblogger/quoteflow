import type { RequestStatus } from "@/lib/types/request";
import { LightbulbIcon } from "@/app/components/icons/Icons";


type TipCopy = {
  title: string;
  body: string;
  footer: string | null;
};

type WorkflowTipProps = {
  status: RequestStatus;
  copy: {
    new: TipCopy;
    contacted: TipCopy;
    qualified: TipCopy;
    converted: TipCopy;
  };
};

export function WorkflowTip({ status, copy }: WorkflowTipProps) {
  if (status === "closed") return null;
  const tip = copy[status as keyof typeof copy];

  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white">
        <LightbulbIcon className="size-4" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-neutral-900 dark:text-white">{tip.title}</p>
        <RichText text={tip.body} />
        {tip.footer && (
          <p className="text-xs text-neutral-500 dark:text-white/55">{tip.footer}</p>
        )}
      </div>
    </aside>
  );
}

function RichText({ text }: { text: string }) {
  const segments = text.split(/\*\*(.+?)\*\*/g);
  return (
    <p className="text-pretty leading-relaxed text-neutral-600 dark:text-white/70">
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-medium text-neutral-900 dark:text-white">
            {segment}
          </strong>
        ) : (
          <span key={i}>{segment}</span>
        ),
      )}
    </p>
  );
}