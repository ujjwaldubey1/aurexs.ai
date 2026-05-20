import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const cookieName = "sb-access-token";

const protectedPaths = ["/inventory", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(cookieName)?.value;
  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/inventory", "/inventory/:path*", "/dashboard", "/dashboard/:path*"]
};
