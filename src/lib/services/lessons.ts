import { lessons } from "@/lib/mock-data";

export async function getLessons() {
  return lessons;
}

export async function getLesson(idOrSlug: string) {
  return lessons.find((lesson) => lesson.id === idOrSlug || lesson.slug === idOrSlug) ?? lessons[0];
}
