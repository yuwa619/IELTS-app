import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand";
import { AdminNav, DesktopSidebar, MobileNav } from "@/components/layout/navigation";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between">
          <BrandMark />
        </header>
        {children}
      </div>
    </main>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-5">
      <div className="mx-auto max-w-md">
        <BrandMark />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <DesktopSidebar />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6 lg:ml-[230px] lg:w-[calc(100%-230px)] lg:max-w-none lg:px-8 lg:pb-10">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-[var(--navy-700)] p-5 text-white lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-white/70">Clearband admin</p>
            <h1 className="font-serif text-3xl">Content dashboard</h1>
          </div>
          <AdminNav />
        </div>
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="font-mono text-xs text-[var(--text-muted)]">{eyebrow}</p> : null}
        <h1 className="mt-1 font-serif text-[28px] leading-[34px] text-[var(--ink)]">{title}</h1>
      </div>
      {action}
    </header>
  );
}
