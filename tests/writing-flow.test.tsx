import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerRefresh = vi.fn();

beforeEach(() => {
  vi.doMock("next/navigation", () => ({
    useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const prompt = {
  id: "writing-1",
  task: "task1" as const,
  title: "Complaint to a property manager",
  prompt: "Your apartment heating has stopped working.",
  bullets: ["explain the problem"],
  type: "complaint",
  published: true,
};

describe("Writing practice flow", () => {
  it("counts the Task 1 timer down from 20:00 and warns near the end", async () => {
    vi.useFakeTimers();
    const { WritingPractice } = await import("@/components/writing/WritingPractice");
    render(<WritingPractice prompt={prompt} />);

    expect(screen.getByRole("timer")).toHaveTextContent("20:00");
    await act(async () => {
      vi.advanceTimersByTime(61_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("18:59");

    // Jump to under five minutes: warning state (aria-live polite).
    await act(async () => {
      vi.advanceTimersByTime(15 * 60_000);
    });
    expect(screen.getByRole("timer")).toHaveAttribute("aria-live", "polite");

    // Past the limit: expired but the editor still works.
    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent(/time is up/i);
    expect(screen.getByLabelText(/writing editor/i)).toBeInTheDocument();
  });

  it("uses a 40:00 limit for Task 2", async () => {
    vi.useFakeTimers();
    const { WritingPractice } = await import("@/components/writing/WritingPractice");
    render(<WritingPractice prompt={{ ...prompt, task: "task2", bullets: [] }} />);
    expect(screen.getByRole("timer")).toHaveTextContent("40:00");
  });

  it("submits timing metadata and shows the completion panel with next actions", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/writing/attempts") {
        const body = JSON.parse(String(init?.body));
        expect(body.timeLimitSeconds).toBe(1200);
        expect(typeof body.startedAt).toBe("string");
        expect(body.overTime).toBe(false);
        return {
          ok: true,
          json: async () => ({
            data: {
              saved: true,
              estimate: {
                criteria: { "Task Achievement": 6 },
                band: { low: 5.5, high: 6, isEstimate: true, disclaimer: "d" },
              },
            },
          }),
        };
      }
      return { ok: true, json: async () => ({ data: {} }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    const { WritingPractice } = await import("@/components/writing/WritingPractice");
    render(
      <WritingPractice
        prompt={prompt}
        nextPromptHref="/practice/writing/task-1?p=1"
      />,
    );

    await user.type(
      screen.getByLabelText(/writing editor/i),
      "Dear manager, the heating in my flat has failed and the repair is urgent for my family.",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /submit for feedback/i }));

    expect(await screen.findByText(/writing attempt complete/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /try another prompt/i })).toHaveAttribute(
      "href",
      "/practice/writing/task-1?p=1",
    );
    expect(screen.getByRole("link", { name: /today's plan/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /progress/i })).toBeInTheDocument();
    expect(screen.getByText(/saved to your account/i)).toBeInTheDocument();
  });

  it("allows submission after time expires and flags it as over-time", async () => {
    vi.useFakeTimers();
    const captured: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        captured.push(JSON.parse(String(init?.body)));
        return {
          ok: true,
          json: async () => ({
            data: {
              saved: true,
              estimate: {
                criteria: {},
                band: { low: 5, high: 5.5, isEstimate: true, disclaimer: "d" },
              },
            },
          }),
        };
      }),
    );

    const { WritingPractice } = await import("@/components/writing/WritingPractice");
    render(<WritingPractice prompt={prompt} />);

    await act(async () => {
      vi.advanceTimersByTime(21 * 60_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent(/time is up/i);

    // Countdown is already expired; return to real timers so fetch + waitFor run.
    vi.useRealTimers();

    fireEvent.change(screen.getByLabelText(/writing editor/i), {
      target: {
        value:
          "Dear manager, this answer arrives after the timer expired but must still submit correctly.",
      },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit for feedback/i }));
    });

    expect(await screen.findByText(/submitted over time/i)).toBeInTheDocument();
    expect(captured[0].overTime).toBe(true);
  });
});

describe("CompletionActionPanel task integration", () => {
  it("marks a Today task complete exactly once", async () => {
    const fetchMock = vi.fn((...args: [string, RequestInit?]) => {
      void args;
      return Promise.resolve({ ok: true, json: async () => ({ data: {} }) });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { CompletionActionPanel } = await import(
      "@/components/practice/CompletionActionPanel"
    );
    const { rerender } = render(
      <CompletionActionPanel title="Done" taskId="task-9" />,
    );
    rerender(<CompletionActionPanel title="Done" taskId="task-9" />);

    expect(await screen.findByText(/task marked complete/i)).toBeInTheDocument();
    const completeCalls = fetchMock.mock.calls.filter(
      (call) => call[0] === "/api/tasks/complete",
    );
    expect(completeCalls).toHaveLength(1);
  });
});
