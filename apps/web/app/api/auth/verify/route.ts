import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncDevTenantAndRefreshSession } from "../../../../lib/sync-tenant-metadata";

const cookieName = "sb-access-token";

export async function POST(request: NextRequest) {
  const { phone, token } = (await request.json()) as { phone?: string; token?: string };
  if (!phone || !token) {
    return NextResponse.json({ ok: false, message: "Phone and OTP are required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey);
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error || !data.session) {
    return NextResponse.json({ ok: false, message: error?.message || "OTP verification failed" }, { status: 401 });
  }

  const synced = await syncDevTenantAndRefreshSession(data.session);
  if (!synced.ok) {
    return NextResponse.json({ ok: false, message: synced.message }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, synced.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: synced.expiresIn
  });
  return response;
}
