import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getRequestById } from "@/lib/queries/requests";
import { ClientForm } from "../client-form";
import { ArrowRightIcon, InboxIcon } from "@/app/components/icons/Icons";

type SearchParams = Promise<{ from?: string }>;

export default async function NewClientPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await props.params;
  const { from: requestId } = await props.searchParams;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.clients;

  let fromRequest: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    message: string;
  } | null = null;

  if (requestId) {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const req = await getRequestById(user.id, requestId);
      if (req) {
        fromRequest = {
          id: req.id,
          name: req.name,
          company: req.company,
          email: req.email,
          phone: req.phone,
          message: req.message,
        };
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <a
          href={`/${lang}/app/clients`}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {dict.app.shell.nav.clients}
        </a>
      </div>

      {fromRequest && (
        <div className="glass flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/70 ring-1 ring-white/10">
            <InboxIcon className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-white">
              {dict.app.clients.form.fromRequestLabel}
            </span>
            <span className="text-xs text-white/55">
              {fromRequest.name}
              {fromRequest.company ? ` · ${fromRequest.company}` : ""}
            </span>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.form.newTitle}
        </h1>
      </header>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        <ClientForm
          mode="create"
          copy={copy.form}
          lang={lang}
          cancelHref={
            fromRequest
              ? `/${lang}/app/requests/${fromRequest.id}`
              : `/${lang}/app/clients`
          }
          initial={
            fromRequest
              ? {
                  name: fromRequest.name,
                  company: fromRequest.company ?? "",
                  email: fromRequest.email ?? "",
                  phone: fromRequest.phone ?? "",
                  notes: fromRequest.message,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}