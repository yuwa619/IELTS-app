import { dailyTasks, studyPlan } from "@/lib/mock-data";

export async function getStudyPlan() {
  return studyPlan;
}

export async function getTodayTasks() {
  return dailyTasks;
}
