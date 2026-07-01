import { getMocks } from "@/lib/services/mocks";
import { ok } from "@/lib/validation/api";

export async function GET() {
  return ok(await getMocks());
}
