import { serviceResponse, validationError } from "@/lib/validation/api";
import { getProfile, updateProfile } from "@/lib/services/profile";
import { z } from "zod";

export async function GET() {
  return serviceResponse(() => getProfile());
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
  return serviceResponse(() => updateProfile(parsed.data));
}
