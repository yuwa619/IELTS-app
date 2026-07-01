import { ok, validationError } from "@/lib/validation/api";
import { getProfile } from "@/lib/services/profile";
import { z } from "zod";

export async function GET() {
  return ok(await getProfile());
}

export async function PATCH(request: Request) {
  const schema = z.object({
    displayName: z.string().min(1).optional(),
    dailyMinutes: z.number().int().min(10).max(90).optional(),
    consentAudio: z.boolean().optional(),
    consentSamples: z.boolean().optional(),
  });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok({ ...(await getProfile()), ...parsed.data });
}
