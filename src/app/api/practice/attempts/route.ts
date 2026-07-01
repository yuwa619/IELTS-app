import { gradePractice } from "@/lib/services/practice";
import { ok, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const schema = z.object({ questionId: z.string(), response: z.string(), timeMs: z.number().int().min(0).optional() });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await gradePractice(parsed.data.questionId, parsed.data.response));
}
