import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Supabase data mode and auth helpers", () => {
  it("uses mock mode and safe null clients when Supabase env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const env = await import("@/lib/supabase/env");
    const client = await import("@/lib/supabase/client");
    const server = await import("@/lib/supabase/server");
    const dataMode = await import("@/lib/services/data-mode");

    expect(env.hasSupabaseEnv()).toBe(false);
    expect(env.isMockMode()).toBe(true);
    expect(dataMode.getDataMode()).toBe("mock");
    expect(client.createClient()).toBeNull();
    await expect(server.createServerSupabaseClient()).resolves.toBeNull();
  });

  it("detects Supabase mode when public Supabase env vars are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const env = await import("@/lib/supabase/env");
    const dataMode = await import("@/lib/services/data-mode");

    expect(env.hasSupabaseEnv()).toBe(true);
    expect(env.isMockMode()).toBe(false);
    expect(dataMode.getDataMode()).toBe("supabase");
  });

  it("uses NEXT_PUBLIC_APP_URL as the deploy-safe public app URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://clearband-demo.netlify.app/");

    const env = await import("@/lib/supabase/env");
    const redirects = await import("@/lib/supabase/auth-redirects");

    expect(env.getSiteUrl()).toBe("https://clearband-demo.netlify.app");
    expect(redirects.buildAuthCallbackUrl("http://localhost:3000")).toBe(
      "https://clearband-demo.netlify.app/auth/callback",
    );
  });

  it("forwards stray Supabase auth codes on / and /login to the auth callback", async () => {
    const { NextRequest } = await import("next/server");
    const { strayAuthCodeRedirect } = await import("@/lib/supabase/middleware");

    const landing = strayAuthCodeRedirect(
      new NextRequest("https://clearband.netlify.app/?code=abc-123"),
    );
    expect(landing?.headers.get("location")).toBe(
      "https://clearband.netlify.app/auth/callback?code=abc-123",
    );

    const login = strayAuthCodeRedirect(
      new NextRequest("https://clearband.netlify.app/login?token_hash=h&type=email"),
    );
    expect(login?.headers.get("location")).toBe(
      "https://clearband.netlify.app/auth/callback?token_hash=h&type=email",
    );

    expect(
      strayAuthCodeRedirect(new NextRequest("https://clearband.netlify.app/")),
    ).toBeNull();
    expect(
      strayAuthCodeRedirect(
        new NextRequest("https://clearband.netlify.app/dashboard?code=abc"),
      ),
    ).toBeNull();
  });

  it("hides OAuth providers unless they are explicitly enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PROVIDERS", "");
    let env = await import("@/lib/supabase/env");
    expect(env.enabledOAuthProviders()).toEqual([]);

    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PROVIDERS", "google, Apple, facebook");
    env = await import("@/lib/supabase/env");
    expect(env.enabledOAuthProviders()).toEqual(["google", "apple"]);
  });

  it("routes signed-in users by onboarding state in middleware", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    let onboarded = false;
    vi.doMock("@supabase/ssr", () => ({
      createServerClient: () => ({
        auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { onboarded }, error: null }),
            }),
          }),
        }),
      }),
    }));

    const { NextRequest } = await import("next/server");
    const { updateSession } = await import("@/lib/supabase/middleware");

    const toOnboarding = await updateSession(
      new NextRequest("https://clearband.netlify.app/dashboard"),
    );
    expect(toOnboarding.headers.get("location")).toBe(
      "https://clearband.netlify.app/onboarding",
    );

    onboarded = true;
    const allowed = await updateSession(
      new NextRequest("https://clearband.netlify.app/dashboard"),
    );
    expect(allowed.headers.get("location")).toBeNull();

    const skipOnboarding = await updateSession(
      new NextRequest("https://clearband.netlify.app/onboarding"),
    );
    expect(skipOnboarding.headers.get("location")).toBe(
      "https://clearband.netlify.app/dashboard",
    );
  });

  it("classifies app routes as protected for Supabase mode middleware", async () => {
    const { isProtectedAppPath } = await import("@/lib/supabase/middleware");

    expect(isProtectedAppPath("/dashboard")).toBe(true);
    expect(isProtectedAppPath("/admin")).toBe(true);
    expect(isProtectedAppPath("/practice/writing/task-2")).toBe(true);
    expect(isProtectedAppPath("/mocks/mini-mock-1")).toBe(true);
    expect(isProtectedAppPath("/")).toBe(false);
    expect(isProtectedAppPath("/login")).toBe(false);
    expect(isProtectedAppPath("/auth/callback")).toBe(false);
  });
});
