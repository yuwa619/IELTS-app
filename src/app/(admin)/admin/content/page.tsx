import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/surface";
import { getAdminContent } from "@/lib/services/admin";

export default async function AdminContentPage() {
  const content = await getAdminContent();
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr_360px]">
      <Card className="space-y-2">
        {["Lessons", "Vocabulary", "Grammar", "Writing prompts", "Speaking prompts", "Mocks"].map((item) => (
          <button className="block min-h-11 w-full rounded-xl px-3 text-left font-semibold hover:bg-[var(--tint)]" key={item}>{item}</button>
        ))}
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lessons</h2>
          <Badge tone="success">{content.lessons.length} live</Badge>
        </div>
        {content.lessons.slice(0, 8).map((lesson) => (
          <div className="grid gap-2 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_90px_90px]" key={lesson.id}>
            <span className="font-semibold">{lesson.title}</span>
            <span className="text-sm text-[var(--text-muted)]">{lesson.skill}</span>
            <Badge tone="success">live</Badge>
          </div>
        ))}
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Edit item</h2>
        <div><Label>Title</Label><Input defaultValue={content.lessons[0]?.title} /></div>
        <div><Label>Summary</Label><Textarea defaultValue={content.lessons[0]?.summary} /></div>
        <Button>Mock save</Button>
      </Card>
    </div>
  );
}
