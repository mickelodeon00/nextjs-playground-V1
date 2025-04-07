import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
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
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Routes that do not require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  const signInRoutes = ["/login", "/signup", "/forgot-password"];

  // If the user is not authenticated and tries to access a route other than public routes
  if (!user && !publicRoutes.some((route) => pathname.startsWith(route))) {
    const returnTo = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    );
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // Redirect to login
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and tries to access login, signup, or forgetpassword
  if (user && publicRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // Redirect to dashboard if already authenticated
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow access if no conditions are met
}
