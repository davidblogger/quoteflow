import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const locales = ["en", "es"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

const PROTECTED_PREFIX = "/app";

function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const requested = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .map((tag) => tag.split("-")[0]);

  for (const tag of requested) {
    if ((locales as readonly string[]).includes(tag)) {
      return tag as Locale;
    }
  }
  return defaultLocale;
}

function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function extractLocale(pathname: string): Locale {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return defaultLocale;
}

function isProtected(restOfPath: string): boolean {
  // PDF routes are public — no auth required
  if (/\/quotes\/[^/]+\/pdf$/.test(restOfPath)) {
    return false;
  }
  return (
    restOfPath === PROTECTED_PREFIX ||
    restOfPath.startsWith(`${PROTECTED_PREFIX}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  let locale: Locale;
  if (hasLocalePrefix(pathname)) {
    locale = extractLocale(pathname);
  } else {
    locale = getPreferredLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const rest = pathname.slice(`/${locale}`.length);
  if (!isProtected(rest)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};