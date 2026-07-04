import { submitMockAttempt } from "@/lib/services/mocks";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const schema = z.object({
    mockId: z.string().min(1),
    answers: z.record(z.string(), z.string()),
  });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => submitMockAttempt(parsed.data.mockId, parsed.data.answers));
}
