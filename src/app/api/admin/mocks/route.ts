import { adminUnavailableMessage, canUseMockAdmin } from "@/lib/services/admin-guard";
import { mockAdminSave } from "@/lib/services/admin";
import { getMocks } from "@/lib/services/mocks";
import { fail, ok } from "@/lib/validation/api";

export async function GET() {
  if (!canUseMockAdmin()) return fail("forbidden", adminUnavailableMessage(), 403);
  return ok(await getMocks());
}

export async function POST(request: Request) {
  if (!canUseMockAdmin()) return fail("forbidden", adminUnavailableMessage(), 403);
  return ok(await mockAdminSave(await request.json()));
}
