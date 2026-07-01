import { getDiagnosticResult, getDiagnosticSet } from "@/lib/services/diagnostic";
import { ok } from "@/lib/validation/api";

export async function GET() {
  return ok(await getDiagnosticSet());
}

export async function POST() {
  return ok(await getDiagnosticResult());
}
