import { getDueRevision, gradeRevision } from "@/lib/services/revision";
import { ok, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function GET() {
  return ok(await getDueRevision());
}

export async function POST(request: Request) {
  const parsed = z.object({ itemId: z.string(), grade: z.enum(["again", "hard", "good", "easy"]) }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(await gradeRevision(parsed.data.itemId, parsed.data.grade));
}
