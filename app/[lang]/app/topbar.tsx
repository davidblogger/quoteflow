import type { Locale } from "../config";
import { signOutAction } from "../(auth)/actions";
import { SearchIcon, BellIcon } from "@/app/components/icons/Icons";

type TopbarProps = {
  lang: Locale;
  email: string;
  copy: {
    search: string;
    signOut: string;
  };
};

export function Topbar({ lang, email, copy }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-[#060814]/60 px-4 backdrop-blur-xl print:hidden sm:gap-4 sm:px-6">
      <label className="relative flex h-10 flex-1 items-center">
        <span className="pointer-events-none absolute left-3.5 flex items-center text-white/40">
          <SearchIcon className="size-4" />
        </span>
        <input
          type="search"
          placeholder={copy.search}
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:outline-none focus:bg-white/[0.06] focus:border-white/20"
        />
      </label>

      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <BellIcon className="size-4" />
      </button>

      <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-4">
        <div className="hidden flex-col text-right sm:flex">
          <span className="text-xs font-medium text-white">{email}</span>
        </div>
        <form action={signOutAction.bind(null, lang)}>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04 px-4 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            {copy.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}