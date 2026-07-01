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

    expect(env.getSiteUrl()).toBe("https://clearband-demo.netlify.app");
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
