import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

function mockSupabaseClient({
  onboarded,
  exchangeError,
  missingSession,
}: {
  onboarded: boolean;
  exchangeError?: { message: string };
  missingSession?: boolean;
}) {
  const authResult = async () => ({
    data:
      exchangeError || missingSession
        ? { session: null, user: null }
        : {
            session: { access_token: "redacted" },
            user: { id: "user-123", email: "learner@example.com", user_metadata: {} },
          },
    error: exchangeError ?? null,
  });
  return {
    auth: {
      exchangeCodeForSession: vi.fn(authResult),
      verifyOtp: vi.fn(authResult),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: table === "user_profiles" ? { onboarded } : null,
            error: null,
          }),
        }),
      }),
    }),
  };
}

function location(response: Response) {
  return response.headers.get("location");
}

describe("auth callback route", () => {
  it("redirects missing-code callbacks back to login with a clear error", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback") as never,
    );

    expect(location(response)).toBe(
      "https://clearband.netlify.app/login?error=missing_code",
    );
  });

  it("redirects failed exchanges back to login instead of the landing page", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({
      onboarded: false,
      exchangeError: { message: "Email link is invalid or has expired" },
    });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback?code=bad") as never,
    );

    expect(location(response)).toBe(
      "https://clearband.netlify.app/login?error=expired_link",
    );
  });

  it("redirects a newly signed-in user to onboarding when onboarding is incomplete", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({ onboarded: false });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback?code=abc") as never,
    );

    expect(location(response)).toBe("https://clearband.netlify.app/onboarding");
    expect(location(response)).not.toBe("https://clearband.netlify.app/");
  });

  it("signs in token_hash email links through verifyOtp", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({ onboarded: false });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request(
        "https://clearband.netlify.app/auth/callback?token_hash=hash-123&type=email",
      ) as never,
    );

    expect(client.auth.verifyOtp).toHaveBeenCalledWith({
      type: "email",
      token_hash: "hash-123",
    });
    expect(client.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location(response)).toBe("https://clearband.netlify.app/onboarding");
  });

  it("classifies missing PKCE verifier failures as cross-browser exchange failures", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({
      onboarded: false,
      exchangeError: {
        message: "both auth code and code verifier should be non-empty",
      },
    });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback?code=abc") as never,
    );

    expect(location(response)).toBe(
      "https://clearband.netlify.app/login?error=callback_exchange_failed",
    );
  });

  it("reports a clear error when the exchange succeeds without a session", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({ onboarded: false, missingSession: true });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback?code=abc") as never,
    );

    expect(location(response)).toBe(
      "https://clearband.netlify.app/login?error=session_missing_after_exchange",
    );
  });

  it("redirects an onboarded user to dashboard after a successful exchange", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const client = mockSupabaseClient({ onboarded: true });

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
      ensureUserProfile: async () => ({ ok: true }),
    }));

    const { GET } = await import("@/app/auth/callback/route");
    const response = await GET(
      new Request("https://clearband.netlify.app/auth/callback?code=abc") as never,
    );

    expect(location(response)).toBe("https://clearband.netlify.app/dashboard");
  });
});
