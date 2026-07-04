import { generateStudyPlan, getStudyPlan, getTodayTasks } from "@/lib/services/study-plan";
import { serviceResponse } from "@/lib/validation/api";

export async function GET() {
  return serviceResponse(async () => ({
    plan: await getStudyPlan(),
    today: await getTodayTasks(),
  }));
}

export async function POST() {
  return serviceResponse(() => generateStudyPlan());
}
