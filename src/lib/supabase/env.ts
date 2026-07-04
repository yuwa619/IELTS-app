export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isMockMode() {
  return !hasSupabaseEnv();
}

export function getDataModeLabel() {
  return isMockMode() ? "Mock mode" : "Supabase mode";
}

export function shouldShowDataModeIndicator() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_SHOW_DATA_MODE === "true"
  );
}

export type OAuthProvider = "google" | "apple";

// OAuth buttons stay hidden until the provider is actually enabled in
// Supabase and listed here, e.g. NEXT_PUBLIC_OAUTH_PROVIDERS=google,apple.
export function enabledOAuthProviders(): OAuthProvider[] {
  return (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is OAuthProvider =>
      value === "google" || value === "apple",
    );
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
