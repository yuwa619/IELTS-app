import { awardXp, getGamifySummary } from "@/lib/services/gamify";
import { ok, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function GET() {
  return ok(await getGamifySummary());
}

export async function POST(request: Request) {
  const parsed = z.object({ sourceType: z.string(), sourceId: z.string(), amount: z.number().int().min(0) }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok(awardXp(parsed.data.sourceType, parsed.data.sourceId, parsed.data.amount));
}
