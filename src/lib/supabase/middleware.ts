import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "./env";

const protectedPrefixes = [
  "/admin",
  "/dashboard",
  "/diagnostic",
  "/grammar",
  "/lessons",
  "/mocks",
  "/onboarding",
  "/practice",
  "/progress",
  "/review",
  "/settings",
  "/today",
  "/vocabulary",
];

export function isProtectedAppPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthCallbackPath(pathname: string) {
  return pathname === "/auth/callback";
}

// If Supabase rejects the redirect_to allow-list it falls back to the Site URL,
// landing auth codes on `/` (or `/login`) where they would silently die.
// Forward them to the callback route so the sign-in still completes.
export function strayAuthCodeRedirect(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname !== "/" && pathname !== "/login") return null;
  if (!searchParams.has("code") && !searchParams.has("token_hash")) return null;

  const callbackUrl = request.nextUrl.clone();
  callbackUrl.pathname = "/auth/callback";
  return NextResponse.redirect(callbackUrl);
}

export function loginRedirectUrl(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return redirectUrl;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (isAuthCallbackPath(request.nextUrl.pathname)) return response;
  if (!hasSupabaseEnv()) return response;

  const strayAuthCode = strayAuthCodeRedirect(request);
  if (strayAuthCode) return strayAuthCode;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedAppPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
