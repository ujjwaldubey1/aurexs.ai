import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl, readApiJson } from "../../../../lib/api";

const cookieName = "sb-access-token";

export async function GET() {
  const token = cookies().get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Not signed in" },
      { status: 401 }
    );
  }

  let apiBase: string;
  try {
    apiBase = getApiBaseUrl();
  } catch {
    return NextResponse.json(
      { code: "API_NOT_CONFIGURED", message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const upstream = await fetch(`${apiBase}/inventory/items`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });

  const body = await readApiJson(upstream);
  return NextResponse.json(body, { status: upstream.status });
}
