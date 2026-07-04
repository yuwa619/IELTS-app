import { submitSpeaking } from "@/lib/services/speaking";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { speakingAttemptSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = speakingAttemptSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => submitSpeaking(parsed.data));
}
