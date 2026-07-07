import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

const protectedPrefixes: Record<string, Array<"CLIENTE" | "STAFF" | "ADMIN">> = {
  "/espace": ["CLIENTE", "STAFF", "ADMIN"],
  "/admin": ["STAFF", "ADMIN"],
};
const authRoutes = ["/connexion", "/inscription"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const matchedPrefix = Object.keys(protectedPrefixes).find((p) => path.startsWith(p));

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);

  if (matchedPrefix && !session?.userId) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }

  if (matchedPrefix && session && !protectedPrefixes[matchedPrefix].includes(session.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (authRoutes.includes(path) && session?.userId) {
    return NextResponse.redirect(new URL("/espace", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*", "/connexion", "/inscription"],
};
