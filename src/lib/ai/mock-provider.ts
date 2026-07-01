import { dailyTasks } from "@/lib/mock-data";
import type { AIFeedback, Skill } from "@/types/domain";
import { AI_DISCLAIMER, type AIProvider } from "./provider";
import { refusalMessage, shouldRefuseTutorRequest } from "./guardrails";

function estimateFromLength(text: string, targetWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words < targetWords * 0.5) return { low: 5, high: 5.5 };
  if (words < targetWords) return { low: 5.5, high: 6 };
  if (words > targetWords * 1.8) return { low: 6, high: 6.5 };
  return { low: 6, high: 6.5 };
}

function feedback(low: number, high: number, criteria: Record<string, number>): AIFeedback {
  return {
    band: { low, high, isEstimate: true, disclaimer: AI_DISCLAIMER },
    criteria,
    strengths: ["Clear main purpose and readable organisation.", "Several topic words are used accurately."],
    improvements: ["Control sentence boundaries under time pressure.", "Add more precise evidence instead of broad claims."],
    nextPractice: "Do one focused review: correct two sentence-control issues, then repeat a shorter timed answer.",
  };
}

export class MockAIProvider implements AIProvider {
  async tutorReply(input: { message: string }) {
    if (shouldRefuseTutorRequest(input.message)) {
      return {
        reply: refusalMessage(),
        refused: true,
        isFormative: true as const,
        nextPractice: "Send your own outline or paragraph and I will help improve it.",
      };
    }

    return {
      reply:
        "Start with the task requirement, then choose a framework. For writing, plan purpose, reader, points, and paragraph shape. For speaking, use short cue notes and answer naturally rather than memorising.",
      refused: false,
      isFormative: true as const,
      nextPractice: "Try one timed paragraph, then compare it against one criterion.",
    };
  }

  async gradeGrammar(input: { text: string }) {
    const commaSplicePenalty = input.text.includes(", and") ? 0 : 0.5;
    return feedback(6 - commaSplicePenalty, 6.5 - commaSplicePenalty, {
      grammarAccuracy: 6 - commaSplicePenalty,
      sentenceControl: 5.5,
      punctuation: 6,
    });
  }

  async generateStudyPlan() {
    return dailyTasks;
  }

  async estimateWriting(input: { task: "task1" | "task2"; text: string }) {
    const target = input.task === "task1" ? 150 : 250;
    const band = estimateFromLength(input.text, target);
    return feedback(band.low, band.high, {
      "Task Achievement": band.low + 0.5,
      "Coherence & Cohesion": band.low,
      "Lexical Resource": band.low,
      "Grammatical Range & Accuracy": Math.max(5, band.low - 0.5),
    });
  }

  async estimateSpeaking(input: { durationS: number }) {
    const low = input.durationS < 45 ? 5.5 : 6;
    return feedback(low, low + 0.5, {
      "Fluency & Coherence": low,
      "Lexical Resource": low + 0.5,
      "Grammatical Range & Accuracy": low,
      Pronunciation: low,
    });
  }

  async diagnoseWeakness(input: { skillScores: Record<Skill, number> }) {
    const weakestSkill = Object.entries(input.skillScores).sort((a, b) => a[1] - b[1])[0]?.[0] as Skill;
    return {
      weakestSkill,
      evidence: ["Lowest estimated skill score", "Most open error-log items", "Next plan block targets this skill"],
    };
  }
}
