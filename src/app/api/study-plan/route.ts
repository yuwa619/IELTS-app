import { getStudyPlan, getTodayTasks } from "@/lib/services/study-plan";
import { ok } from "@/lib/validation/api";

export async function GET() {
  return ok({ plan: await getStudyPlan(), today: await getTodayTasks() });
}

export async function POST() {
  return ok(await getStudyPlan());
}
