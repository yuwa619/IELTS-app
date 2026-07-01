import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3 font-semibold text-[var(--ink)] focus-visible:cb-focus">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[var(--navy-700)]">
        <span className="absolute right-[-3px] top-1 h-4 w-3 rounded-r-full bg-[var(--maple)]" />
      </span>
      <span className="text-xl tracking-tight">Clearband</span>
    </Link>
  );
}
