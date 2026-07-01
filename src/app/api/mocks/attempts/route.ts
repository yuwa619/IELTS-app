import { submitMock } from "@/lib/services/mocks";
import { ok } from "@/lib/validation/api";

export async function POST() {
  return ok(await submitMock());
}
