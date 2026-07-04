import { getDueRevision, gradeRevision } from "@/lib/services/revision";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function GET() {
  return serviceResponse(() => getDueRevision());
}

export async function POST(request: Request) {
  const parsed = z.object({ itemId: z.string(), grade: z.enum(["again", "hard", "good", "easy"]) }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => gradeRevision(parsed.data.itemId, parsed.data.grade));
}
