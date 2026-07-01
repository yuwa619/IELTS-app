import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "./env";
import type { User } from "@supabase/supabase-js";

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function ensureUserProfile(user: User) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, skipped: true };

  const profile = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      display_name:
        user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.email ??
        null,
      locale: user.user_metadata?.locale ?? "en-CA",
    },
    { onConflict: "user_id" },
  );

  if (profile.error) return { ok: false, error: profile.error.message };

  const subscription = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan: "free",
      status: "active",
      entitlements: { mock_limit: true },
    },
    { onConflict: "user_id" },
  );

  if (subscription.error) {
    return { ok: false, error: subscription.error.message };
  }

  return { ok: true };
}
