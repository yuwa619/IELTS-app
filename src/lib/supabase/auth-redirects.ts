import type { SupabaseClient } from "@supabase/supabase-js";

export type LoginErrorCode =
  | "auth_callback_failed"
  | "expired_link"
  | "missing_code"
  | "provider_not_enabled"
  | "rate_limit";

const loginErrorMessages: Record<LoginErrorCode, string> = {
  auth_callback_failed:
    "We could not finish signing you in. Please request a fresh magic link.",
  expired_link:
    "That sign-in link has expired or was already used. Please request a new magic link.",
  missing_code:
    "The sign-in link was missing its auth code. Please request a new magic link.",
  provider_not_enabled:
    "That sign-in provider is not enabled yet. Use email magic link for now.",
  rate_limit:
    "Too many sign-in emails were requested. Please wait a little while before trying again.",
};

export function safeLocalPath(value: string | null, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function buildAuthCallbackUrl(origin: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || origin;
  return `${configuredOrigin.replace(/\/$/, "")}/auth/callback`;
}

export function loginErrorMessage(code: string | null) {
  if (!code) return null;
  return loginErrorMessages[code as LoginErrorCode] ?? loginErrorMessages.auth_callback_failed;
}

export function classifyAuthError(message?: string | null): LoginErrorCode {
  const text = message?.toLowerCase() ?? "";
  if (text.includes("expired") || text.includes("invalid")) return "expired_link";
  if (text.includes("rate") || text.includes("too many")) return "rate_limit";
  if (text.includes("provider") || text.includes("enabled")) {
    return "provider_not_enabled";
  }
  return "auth_callback_failed";
}

export async function postAuthRedirectPath(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("onboarded")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return "/onboarding";
  return data?.onboarded ? "/dashboard" : "/onboarding";
}
