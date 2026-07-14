import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.login.metaTitle };
}

export default async function LoginPage(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  // Authenticated users have no business on the login page. Bounce them to
  // their dashboard so visiting /login from a stale tab never shows the
  // form, and avoid any race where the page renders then a redirect fires
  // (which can surface as a 404 in some browsers when they replay the
  // form action).
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${lang}/app`);

  const dict = await getDictionary(lang satisfies Locale);

  return (
    <LoginForm
      copy={dict.auth.login}
      lang={lang}
      signupHref={`/${lang}/signup`}
      homeHref={`/${lang}`}
    />
  );
}