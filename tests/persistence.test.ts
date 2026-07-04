import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

function stubSupabaseEnv() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
}

const USER = { id: "11111111-1111-4111-8111-111111111111", email: "learner@example.com" };
const LESSON_UUID = "22222222-2222-4222-8222-222222222222";

// Minimal chainable fake for the supabase-js query builder. Each table gets a
// handler returning { data, error }; inserts/upserts/updates are recorded.
type TableResult = { data: unknown; error: { code?: string; message: string } | null };

function fakeClient(handlers: Record<string, (op: string, payload?: unknown) => TableResult>) {
  const writes: { table: string; op: string; payload: unknown }[] = [];
  function builder(table: string) {
    let op = "select";
    let payload: unknown;
    const chain: Record<string, unknown> = {};
    const passthrough = ["select", "eq", "order", "limit", "lte", "in"];
    for (const method of passthrough) {
      chain[method] = () => chain;
    }
    for (const write of ["insert", "upsert", "update"]) {
      chain[write] = (value: unknown) => {
        op = write;
        payload = value;
        writes.push({ table, op: write, payload: value });
        return chain;
      };
    }
    const resolve = () =>
      handlers[table]?.(op, payload) ?? { data: op === "select" ? [] : null, error: null };
    chain.maybeSingle = async () => resolve();
    chain.single = async () => resolve();
    chain.then = (onFulfilled: (value: TableResult) => unknown) =>
      Promise.resolve(resolve()).then(onFulfilled);
    return chain;
  }
  return {
    writes,
    client: {
      auth: { getUser: async () => ({ data: { user: USER }, error: null }) },
      from: (table: string) => builder(table),
    },
  };
}

describe("returning-user account state", () => {
  it("loads the signed-in user's profile from Supabase, not mock data", async () => {
    stubSupabaseEnv();
    const { client } = fakeClient({
      user_profiles: () => ({
        data: {
          user_id: USER.id,
          display_name: "Martins",
          locale: "en-CA",
          onboarded: true,
          daily_minutes: 45,
          consent_audio: false,
          consent_samples: true,
        },
        error: null,
      }),
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { getProfile } = await import("@/lib/services/profile");
    const profile = await getProfile();

    expect(profile.userId).toBe(USER.id);
    expect(profile.displayName).toBe("Martins");
    expect(profile.onboarded).toBe(true);
    expect(profile.dailyMinutes).toBe(45);
  });

  it("throws unauthorized instead of silently serving mock data when signed out", async () => {
    stubSupabaseEnv();
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      }),
    }));

    const { getProfile } = await import("@/lib/services/profile");
    await expect(getProfile()).rejects.toMatchObject({ code: "unauthorized", status: 401 });
  });
});

describe("task completion persistence", () => {
  it("marks the task done and awards XP once (idempotent on retry)", async () => {
    stubSupabaseEnv();
    let xpInserts = 0;
    const { client, writes } = fakeClient({
      daily_tasks: (op) =>
        op === "update"
          ? { data: { id: "task-1", xp: 30, block: "lesson" }, error: null }
          : { data: [], error: null },
      xp_events: (op) => {
        if (op === "insert") {
          xpInserts += 1;
          return xpInserts === 1
            ? { data: null, error: null }
            : { data: null, error: { code: "23505", message: "duplicate" } };
        }
        return { data: [], error: null };
      },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { completeTask } = await import("@/lib/services/study-plan");
    const first = await completeTask("task-1");
    const second = await completeTask("task-1");

    expect(first).toMatchObject({ status: "done", xpAwarded: 30 });
    expect(second).toMatchObject({ status: "done", xpAwarded: 0 });
    expect(writes.some((write) => write.table === "daily_tasks" && write.op === "update")).toBe(true);
  });
});

describe("practice attempt persistence", () => {
  it("saves the attempt and logs error + revision item for a wrong answer", async () => {
    stubSupabaseEnv();
    const { client, writes } = fakeClient({});
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { gradePractice } = await import("@/lib/services/practice");
    const result = await gradePractice("reading-1", "definitely wrong answer", 4000);

    expect(result.saved).toBe(true);
    expect(result.isCorrect).toBe(false);
    const tables = writes.map((write) => write.table);
    expect(tables).toContain("practice_attempts");
    expect(tables).toContain("error_logs");
    expect(tables).toContain("revision_items");
    expect(tables).toContain("xp_events");
  });
});

describe("writing attempt persistence", () => {
  it("saves the attempt with the mock estimate and awards XP", async () => {
    stubSupabaseEnv();
    const { client, writes } = fakeClient({
      writing_attempts: (op) =>
        op === "insert" ? { data: { id: "attempt-1" }, error: null } : { data: [], error: null },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { submitWriting } = await import("@/lib/services/writing");
    const attempt = await submitWriting({
      promptId: "writing-1",
      text: "Dear Sir, ".repeat(40),
      timeMs: 60000,
    });

    expect(attempt.saved).toBe(true);
    expect(attempt.estimate.band.isEstimate).toBe(true);
    expect(writes.some((write) => write.table === "writing_attempts")).toBe(true);
    expect(writes.some((write) => write.table === "xp_events")).toBe(true);
  });
});

describe("mock attempt persistence", () => {
  it("scores, saves, and labels the mini mock result as an estimate", async () => {
    stubSupabaseEnv();
    const { client, writes } = fakeClient({
      mock_attempts: (op) =>
        op === "insert" ? { data: { id: "mock-attempt-1" }, error: null } : { data: [], error: null },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { submitMockAttempt } = await import("@/lib/services/mocks");
    const result = await submitMockAttempt("mini-mock-1", {});

    expect(result.saved).toBe(true);
    expect(result.isEstimate).toBe(true);
    expect(result.overall).toBeGreaterThan(0);
    expect(writes.some((write) => write.table === "mock_attempts")).toBe(true);
  });
});

describe("lesson completion persistence", () => {
  it("writes lesson_progress for seeded lessons and awards XP once", async () => {
    stubSupabaseEnv();
    const { client, writes } = fakeClient({});
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => client,
    }));

    const { completeLesson } = await import("@/lib/services/lessons");
    const result = await completeLesson(LESSON_UUID);

    expect(result.completed).toBe(true);
    expect(writes.some((write) => write.table === "lesson_progress" && write.op === "upsert")).toBe(true);
  });
});

describe("mock mode still works with no Supabase env", () => {
  it("serves bundled data without any Supabase client", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { getProfile } = await import("@/lib/services/profile");
    const { getTodayTasks } = await import("@/lib/services/study-plan");
    const { gradePractice } = await import("@/lib/services/practice");

    const profile = await getProfile();
    const tasks = await getTodayTasks();
    const graded = await gradePractice("reading-1", "any answer");

    expect(profile.userId).toBe("mock-user");
    expect(tasks.length).toBeGreaterThan(0);
    expect(graded.saved).toBe(false);
  });
});
