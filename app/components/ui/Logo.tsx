import type { Locale } from "@/app/[lang]/config";

type LogoProps = {
  lang: Locale;
  className?: string;
  showWordmark?: boolean;
};

export function Logo({
  lang,
  className = "",
  showWordmark = true,
}: LogoProps) {
  return (
    <a
      href={`/${lang}`}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="QuoteFlow inicio"
    >
      <span className="relative inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-colors group-hover:border-white/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-5"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="qf-logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c8cff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M5 5h10a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h11"
            stroke="url(#qf-logo-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-white">
          QuoteFlow
        </span>
      )}
    </a>
  );
}