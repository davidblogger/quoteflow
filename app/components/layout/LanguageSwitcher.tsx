"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { localeLabels, locales, type Locale } from "@/app/[lang]/config";

type LanguageSwitcherProps = {
  current: Locale;
  labels: { label: string; en: string; es: string };
};

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const first = segments[0];
  if ((locales as readonly string[]).includes(first)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export function LanguageSwitcher({
  current,
  labels,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const rest = stripLocale(pathname);

  const handleSelect = (next: Locale) => {
    if (next === current) return;
    startTransition(() => {
      router.push(`/${next}${rest === "/" ? "" : rest}`);
    });
  };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
      role="group"
      aria-label={labels.label}
    >
      {locales.map((loc) => {
        const isActive = loc === current;
        const short = loc === "en" ? labels.en : labels.es;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSelect(loc)}
            disabled={pending}
            aria-current={isActive ? "true" : undefined}
            aria-label={localeLabels[loc]}
            className={`inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-white text-[#060814] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                : "text-white/65 hover:bg-white/[0.06] hover:text-white"
            } ${pending ? "opacity-60" : ""}`}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}