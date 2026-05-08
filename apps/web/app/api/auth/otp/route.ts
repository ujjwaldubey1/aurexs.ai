import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { phone } = (await request.json()) as { phone?: string };
  if (!phone) {
    return NextResponse.json({ ok: false, message: "Phone is required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey);
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "OTP sent" });
}
