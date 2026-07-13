import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
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