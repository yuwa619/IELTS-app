import { afterEach, describe, expect, it, vi } from "vitest";

const validPayload = {
  goalMode: "crs",
  targetClb: 9,
  testDate: "2026-08-06",
  confidence: 3,
  dailyMinutes: 30,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("onboarding API data modes", () => {
  it("uses mock onboarding service when Supabase env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { POST } = await import("@/app/api/onboarding/route");
    const response = await POST(
      new Request("http://localhost:3000/api/onboarding", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.goal.userId).toBe("mock-user");
    expect(body.data.targets.listening).toBe(8);
  });

  it("requires an authenticated Supabase user in Supabase mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
        },
      }),
    }));

    const { POST } = await import("@/app/api/onboarding/route");
    const response = await POST(
      new Request("http://localhost:3000/api/onboarding", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("unauthorized");
  });

  it("writes profile, onboarding goal, and CLB target rows in Supabase mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const writes: Array<{ table: string; payload: unknown; options: unknown }> = [];

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: {
          getUser: async () => ({
            data: {
              user: {
                id: "user-123",
                email: "amir@example.com",
                user_metadata: { name: "Amir" },
              },
            },
            error: null,
          }),
        },
        from: (table: string) => ({
          upsert: (payload: unknown, options: unknown) => {
            writes.push({ table, payload, options });
            return Promise.resolve({ error: null });
          },
        }),
      }),
    }));

    const { POST } = await import("@/app/api/onboarding/route");
    const response = await POST(
      new Request("http://localhost:3000/api/onboarding", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.mode).toBe("supabase");
    expect(body.data.goal.userId).toBe("user-123");
    expect(writes.map((write) => write.table)).toEqual([
      "user_profiles",
      "onboarding_goals",
      "clb_targets",
    ]);
    expect(writes[2]?.payload).toMatchObject({
      user_id: "user-123",
      target_clb: 9,
      listening: 8,
      reading: 7,
      writing: 7,
      speaking: 7,
    });
  });
});
