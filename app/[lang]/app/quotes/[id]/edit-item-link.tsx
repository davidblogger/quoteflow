import { ArrowRightIcon } from "@/app/components/icons/Icons";

export function EditItemLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  if (active) {
    return (
      <span
        aria-current="true"
        className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10 text-white"
      >
        <ArrowRightIcon className="size-4 -rotate-90" />
      </span>
    );
  }
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </a>
  );
}