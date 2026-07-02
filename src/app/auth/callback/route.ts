import { NextResponse, type NextRequest } from "next/server";
import {
  classifyAuthError,
  postAuthRedirectPath,
} from "@/lib/supabase/auth-redirects";
import {
  createServerSupabaseClient,
  ensureUserProfile,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function callbackRedirect(requestUrl: URL, path: string) {
  const response = NextResponse.redirect(new URL(path, requestUrl.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function callbackErrorRedirect(requestUrl: URL, error: string) {
  return callbackRedirect(requestUrl, `/login?error=${encodeURIComponent(error)}`);
}

function logCallbackStep(
  step: string,
  details: Record<string, boolean | string> = {},
) {
  console.info("[clearband-auth-callback]", { step, ...details });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError =
    requestUrl.searchParams.get("error_code") ??
    requestUrl.searchParams.get("error") ??
    null;

  logCallbackStep("received", {
    hasCode: String(Boolean(code)),
    hasProviderError: String(Boolean(providerError)),
  });

  if (providerError) {
    const error = classifyAuthError(providerError);
    logCallbackStep("provider-error", { error });
    return callbackErrorRedirect(requestUrl, error);
  }

  if (!code) {
    logCallbackStep("missing-code");
    return callbackErrorRedirect(requestUrl, "missing_code");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    logCallbackStep("supabase-unavailable");
    return callbackErrorRedirect(requestUrl, "auth_callback_failed");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session || !data.user) {
    const authError = classifyAuthError(error?.message);
    logCallbackStep("exchange-failed", { error: authError });
    return callbackErrorRedirect(requestUrl, authError);
  }

  logCallbackStep("exchange-succeeded", { hasUser: "true" });

  const profileResult = await ensureUserProfile(data.user);
  if (!profileResult.ok) {
    logCallbackStep("profile-upsert-failed");
  }

  const redirectPath = await postAuthRedirectPath(supabase, data.user.id);
  logCallbackStep("redirecting", { redirectPath });

  return callbackRedirect(requestUrl, redirectPath);
}
