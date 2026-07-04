// Attempt rows carry uuid foreign keys to seeded content. When the app is
// serving bundled fallback content (content tables not seeded yet), refs are
// not uuids — store them inside the jsonb payload instead and leave the FK
// null so the write still succeeds.
export function isUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  );
}
