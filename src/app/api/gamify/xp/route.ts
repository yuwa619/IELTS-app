import { getGamifySummary } from "@/lib/services/gamify";
import { serviceResponse } from "@/lib/validation/api";

export async function GET() {
  return serviceResponse(() => getGamifySummary());
}
