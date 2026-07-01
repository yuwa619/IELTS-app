import {
  getDataModeLabel,
  isMockMode,
  shouldShowDataModeIndicator,
} from "@/lib/supabase/env";

export function MockModeBanner() {
  if (!shouldShowDataModeIndicator()) return null;

  const mockMode = isMockMode();

  return (
    <div
      className={`px-4 py-2 text-center text-xs font-semibold ${
        mockMode
          ? "bg-[var(--maple-50)] text-[var(--maple)]"
          : "bg-[var(--success-50)] text-[var(--success)]"
      }`}
    >
      {getDataModeLabel()}:{" "}
      {mockMode
        ? "Supabase environment variables are missing. The app is using safe local mock services."
        : "Supabase environment variables detected. Auth-protected routes and live onboarding writes are active."}
    </div>
  );
}
