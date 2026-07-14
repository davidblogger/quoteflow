import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listClients } from "@/lib/queries/clients";
import { getCurrentProfile } from "@/lib/queries/profile";
import { QuoteForm } from "./quote-form";
import { Button } from "@/app/components/ui/Button";
import { ArrowRightIcon, UsersIcon } from "@/app/components/icons/Icons";

export default async function NewQuotePage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/quotes/new`);

  const [clients, profile] = await Promise.all([
    listClients(user.id),
    getCurrentProfile(),
  ]);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.quotes;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <a
          href={`/${lang}/app/quotes`}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {dict.app.shell.nav.quotes}
        </a>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.new.title}
        </h1>
      </header>

      {clients.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <UsersIcon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold text-white">
            {copy.new.noClients.title}
          </h2>
          <p className="max-w-md text-sm text-white/60">
            {copy.new.noClients.description}
          </p>
          <Button
            href={`/${lang}/app/clients/new`}
            variant="secondary"
            size="md"
          >
            {copy.new.noClients.cta}
          </Button>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <QuoteForm
            copy={copy.form}
            lang={lang}
            cancelHref={`/${lang}/app/quotes`}
            clients={clients.map((c) => ({
              id: c.id,
              label: c.name,
              company: c.company,
            }))}
            defaults={{
              currency: profile?.currency ?? "USD",
              taxRate: profile?.tax_rate ?? 0,
            }}
          />
        </div>
      )}
    </div>
  );
}