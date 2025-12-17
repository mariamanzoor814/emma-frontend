// frontend/app/quizzes/page.tsx
import { QuizGrid } from "@/components/content/pq/QuizGrid";

export default function QuizzesPage() {
  return (
    <main className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Discover quizzes</h1>
        <p className="text-gray-600 text-sm max-w-2xl">
          Browse published quizzes created by EMMA and other hosts. You can take them at
          your own pace or host a live session for your classroom or local chapter.
        </p>
      </header>

      <QuizGrid />
    </main>
  );
}
