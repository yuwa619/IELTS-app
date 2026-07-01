import { ok, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z.object({ promptId: z.string(), contentType: z.string().default("audio/webm") }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return ok({
    uploadUrl: null,
    path: `speaking/mock-user/mock-${parsed.data.promptId}.webm`,
    todo: "Configure Supabase Storage signed uploads before live audio persistence.",
  });
}
