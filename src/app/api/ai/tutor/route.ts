import { getAIProvider } from "@/lib/ai";
import { ok, validationError } from "@/lib/validation/api";
import { tutorSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = tutorSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await getAIProvider().tutorReply(parsed.data));
}
