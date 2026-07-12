import type { ReactNode } from "react";

type IconBadgeProps = {
  children: ReactNode;
  tone?: "accent" | "cyan" | "violet" | "amber";
  className?: string;
};

const toneStyles: Record<NonNullable<IconBadgeProps["tone"]>, string> = {
  accent: "from-[#7c8cff]/30 to-[#7c8cff]/0 text-[#c7d2fe] ring-[#7c8cff]/30",
  cyan: "from-[#22d3ee]/30 to-[#22d3ee]/0 text-[#a5f3fc] ring-[#22d3ee]/30",
  violet: "from-[#a78bfa]/30 to-[#a78bfa]/0 text-[#ddd6fe] ring-[#a78bfa]/30",
  amber: "from-[#fbbf24]/30 to-[#fbbf24]/0 text-[#fde68a] ring-[#fbbf24]/30",
};

export function IconBadge({
  children,
  tone = "accent",
  className = "",
}: IconBadgeProps) {
  return (
    <div
      className={`relative inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 backdrop-blur-md ${toneStyles[tone]} ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-white/[0.03]" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}