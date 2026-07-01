import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white p-4 shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function DashboardCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          {title ? <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2> : null}
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "maple" | "success" | "listening" | "reading" | "writing" | "speaking";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[var(--tint)] text-[var(--ink)]",
    maple: "bg-[var(--maple-50)] text-[var(--maple)]",
    success: "bg-[var(--success-50)] text-[var(--success)]",
    listening: "bg-[var(--blue-50)] text-[var(--skill-listening)]",
    reading: "bg-[#E9F5F3] text-[var(--skill-reading)]",
    writing: "bg-[#F0ECF8] text-[var(--skill-writing)]",
    speaking: "bg-[#FBF3E2] text-[var(--skill-speaking)]",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Alert({
  children,
  tone = "info",
  title,
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
}) {
  const map = {
    info: { icon: Info, cls: "border-l-[var(--blue-500)] bg-[var(--blue-50)]" },
    success: { icon: CheckCircle2, cls: "border-l-[var(--success)] bg-[var(--success-50)]" },
    warning: { icon: AlertCircle, cls: "border-l-[var(--warning)] bg-[var(--warning-50)]" },
    danger: { icon: AlertCircle, cls: "border-l-[var(--maple)] bg-[var(--maple-50)]" },
  }[tone];
  const Icon = map.icon;
  return (
    <div className={cn("flex gap-3 rounded-xl border border-[var(--border)] border-l-4 p-3 text-sm text-[var(--ink)]", map.cls)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-[var(--text-muted)]">{children}</div>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  color = "var(--blue-500)",
  ariaLabel,
}: {
  value: number;
  color?: string;
  ariaLabel: string;
}) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-[var(--tint)]"
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

export function SkillMeter({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
        <span className="font-serif text-2xl text-[var(--ink)]">{value.toFixed(1)}</span>
      </div>
      <div className="relative">
        <ProgressBar
          value={(value / 9) * 100}
          color={color}
          ariaLabel={`${label} progress toward target`}
        />
        <span className="absolute top-[-3px] h-4 w-[2px] rounded bg-[var(--ink)]" style={{ left: `${(target / 9) * 100}%` }} />
      </div>
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <Card className="p-3">
      <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">{label}</p>
      <div className="mt-1 font-serif text-3xl text-[var(--ink)]">{value}</div>
      {detail ? <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p> : null}
    </Card>
  );
}

export function Timer({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--navy-700)] px-3 py-1 font-mono text-sm text-white">
      {children}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-8 text-center">
      <Trophy className="h-7 w-7 text-[var(--maple)]" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">{body}</p>
      {action}
    </Card>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading">
      <div className="h-28 animate-pulse rounded-2xl bg-[var(--tint)]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[var(--tint)]" />
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--tint)]" />
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please retry." }: { message?: string }) {
  return (
    <Alert tone="danger" title="We could not load this screen">
      {message}
    </Alert>
  );
}
