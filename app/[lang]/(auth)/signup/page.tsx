import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { SignupForm } from "./SignupForm";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.signup.metaTitle };
}

export default async function SignupPage(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${lang}/app`);

  const dict = await getDictionary(lang satisfies Locale);

  return (
    <SignupForm
      copy={dict.auth.signup}
      lang={lang}
      loginHref={`/${lang}/login`}
      homeHref={`/${lang}`}
    />
  );
}