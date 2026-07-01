import { isMockMode } from "@/lib/supabase/env";

export type DataMode = "mock" | "supabase";

export function getDataMode(): DataMode {
  return isMockMode() ? "mock" : "supabase";
}
