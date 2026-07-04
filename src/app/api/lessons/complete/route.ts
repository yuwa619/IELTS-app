import { completeLesson } from "@/lib/services/lessons";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z.object({ lessonId: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => completeLesson(parsed.data.lessonId));
}
