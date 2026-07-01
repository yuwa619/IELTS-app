import { grammarItems, lessons, mockExam, practiceQuestions, speakingPrompts, vocabularyItems, writingPrompts } from "@/lib/mock-data";

export async function getAdminSummary() {
  return {
    lessons: lessons.length,
    practiceQuestions: practiceQuestions.length,
    vocabulary: vocabularyItems.length,
    grammar: grammarItems.length,
    writingPrompts: writingPrompts.length,
    speakingPrompts: speakingPrompts.length,
    mocks: 1,
  };
}

export async function getAdminContent() {
  return { lessons, vocabularyItems, grammarItems, writingPrompts, speakingPrompts, mockExam };
}

export async function getAdminQuestions() {
  return practiceQuestions;
}

export async function mockAdminSave<T>(payload: T) {
  return { saved: true, payload };
}
