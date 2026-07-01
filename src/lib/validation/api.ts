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
