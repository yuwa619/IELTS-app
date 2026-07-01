import { getProgress } from "@/lib/services/progress";
import { ok } from "@/lib/validation/api";

export async function GET() {
  return ok(await getProgress());
}
