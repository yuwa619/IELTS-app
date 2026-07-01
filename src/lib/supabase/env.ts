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

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
