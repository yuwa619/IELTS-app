import { submitWriting } from "@/lib/services/writing";
import { ok, validationError } from "@/lib/validation/api";
import { writingAttemptSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = writingAttemptSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await submitWriting(parsed.data));
}
