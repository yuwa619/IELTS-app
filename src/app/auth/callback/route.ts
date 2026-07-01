import { NextResponse, type NextRequest } from "next/server";
import {
  createServerSupabaseClient,
  ensureUserProfile,
} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/dashboard";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase?.auth.exchangeCodeForSession(code) ?? {
      data: { user: null },
    };
    if (data.user) {
      await ensureUserProfile(data.user);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
