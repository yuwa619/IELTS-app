import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/layout/shells";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";

export default function LandingPage() {
  return (
    <MarketingShell>
      <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <h1 className="max-w-2xl font-serif text-5xl leading-[1.02] text-[var(--ink)] sm:text-6xl">
            Know your band. Reach your CLB. Land in Canada.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[var(--text-muted)]">
            IELTS General Training prep built around one question: what should you study today to hit your Express Entry score?
          </p>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {[
              ["10 min", "to a plan"],
              ["CLB 7-10", "target modes"],
              ["4 skills", "tracked daily"],
            ].map(([value, label]) => (
              <Card className="p-3 text-center" key={value}>
                <p className="font-serif text-3xl">{value}</p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-3 sm:flex">
            <ButtonLink href="/login" size="lg" icon={<ArrowRight className="h-4 w-4" />}>Create free account</ButtonLink>
            <ButtonLink href="/login" variant="outline" size="lg">I already have an account</ButtonLink>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Free diagnostic. No card required. Not affiliated with or endorsed by IELTS.</p>
        </div>
        <Card className="space-y-5 border-2 border-[var(--navy-700)] p-5">
          <Badge tone="maple">Diagnostic → Plan</Badge>
          <h2 className="font-serif text-4xl">Today&apos;s path</h2>
          {["Canada CLB target", "Short diagnostic", "4-block daily plan", "Revision queue"].map((item) => (
            <div className="flex items-center gap-3" key={item}>
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
              <span className="font-semibold">{item}</span>
            </div>
          ))}
        </Card>
      </section>
    </MarketingShell>
  );
}
