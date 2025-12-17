// frontend/components/content/pq/MyResultDetail.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/config";

type Participant = {
  id: number;
  session: number;
  user: number | null;
  guest_name: string;
  display_name: string;
  joined_at: string;
  last_active_at: string;
  completed: boolean;
};

type Answer = {
  id: number;
  participant: number;
  question: number;
  question_text: string;
  selected_option: "A" | "B" | "C" | "D";
  time_taken_seconds: number;
  submitted_at: string;
  within_time: boolean;
  score: number;
};

type ResultResponse = {
  participant: Participant;
  answers: Answer[];
};

export function MyResultDetail({ participantId }: { participantId: number }) {
  const [data, setData] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await authFetch(`/api/pq/my/results/${participantId}/`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || "Failed to load result");
        }

        const json = (await res.json()) as ResultResponse;
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [participantId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading result…</p>;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600">
        {error || "Could not load this result."}
      </p>
    );
  }

  const { participant, answers } = data;

  const joined = new Date(participant.joined_at).toLocaleString();
  const lastActive = new Date(participant.last_active_at).toLocaleString();

  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const totalQuestions = answers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Quiz run – Session #{participant.session}
          </h1>
          <p className="text-sm text-gray-600">
            For: {participant.display_name || "You"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Joined: {joined} • Last active: {lastActive}
          </p>
        </div>
        <div className="text-right space-y-1">
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
              (participant.completed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700")
            }
          >
            {participant.completed ? "Completed" : "In progress"}
          </span>
          <p className="text-xs text-gray-600">
            Score: {totalScore} / {totalQuestions}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Question</th>
              <th className="px-3 py-2 text-left">Your answer</th>
              <th className="px-3 py-2 text-left">Time (s)</th>
              <th className="px-3 py-2 text-left">Within limit</th>
              <th className="px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((ans, idx) => (
              <tr
                key={ans.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/80"}
              >
                <td className="px-3 py-2 align-top text-xs text-gray-500">
                  {idx + 1}
                </td>
                <td className="px-3 py-2 align-top">
                  <p className="text-sm font-medium">{ans.question_text}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Submitted:{" "}
                    {new Date(ans.submitted_at).toLocaleString()}
                  </p>
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    {ans.selected_option}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-xs text-gray-700">
                  {ans.time_taken_seconds.toFixed(1)}
                </td>
                <td className="px-3 py-2 align-top text-xs">
                  {ans.within_time ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Late
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-xs text-gray-800">
                  {ans.score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <Link
          href="/me/results"
          className="text-xs text-blue-600 hover:underline"
        >
          ← Back to my quiz history
        </Link>
      </div>
    </div>
  );
}
