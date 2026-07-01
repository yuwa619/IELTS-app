import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-xl border-[1.5px] border-[var(--border)] bg-white px-4 text-base text-[var(--ink)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--navy-700)] focus:ring-4 focus:ring-[rgba(27,43,74,.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-48 w-full resize-y rounded-2xl border-[1.5px] border-[var(--border)] bg-white px-4 py-3 text-base leading-7 text-[var(--ink)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--navy-700)] focus:ring-4 focus:ring-[rgba(27,43,74,.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cn(
        "min-h-12 w-full rounded-xl border-[1.5px] border-[var(--border)] bg-white px-4 text-base text-[var(--ink)] outline-none focus:border-[var(--navy-700)] focus:ring-4 focus:ring-[rgba(27,43,74,.10)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn(
        "text-xs font-semibold uppercase tracking-normal text-[var(--text-muted)]",
        className,
      )}
      {...props}
    />
  );
}
