import type { AIFeedback, DailyTask, Skill } from "@/types/domain";

export const AI_DISCLAIMER =
  "This is an estimated practice score, not an official IELTS score.";

export interface TutorReply {
  reply: string;
  refused: boolean;
  isFormative: true;
  nextPractice: string;
}

export interface AIProvider {
  tutorReply(input: { message: string; context?: string }): Promise<TutorReply>;
  gradeGrammar(input: { text: string }): Promise<AIFeedback>;
  generateStudyPlan(input: { targetClb: number; dailyMinutes: number; weakestSkill: Skill }): Promise<DailyTask[]>;
  estimateWriting(input: { task: "task1" | "task2"; text: string }): Promise<AIFeedback>;
  estimateSpeaking(input: { durationS: number; selfRating?: Record<string, number> }): Promise<AIFeedback>;
  diagnoseWeakness(input: { skillScores: Record<Skill, number> }): Promise<{ weakestSkill: Skill; evidence: string[] }>;
}
