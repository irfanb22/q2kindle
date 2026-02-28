import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Public pages don't need Supabase — skip auth entirely
  const pathname = request.nextUrl.pathname;
  const isStaticPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname.startsWith("/landing-") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/");

  if (isStaticPublicRoute) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all routes except public pages
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname === "/privacy" ||
    request.nextUrl.pathname.startsWith("/landing-");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and hits / or /login, redirect to dashboard
  if (user && (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
