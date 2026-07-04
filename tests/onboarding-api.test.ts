import { afterEach, describe, expect, it, vi } from "vitest";

function isoDateFromToday(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

const validPayload = {
  goalMode: "crs",
  targetClb: 9,
  targetOverallBand: 7.5,
  testDate: isoDateFromToday(30),
  testFormat: "computer",
  testLocation: "Calgary",
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
    expect(body.data.goal.testFormat).toBe("computer");
    expect(body.data.goal.testLocation).toBe("Calgary");
    expect(body.data.targets.listening).toBe(8);
    expect(body.data.targets.targetOverallBand).toBe(7.5);
  });

  it("rejects test dates in the past", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { POST } = await import("@/app/api/onboarding/route");
    const response = await POST(
      new Request("http://localhost:3000/api/onboarding", {
        method: "POST",
        body: JSON.stringify({ ...validPayload, testDate: isoDateFromToday(-1) }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("test_date_in_past");
  });

  it("accepts an unbooked test date and a low overall band target", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { POST } = await import("@/app/api/onboarding/route");
    const response = await POST(
      new Request("http://localhost:3000/api/onboarding", {
        method: "POST",
        body: JSON.stringify({
          ...validPayload,
          goalMode: "eligible",
          targetClb: 7,
          targetOverallBand: 6,
          testDate: null,
          testFormat: "unsure",
          testLocation: undefined,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.goal.testDate).toBeNull();
    expect(body.data.goal.testLocation).toBeNull();
    expect(body.data.targets.listening).toBe(6);
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
    expect(writes[1]?.payload).toMatchObject({
      user_id: "user-123",
      test_date: validPayload.testDate,
      test_format: "computer",
      test_location: "Calgary",
    });
    expect(writes[2]?.payload).toMatchObject({
      user_id: "user-123",
      target_clb: 9,
      target_overall_band: 7.5,
      listening: 8,
      reading: 7,
      writing: 7,
      speaking: 7,
    });
  });
});
