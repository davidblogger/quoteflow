import "server-only";
import { locales, type Locale } from "./config";

export { locales, type Locale, defaultLocale, localeLabels } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
};

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]() as Promise<Dictionary>;

export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;