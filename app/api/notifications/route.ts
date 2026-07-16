import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/queries/notifications";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawCookies = parseCookieHeader(cookieHeader);
  const cookies = rawCookies.map((c) => ({ name: c.name, value: c.value ?? "" }));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await listNotifications(user.id, limit, offset, supabase);
  return NextResponse.json({ notifications });
}
