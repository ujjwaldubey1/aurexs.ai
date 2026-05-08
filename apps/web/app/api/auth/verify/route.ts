import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.session.expires_in
  });
  return response;
}
