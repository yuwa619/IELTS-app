import { getLessons } from "@/lib/services/lessons";
import { ok } from "@/lib/validation/api";

export async function GET() {
  return ok(await getLessons());
}
