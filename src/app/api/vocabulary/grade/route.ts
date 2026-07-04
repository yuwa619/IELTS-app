import { gradeVocabulary } from "@/lib/services/practice";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z
    .object({ itemId: z.string().min(1), grade: z.enum(["again", "hard", "good", "easy"]) })
    .safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => gradeVocabulary(parsed.data.itemId, parsed.data.grade));
}
