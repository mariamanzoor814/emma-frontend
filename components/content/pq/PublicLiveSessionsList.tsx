"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/config";

type PublicSession = {
  id: number;
  quiz: number;
  quiz_title: string;
  host: number | null;
  host_username?: string | null;
  mode?: "live" | "async";
  session_code: string;
  status: string;
  is_public: boolean;
  started_at: string | null;
  created_at: string; // <-- make sure serializer includes this
  is_host: boolean;
  is_participant: boolean;
};

export function PublicLiveSessionsList() {
  const [sessions, setSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await authFetch("/api/pq/sessions/public-live/?include_async=1");

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to load live sessions");
        }

        const data = await res.json();
        setSessions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load live sessions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading live quizzes…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (sessions.length === 0) {
    return <p className="text-sm text-gray-500">No public quizzes are live right now.</p>;
  }

  // Format date cleanly
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {sessions.map((s) => {
        const modeLabel =
          s.mode === "live"
            ? { text: "LIVE", style: "bg-red-100 text-red-700 border-red-200" }
            : { text: "Self-paced", style: "bg-slate-100 text-slate-700 border-slate-200" };

        return (
          <div
            key={s.id}
            className="rounded-2xl border bg-white/90 px-4 py-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* LEFT SIDE */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{s.quiz_title}</p>

                  {/* Mode badge */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide ${modeLabel.style}`}
                  >
                    {modeLabel.text}
                  </span>

                  {/* Host */}
                  {s.host_username && (
                    <span className="text-[11px] text-gray-500">
                      Hosted by {s.host_username}
                    </span>
                  )}
                </div>

                {/* Created date */}
                <p className="text-[11px] text-gray-500">
                  Created on:{" "}
                  <span className="font-medium text-gray-700">
                    {formatDate(s.created_at)}
                  </span>
                </p>

                {/* Role messaging */}
                {s.is_host && (
                  <p className="text-[11px] text-blue-600">
                    You are the host of this session.
                  </p>
                )}

                {!s.is_host && s.is_participant && (
                  <p className="text-[11px] text-emerald-600">
                    You already joined this quiz.
                  </p>
                )}
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="flex items-center gap-3">
                {s.is_host ? (
                  <>
                    <a
                      href={`/real-time-quiz/projector/${s.session_code}`}
                      className="text-[11px] underline text-blue-600 hover:text-blue-700"
                    >
                      Projector view
                    </a>
                    <a
                      href={`/real-time-quiz/host/${s.session_code}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Host dashboard
                    </a>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-gray-500">
                      Click to join instantly
                    </span>
                    <a
                      href={`/real-time-quiz/play/${s.session_code}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Join & play
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
