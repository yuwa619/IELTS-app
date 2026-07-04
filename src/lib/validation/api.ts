import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function validationError(error: ZodError) {
  return fail("validation_error", error.issues[0]?.message ?? "Invalid request.", 400);
}

// Wrap a service call so ServiceError maps to its HTTP status and unexpected
// failures surface as a clear 500 instead of pretending the write succeeded.
export async function serviceResponse<T>(run: () => Promise<T>) {
  try {
    return ok(await run());
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (err.code && err.status) {
      return fail(err.code, err.message ?? "Request failed.", err.status);
    }
    console.error("[clearband-api]", err.message ?? error);
    return fail(
      "write_failed",
      "We could not save this to your account. Please retry — your progress was NOT saved.",
      500,
    );
  }
}
