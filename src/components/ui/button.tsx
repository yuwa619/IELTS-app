import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--navy-700)] text-white hover:bg-[var(--navy-600)]",
  secondary: "bg-[var(--tint)] text-[var(--ink)] hover:bg-[#E4E8F0]",
  outline:
    "border border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--navy-700)]",
  ghost: "text-[var(--navy-700)] hover:bg-[var(--tint)]",
  danger: "bg-[var(--maple)] text-white hover:bg-[#A9352D]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-[15px]",
  lg: "min-h-14 px-6 text-base",
};

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-40 focus-visible:cb-focus",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  icon,
  children,
  href,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:cb-focus",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}
