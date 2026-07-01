import { getAIProvider } from "@/lib/ai";
import { getWritingPrompts } from "@/lib/services/writing";
import { ok, validationError } from "@/lib/validation/api";
import { writingAttemptSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = writingAttemptSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  const prompts = await getWritingPrompts();
  const task =
    prompts.find((prompt) => prompt.id === parsed.data.promptId)?.task ?? "task1";
  return ok(await getAIProvider().estimateWriting({ task, text: parsed.data.text }));
}
