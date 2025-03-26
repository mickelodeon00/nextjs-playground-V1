/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase auth error:", error);
  }

  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  const authRoutes = ["/auth"];
  const publicRoutes = ["/contact", "/terms", "/privacy", "/pricing"];
  const protectedRoutes = ["/jupeb", "/ijmb", "orders", "/dashboard"];

  // Helper functions to check route types
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If the user is not authenticated and tries to access a protected route
  if (!user && isProtectedRoute) {
    const returnTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and tries to access an auth route
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    // Check if there's a returnTo parameter
    const returnTo = searchParams.get("returnTo");
    if (returnTo) {
      // Decode the URL and validate it starts with / to prevent open redirect
      const decodedReturnTo = decodeURIComponent(returnTo);
      if (decodedReturnTo.startsWith('/')) {
        url.pathname = decodedReturnTo;
        return NextResponse.redirect(url);
      }
    }
    // Default fallback if no valid returnTo URL
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If the route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return supabaseResponse;
}