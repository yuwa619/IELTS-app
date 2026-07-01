import {
  errorLogs,
  mockExam,
  practiceQuestions,
  speakingPrompts,
  writingPrompts,
} from "@/lib/mock-data";

export async function getMocks() {
  return [mockExam];
}

export async function getMock(id: string) {
  return id === mockExam.id ? mockExam : mockExam;
}

export async function getMockRunner(id: string) {
  const mock = await getMock(id);
  return {
    mock,
    practiceQuestions,
    writingPrompts,
    speakingPrompts,
    errorLogs,
    result: await submitMock(),
  };
}

export async function submitMock() {
  return {
    overall: 6,
    clb: 7,
    skills: { listening: 6.5, reading: 6, writing: 5.5, speaking: 6 },
    recommendation: "Writing is holding your overall back. Spend this week on sentence control, then retake a half mock.",
  };
}
