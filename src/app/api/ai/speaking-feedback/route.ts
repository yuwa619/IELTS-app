import { getAIProvider } from "@/lib/ai";
import { ok, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z.object({ durationS: z.number().min(1), selfRating: z.record(z.string(), z.number()).optional() }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await getAIProvider().estimateSpeaking(parsed.data));
}
