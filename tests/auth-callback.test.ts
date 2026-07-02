import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

function mockSupabaseClient({
  onboarded,
  exchangeError,
}: {
  onboarded: boolean;
  exchangeError?: { message: string };
}) {
  return {
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({
        data: exchangeError
          ? { session: null, user: null }
          : {
              session: { access_token: "redacted" },
              user: { id: "user-123", email: "learner@example.com", user_metadata: {} },
            },
        error: exchangeError ?? null,
      })),
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
