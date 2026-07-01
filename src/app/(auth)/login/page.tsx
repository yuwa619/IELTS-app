import { Suspense } from "react";
import { AuthShell } from "@/components/layout/shells";
import { Alert, Card } from "@/components/ui";
import { isMockMode } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const mockMode = isMockMode();

  return (
    <AuthShell>
      <Card className="space-y-5">
        <div>
          <h1 className="font-serif text-[34px] leading-tight">
            Create your account
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Use a magic link to reach the diagnostic quickly. Google and Apple
            are wired as provider-ready buttons once enabled in Supabase.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading sign-in options...</p>}>
          <LoginForm mockMode={mockMode} />
        </Suspense>
        {mockMode ? (
          <Alert tone="info">
            Local mock mode is active because Supabase credentials are missing.
            Continue safely without external auth.
          </Alert>
        ) : (
          <Alert tone="success">
            Supabase Auth is configured. Magic links and enabled OAuth providers
            will redirect through <code>/auth/callback</code>.
          </Alert>
        )}
      </Card>
    </AuthShell>
  );
}
