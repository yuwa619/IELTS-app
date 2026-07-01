import { z } from "zod";

export const onboardingSchema = z.object({
  goalMode: z.enum(["eligible", "crs", "unsure"]),
  targetClb: z.number().int().min(7).max(10),
  testDate: z.string().nullable().optional(),
  confidence: z.number().int().min(1).max(5),
  dailyMinutes: z.number().int().min(10).max(90),
});

export const writingAttemptSchema = z.object({
  promptId: z.string().min(1),
  text: z.string().min(20),
  timeMs: z.number().int().min(0),
});

export const speakingAttemptSchema = z.object({
  promptId: z.string().min(1),
  path: z.string().optional(),
  durationS: z.number().min(1),
  selfRating: z.record(z.string(), z.number()).optional(),
});

export const tutorSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.string().max(2000).optional(),
});
