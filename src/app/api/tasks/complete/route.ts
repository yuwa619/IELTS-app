import { completeTask } from "@/lib/services/study-plan";
import { serviceResponse, validationError } from "@/lib/validation/api";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z.object({ taskId: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);
  return serviceResponse(() => completeTask(parsed.data.taskId));
}
