// frontend/components/content/pq/MyResultsList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/config";

type ParticipantSession = {
  id: number;
  session: number;
  user: number | null;
  guest_name: string;
  display_name: string;
  joined_at: string;
  last_active_at: string;
  completed: boolean;
};

export function MyResultsList() {
  const [items, setItems] = useState<ParticipantSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await authFetch("/api/pq/my/results/");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to load results");
        }

        const data = (await res.json()) as ParticipantSession[];
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading your quiz history…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error || "Could not load your quiz history."}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You haven&apos;t taken any real-time quizzes yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((ps) => {
        const joined = new Date(ps.joined_at).toLocaleString();
        const lastActive = new Date(ps.last_active_at).toLocaleString();

        return (
          <Link
            key={ps.id}
            href={`/me/results/${ps.id}`}
            className="block rounded-2xl border bg-white/80 px-4 py-3 text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div>
                <p className="font-semibold">
                  Session #{ps.session} – {ps.display_name || "You"}
                </p>
                <p className="text-[11px] text-gray-500">
                  Joined: {joined} • Last active: {lastActive}
                </p>
              </div>
              <span
                className={
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                  (ps.completed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700")
                }
              >
                {ps.completed ? "Completed" : "In progress"}
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              Click to see your answers and timings for this run.
            </p>
          </Link>
        );
      })}
    </div>
  );
}
