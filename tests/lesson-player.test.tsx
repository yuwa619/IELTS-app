import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lesson } from "@/types/domain";

const routerRefresh = vi.fn();

beforeEach(() => {
  vi.doMock("next/navigation", () => ({
    useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.restoreAllMocks();
});

const lesson: Lesson & { completed?: boolean } = {
  id: "lesson-7",
  title: "Listening prediction and signposting",
  slug: "listening-prediction-and-signposting",
  module: "Listening",
  skill: "listening",
  summary: "Predict answer types.",
  estMinutes: 12,
  order: 2,
  published: true,
  moduleType: "shared",
  difficulty: 2,
  clbFocus: "CLB 7+",
  completed: false,
  sections: [
    { id: "s1", lessonId: "lesson-7", order: 1, kind: "intro", heading: "Why this matters", body: "You hear the recording once." },
    { id: "s2", lessonId: "lesson-7", order: 2, kind: "objectives", heading: "You will learn", body: "", data: { items: ["Predict answer types", "Track corrections"] } },
    { id: "s3", lessonId: "lesson-7", order: 3, kind: "explanation", heading: "Prediction", body: "Every gap tells you something." },
    { id: "s4", lessonId: "lesson-7", order: 4, kind: "gt_relevance", heading: "In the GT exam", body: "Parts 1 and 2 are everyday contexts." },
    { id: "s5", lessonId: "lesson-7", order: 5, kind: "example", heading: "Example one", body: "A booking form.", data: { sample: "Class starts: ____", note: "Predict a day." } },
    { id: "s6", lessonId: "lesson-7", order: 6, kind: "mistake", heading: "Common mistake", body: "Writing the first plausible answer." },
    { id: "s7", lessonId: "lesson-7", order: 7, kind: "strategy", heading: "Routine", body: "", data: { items: ["Read ahead", "Type-code gaps"] } },
    {
      id: "s8", lessonId: "lesson-7", order: 8, kind: "guided_practice", heading: "Try it", body: "Predict first.",
      data: { task: "Type-code these gaps.", modelAnswer: "1) Number. 2) Place name." },
    },
    {
      id: "s9", lessonId: "lesson-7", order: 9, kind: "quick_check", heading: "Quick check 1",
      body: "You hear a correction. What do you write?",
      data: { options: ["14th", "15th"], answer: "15th", explanation: "Corrections replace the first answer." },
    },
    {
      id: "s10", lessonId: "lesson-7", order: 10, kind: "key_point", heading: "Remember this", body: "",
      data: { keyPoint: "Type-code every gap before the audio starts." },
    },
    {
      id: "s11", lessonId: "lesson-7", order: 11, kind: "next_step", heading: "Next step", body: "Apply it now.",
      data: { nextHref: "/practice/listening", nextLabel: "Start Listening practice" },
    },
  ],
};

async function renderPlayer(props: Partial<Parameters<typeof import("@/components/lessons/LessonPlayer")["LessonPlayer"]>[0]> = {}) {
  const { LessonPlayer } = await import("@/components/lessons/LessonPlayer");
  return render(
    <LessonPlayer
      lesson={lesson}
      taskId={null}
      nextLesson={{ id: "lesson-11", title: "Distractors and speaker corrections" }}
      {...props}
    />,
  );
}

describe("LessonPlayer", () => {
  it("renders all section kinds as a full teaching module", async () => {
    await renderPlayer();
    // Headings also appear in the desktop outline rail, hence role-scoped queries.
    expect(screen.getByRole("heading", { name: "Why this matters" })).toBeInTheDocument();
    expect(screen.getByText("Predict answer types")).toBeInTheDocument(); // objectives item
    expect(screen.getByText("IELTS GT relevance")).toBeInTheDocument(); // gt_relevance label
    expect(screen.getByText("Class starts: ____")).toBeInTheDocument(); // example sample
    expect(screen.getAllByText("Common mistake").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Type-code gaps")).toBeInTheDocument(); // strategy item
    expect(screen.getByRole("heading", { name: "Quick check 1" })).toBeInTheDocument();
    expect(screen.getByText(/Type-code every gap before the audio/)).toBeInTheDocument();
    // 2 activities tracked: 1 quick check + 1 guided practice
    expect(screen.getByText("0/2 activities")).toBeInTheDocument();
    // Outline rail lists every section
    expect(within(screen.getByRole("navigation", { name: "Lesson outline" })).getAllByRole("link").length).toBe(11);
  });

  it("quick check: select, submit, get feedback, progress updates", async () => {
    const user = userEvent.setup();
    await renderPlayer();

    await user.click(screen.getByRole("radio", { name: "15th" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Corrections replace the first answer.")).toBeInTheDocument();
    expect(screen.getByText("1/2 activities")).toBeInTheDocument();
  });

  it("quick check: wrong answer reveals the correct one", async () => {
    const user = userEvent.setup();
    await renderPlayer();

    await user.click(screen.getByRole("radio", { name: "14th" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Answer: 15th")).toBeInTheDocument();
  });

  it("guided practice reveals the model approach and counts toward progress", async () => {
    const user = userEvent.setup();
    await renderPlayer();

    expect(screen.queryByText(/1\) Number\./)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show model approach" }));
    expect(screen.getByText(/1\) Number\./)).toBeInTheDocument();
    expect(screen.getByText("1/2 activities")).toBeInTheDocument();
  });

  it("save key point posts to the API and confirms", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { saved: true } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await renderPlayer();

    await user.click(screen.getByRole("button", { name: "Save key point" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/revision/key-point",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.lessonId).toBe("lesson-7");
    expect(body.note).toContain("Type-code every gap");
    expect(await screen.findByText(/Saved — it will appear in your review queue/)).toBeInTheDocument();
  });

  it("mark complete posts, shows XP, and offers next actions (no dead end)", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { lessonId: "lesson-7", completed: true, xpAwarded: 30 } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await renderPlayer();

    await user.click(screen.getByRole("button", { name: "Mark complete" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lessons/complete",
      expect.objectContaining({ method: "POST" }),
    );
    const panel = await screen.findByText("Lesson complete");
    expect(panel).toBeInTheDocument();
    expect(screen.getByText("+30 XP")).toBeInTheDocument();
    // Primary continue-to-practice action comes from the lesson's next_step
    // (also present in the next_step section, hence getAllByRole)
    const practiceLinks = screen.getAllByRole("link", { name: /Start Listening practice/ });
    expect(practiceLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of practiceLinks) expect(link).toHaveAttribute("href", "/practice/listening");
    expect(screen.getByRole("link", { name: /Next lesson: Distractors/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Today" })).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: "Go to Progress" })).toHaveAttribute("href", "/progress");
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("completing from Today also completes the daily task", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { xpAwarded: 30 } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await renderPlayer({ taskId: "task-2" });

    await user.click(screen.getByRole("button", { name: "Mark complete" }));
    await screen.findByText("Lesson complete");

    const taskCall = fetchMock.mock.calls.find(([url]) => url === "/api/tasks/complete");
    expect(taskCall).toBeTruthy();
    expect(JSON.parse(taskCall![1].body).taskId).toBe("task-2");
  });

  it("already-completed lessons show completion actions, not a dead Mark complete", async () => {
    await renderPlayer({ lesson: { ...lesson, completed: true } });
    expect(screen.getByText("You've completed this lesson")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark complete" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Start Listening practice/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: "Next lesson" })).toBeInTheDocument();
  });

  it("shows a completion error without losing the page", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Could not save." } }), { status: 500 }),
      ),
    );
    await renderPlayer();

    await user.click(screen.getByRole("button", { name: "Mark complete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save.");
    expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
  });
});
