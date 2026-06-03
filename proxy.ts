import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function getRedirectUrlForRole(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/dashboard";
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), req.url));
    }

    if (path.startsWith("/seller") && role !== "SELLER") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), req.url));
    }

    if (path.startsWith("/dashboard") && role !== "BUYER") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/dashboard/:path*"],
};