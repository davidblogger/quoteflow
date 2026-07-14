import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getRequestById } from "@/lib/queries/requests";
import { RequestStatusBadge } from "../status-badge";
import { StatusChanger } from "./status-changer";
import {
  ArrowRightIcon,
  InboxIcon,
  UsersIcon,
} from "@/app/components/icons/Icons";

export async function generateMetadata(
  props: { params: Promise<{ lang: string; id: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.app.requests.detail.metaTitle };
}

export default async function RequestDetailPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login?next=/${lang}/app/requests/${id}`);

  const request = await getRequestById(user.id, id);
  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.requests.detail;
  const listHref = `/${lang}/app/requests`;

  if (!request) {
    return <NotFoundState listHref={listHref} copy={copy.notFound} />;
  }

  const createdAt = new Date(request.created_at).toLocaleString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const updatedAt = new Date(request.updated_at).toLocaleString(lang, {
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
          {copy.backCta}
        </a>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/70 ring-1 ring-white/10">
            <InboxIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {request.name}
            </h1>
            <p className="text-sm text-white/55">{request.email}</p>
          </div>
        </div>
        <RequestStatusBadge
          status={request.status}
          labels={dict.app.requests.statusBadge}
        />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.sections.contact}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailRow label={copy.fields.name} value={request.name} />
            <DetailRow label={copy.fields.email} value={request.email} href={`mailto:${request.email}`} />
            <DetailRow label={copy.fields.company} value={request.company} empty={copy.empty} />
            <DetailRow label={copy.fields.phone} value={request.phone} href={request.phone ? `tel:${request.phone}` : undefined} empty={copy.empty} />
            <DetailRow label={copy.fields.service} value={request.service} empty={copy.empty} />
          </dl>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.sections.status}
          </h2>
          <StatusChanger
            requestId={request.id}
            currentStatus={request.status}
            lang={lang}
            backHref={listHref}
            copy={copy.statusChanger}
            labels={dict.app.requests.statusBadge}
          />
        </section>

        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.sections.message}
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
            {request.message}
          </p>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {copy.sections.meta}
          </h2>
          <dl className="flex flex-col gap-3 text-xs">
            <div>
              <dt className="text-white/45">{copy.fields.createdAt}</dt>
              <dd className="mt-0.5 text-white/85">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.fields.updatedAt}</dt>
              <dd className="mt-0.5 text-white/85">{updatedAt}</dd>
            </div>
            <div>
              <dt className="text-white/45">{copy.fields.id}</dt>
              <dd className="mt-0.5 break-all font-mono text-[11px] text-white/60">
                {request.id}
              </dd>
            </div>
          </dl>
        </section>

        {request.status === "converted" && (
          <section className="glass-strong rounded-2xl p-5 lg:col-span-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                  <UsersIcon className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-white">
                    {copy.createClient.title}
                  </h2>
                  <p className="max-w-xl text-sm text-white/65">
                    {copy.createClient.description}
                  </p>
                </div>
              </div>
              <a
                href={`/${lang}/app/clients/new?from=${request.id}`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)]"
              >
                {copy.createClient.cta}
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
  empty,
}: {
  label: string;
  value: string | null;
  href?: string;
  empty?: string;
}) {
  const isEmpty = !value;
  const display = isEmpty ? (empty ?? "—") : value;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="text-sm text-white/85">
        {href && !isEmpty ? (
          <a href={href} className="text-accent-2 underline-offset-4 hover:underline">
            {display}
          </a>
        ) : (
          <span className={isEmpty ? "text-white/35" : ""}>{display}</span>
        )}
      </dd>
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