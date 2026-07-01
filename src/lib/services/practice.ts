import { grammarItems, practiceQuestions, vocabularyItems } from "@/lib/mock-data";

export async function getPracticeQuestions(skill?: "listening" | "reading") {
  return skill ? practiceQuestions.filter((question) => question.skill === skill) : practiceQuestions;
}

export async function getVocabulary() {
  return vocabularyItems;
}

export async function getGrammar() {
  return grammarItems;
}

export async function gradePractice(questionId: string, response: string) {
  const question = practiceQuestions.find((item) => item.id === questionId);
  const expected = Array.isArray(question?.answerKey.answer)
    ? question.answerKey.answer[0]
    : question?.answerKey.answer;
  return {
    isCorrect: response.trim().toLowerCase() === String(expected ?? "").trim().toLowerCase(),
    expected,
    explanation: question?.explanation ?? "Review the explanation and try again.",
  };
}
