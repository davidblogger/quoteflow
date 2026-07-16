import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getClientById } from "@/lib/queries/clients";
import { ClientForm } from "../client-form";
import { DeleteClientButton } from "./delete-button";
import { ClientStatusSelector } from "./status-selector";
import { ArrowRightIcon, FileTextIcon, UsersIcon } from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string; id: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.clients.metaTitle };
}

export default async function ClientDetailPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/clients/${id}`);

  const client = await getClientById(user.id, id);
  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.clients;
  const listHref = `/${lang}/app/clients`;

  if (!client) {
    return <NotFoundState listHref={listHref} copy={copy.detail.notFound} />;
  }

  const createdAt = new Date(client.created_at).toLocaleString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const updatedAt = new Date(client.updated_at).toLocaleString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <a
          href={listHref}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {copy.detail.backCta}
        </a>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <UsersIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {client.name}
            </h1>
            {client.company && (
              <p className="text-sm text-white/55">{client.company}</p>
            )}
          </div>
        </div>
        <ClientStatusSelector
          lang={lang}
          clientId={client.id}
          currentStatus={client.status}
          copy={copy.detail.status}
        />
      </header>

      <a
        href={`/${lang}/app/quotes/new?client=${client.id}`}
        className="flex flex-col gap-2 rounded-2xl border border-accent-2/20 bg-accent-2/[0.04] px-4 py-3.5 transition-colors hover:border-accent-2/40 hover:bg-accent-2/[0.08] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-2/15 text-accent-2">
            <FileTextIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-white">
              {copy.detail.createQuote.title}
            </h2>
            <p className="text-sm text-white/65">
              {copy.detail.createQuote.description}
            </p>
          </div>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)] sm:self-auto">
          {copy.detail.createQuote.cta}
          <ArrowRightIcon className="size-4" />
        </span>
      </a>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.form.editTitle}
          </h2>
          <ClientForm
            mode="edit"
            copy={copy.form}
            lang={lang}
            cancelHref={listHref}
            clientId={client.id}
            initial={{
              name: client.name,
              company: client.company ?? "",
              email: client.email ?? "",
              phone: client.phone ?? "",
              address: client.address ?? "",
              notes: client.notes ?? "",
            }}
          />
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.detail.sections.meta}
          </h2>
          <dl className="flex flex-col gap-3 text-xs">
            <div>
              <dt className="text-white/45">{copy.detail.fields.createdAt}</dt>
              <dd className="mt-0.5 text-white/85">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.detail.fields.updatedAt}</dt>
              <dd className="mt-0.5 text-white/85">{updatedAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.detail.fields.id}</dt>
              <dd className="mt-0.5 break-all font-mono text-[11px] text-white/60">
                {client.id}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-white/5 pt-5">
            <DeleteClientButton
              lang={lang}
              clientId={client.id}
              label={copy.detail.deleteCta}
              confirmMessage={copy.detail.deleteConfirm}
              confirmLabel={copy.detail.deleteCta}
              cancelLabel="Cancel"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function NotFoundState({
  listHref,
  copy,
}: {
  listHref: string;
  copy: { title: string; description: string; backCta: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-white">{copy.title}</h1>
      <p className="text-sm text-white/60">{copy.description}</p>
      <a
        href={listHref}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {copy.backCta}
      </a>
    </div>
  );
}