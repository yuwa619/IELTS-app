import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDataMode, type DataMode } from "./data-mode";

export interface ServiceContext {
  mode: DataMode;
  supabase: SupabaseClient | null;
  user: User | null;
}

// Single entry point for services: in Supabase mode return the client and the
// signed-in user; in mock mode both stay null and services use bundled data.
// A signed-out request in Supabase mode yields user=null — callers must treat
// that as unauthorized rather than silently serving mock data.
export async function getServiceContext(): Promise<ServiceContext> {
  const mode = getDataMode();
  if (mode === "mock") return { mode, supabase: null, user: null };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { mode, supabase: null, user: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { mode, supabase, user };
}

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

export function requireUser(ctx: ServiceContext) {
  if (!ctx.supabase || !ctx.user) {
    throw new ServiceError("unauthorized", "Sign in to load your saved data.", 401);
  }
  return { supabase: ctx.supabase, user: ctx.user };
}
