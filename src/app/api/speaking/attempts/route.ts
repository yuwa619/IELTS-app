import { submitSpeaking } from "@/lib/services/speaking";
import { ok, validationError } from "@/lib/validation/api";
import { speakingAttemptSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = speakingAttemptSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await submitSpeaking(parsed.data));
}
