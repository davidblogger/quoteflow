import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary, type Locale } from "../../dictionaries";
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