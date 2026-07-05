import { saveLessonKeyPoint } from "@/lib/services/revision";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

const schema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200),
  note: z.string().min(1).max(600),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  const { lessonId, title, note } = parsed.data;
  return serviceResponse(() => saveLessonKeyPoint(lessonId, title, note));
}
