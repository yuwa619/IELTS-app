import { isMockMode } from "@/lib/supabase/env";

export function canUseMockAdmin() {
  return isMockMode() || process.env.CLEARBAND_ALLOW_UNGATED_ADMIN === "true";
}

export function adminUnavailableMessage() {
  return "Admin is blocked when Supabase is configured until authenticated admin checks are wired to admin_users.";
}
