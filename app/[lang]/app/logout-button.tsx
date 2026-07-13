"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "../(auth)/actions";

export function LogoutButton({ lang, label }: { lang: string; label: string }) {
  return (
    <form action={signOutAction.bind(null, lang)}>
      <SubmitButton label={label} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? "…" : label}
    </button>
  );
}