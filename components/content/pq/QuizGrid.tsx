// frontend/components/content/pq/QuizGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/config";
import { useRouter } from "next/navigation";

type Quiz = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  owner_username?: string;
};

export function QuizGrid() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await authFetch("/api/pq/quizzes/");
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data = (await res.json()) as Quiz[];
        const published = data.filter((q) => q.status === "published");
        setQuizzes(published);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading quizzes…
      </p>
    );
  }

  if (quizzes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No published quizzes yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {quizzes.map((quiz) => (
        <button
          key={quiz.id}
          onClick={() => router.push(`/quizzes/${quiz.id}`)}
          className="group text-left rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                {quiz.title}
              </h2>
              {quiz.owner_username && (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  by {quiz.owner_username}
                </p>
              )}
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {quiz.category || "General"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {quiz.description || "No description provided."}
          </p>
          <div className="flex items-center justify-between text-[11px] text-emerald-700">
            <span className="inline-flex items-center gap-1 font-medium">
              View &amp; host quiz
              <span className="translate-y-[1px]">→</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Real-time ready
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
