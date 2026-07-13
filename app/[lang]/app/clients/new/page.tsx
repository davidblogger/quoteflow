import { redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../../dictionaries";
import { ClientForm } from "../client-form";
import { ArrowRightIcon } from "@/app/components/icons/Icons";

export default async function NewClientPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) redirect(`/${lang}`);

  const dict = await getDictionary(lang satisfies Locale);
  const copy = dict.app.clients;

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
          cancelHref={`/${lang}/app/clients`}
        />
      </div>
    </div>
  );
}