import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** APIs internas — só utilizadores autenticados (cookie de sessão) */
const PROTECTED_PATHS = [
  "/api/ai",
  "/api/domains",
  "/api/pages/publish",
  "/api/pages/quota",
  "/api/stripe/checkout",
  "/api/stripe/portal",
  "/api/stripe/verify-session",
  "/api/chatbots/reply",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !request.cookies.get("vexa_session")?.value) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/ai/:path*",
    "/api/domains/:path*",
    "/api/pages/publish",
    "/api/pages/quota",
    "/api/stripe/checkout",
    "/api/stripe/portal",
    "/api/stripe/verify-session",
    "/api/chatbots/reply",
  ],
};
