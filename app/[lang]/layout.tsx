import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getDictionary, hasLocale, locales, type Locale } from "./dictionaries";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quoteflow.io";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: LayoutProps<"/[lang]">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const ogLocale = dict.metadata.ogLocale;
  const alternates: Record<string, string> = {};
  for (const l of locales) {
    alternates[l] = `/${l}`;
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.metadata.title,
      template: `%s · QuoteFlow`,
    },
    description: dict.metadata.description,
    applicationName: "QuoteFlow",
    authors: [{ name: "QuoteFlow" }],
    keywords: [
      "quotes",
      "CRM",
      "client follow-up",
      "service businesses",
      "SaaS",
      "QuoteFlow",
    ],
    alternates: {
      canonical: `/${lang}`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      title: dict.metadata.title,
      description: dict.metadata.description,
      siteName: "QuoteFlow",
      locale: ogLocale,
      alternateLocale: locales.filter((l) => l !== lang).map((l) =>
        l === "en" ? "en_US" : "es_ES",
      ),
      url: `/${lang}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "QuoteFlow",
      description: dict.metadata.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#060814",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout(
  props: LayoutProps<"/[lang]">,
) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang satisfies Locale}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>{props.children}</body>
    </html>
  );
}