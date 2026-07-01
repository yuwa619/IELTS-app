"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesColumn, Home, Layers3, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Study", href: "/today", icon: BookOpen },
  { label: "Practice", href: "/practice/listening", icon: Target },
  { label: "Progress", href: "/progress", icon: ChartNoAxesColumn },
  { label: "You", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/practice/speaking") || pathname.startsWith("/mocks/")) {
    return null;
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/96 px-2 backdrop-blur lg:hidden" aria-label="Primary">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-[var(--text-muted)] focus-visible:cb-focus",
                active && "text-[var(--navy-700)]",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[230px] flex-col bg-[var(--navy-700)] p-5 text-white lg:flex">
      <Link href="/dashboard" className="flex items-center gap-3 focus-visible:cb-focus">
        <span className="relative inline-flex h-9 w-9 rounded-full border-[3px] border-white">
          <span className="absolute right-[-3px] top-1 h-4 w-3 rounded-r-full bg-[var(--maple)]" />
        </span>
        <span className="text-xl font-semibold">Clearband</span>
      </Link>
      <nav className="mt-8 space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/72 focus-visible:cb-focus",
                active && "bg-white/12 text-white",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/15 bg-white/10 p-4">
        <p className="text-xs uppercase text-white/60">Target</p>
        <p className="mt-1 font-serif text-3xl">CLB 9</p>
        <p className="mt-2 font-mono text-xs text-white/70">Test in 38 days</p>
      </div>
    </aside>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const items = [
    { label: "Overview", href: "/admin" },
    { label: "Content", href: "/admin/content" },
    { label: "Questions", href: "/admin/questions" },
    { label: "Mocks", href: "/admin/mocks" },
  ];
  return (
    <nav className="flex gap-2 overflow-x-auto" aria-label="Admin">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)]",
            pathname === item.href && "bg-[var(--navy-700)] text-white",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function SectionIcon({ label }: { label: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tint)] text-sm font-bold text-[var(--navy-700)]">
      <Layers3 className="h-4 w-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
