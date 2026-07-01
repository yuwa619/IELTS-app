"use client";

import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ mockMode }: { mockMode: boolean }) {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") ?? "/onboarding";
  const nextPath =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/onboarding";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function authCallbackUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    return `${appUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }

  async function signInWithEmail() {
    setError(null);

    if (mockMode) {
      window.location.href = nextPath;
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Use mock mode or add env vars.");
      return;
    }

    setLoading(true);
    const redirectTo = authCallbackUrl();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setStatus("Check your inbox for the Clearband sign-in link.");
  }

  async function signInWithProvider(provider: "google" | "apple") {
    setError(null);

    if (mockMode) {
      setStatus(`${provider === "google" ? "Google" : "Apple"} sign-in is a setup placeholder in mock mode.`);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Use mock mode or add env vars.");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authCallbackUrl(),
      },
    });

    if (authError) setError(authError.message);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {mockMode ? (
        <ButtonLink
          href={nextPath}
          className="w-full"
          icon={<Mail className="h-4 w-4" />}
        >
          Continue in mock mode
        </ButtonLink>
      ) : (
        <Button
          className="w-full"
          icon={<Mail className="h-4 w-4" />}
          disabled={loading || !email}
          onClick={signInWithEmail}
        >
          {loading ? "Sending link..." : "Continue with email"}
        </Button>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWithProvider("google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWithProvider("apple")}
        >
          Apple
        </Button>
      </div>
      {status ? <p className="text-sm text-[var(--success)]">{status}</p> : null}
      {error ? <p className="text-sm text-[var(--maple)]">{error}</p> : null}
    </div>
  );
}
