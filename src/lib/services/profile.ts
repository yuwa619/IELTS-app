import { mockGoal, mockTarget, mockUser } from "@/lib/mock-data";

export async function getProfile() {
  return mockUser;
}

export async function getGoal() {
  return mockGoal;
}

export async function getTarget() {
  return mockTarget;
}
