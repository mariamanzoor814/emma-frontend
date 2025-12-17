"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/config";

type Quiz = {
  id: number;
  title: string;
  status: string;
  created_at: string;
  owner_username?: string;
};

type Session = {
  id: number;
  quiz: number;
  session_code: string;
  mode: "live" | "async";
  status: string;
  is_host: boolean;
  created_at: string;
};

export function MyQuizzesList() {
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
  const [privateQuizzes, setPrivateQuizzes] = useState<Quiz[]>([]);
  const [hostSessions, setHostSessions] = useState<Record<number, Session>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openPublic, setOpenPublic] = useState(true);
  const [openPrivate, setOpenPrivate] = useState(true);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [quizRes, sessionRes] = await Promise.all([
          authFetch("/api/pq/quizzes/"),
          authFetch("/api/pq/sessions/"),
        ]);

        if (!quizRes.ok) {
          const data = await quizRes.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to load quizzes");
        }
        if (!sessionRes.ok) {
          const data = await sessionRes.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to load sessions");
        }

        const quizzes = (await quizRes.json()) as Quiz[];
        const sessions = (await sessionRes.json()) as Session[];

        // Map latest host session per quiz (for “Open host dashboard”)
        const hostMap: Record<number, Session> = {};
        sessions
          .filter((s) => s.is_host)
          .forEach((s) => {
            const existing = hostMap[s.quiz];
            if (!existing) {
              hostMap[s.quiz] = s;
            } else {
              const existingDate = new Date(existing.created_at).getTime();
              const currentDate = new Date(s.created_at).getTime();
              if (currentDate > existingDate) hostMap[s.quiz] = s;
            }
          });

        setHostSessions(hostMap);

        const published = quizzes
          .filter((q) => q.status === "published")
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        const drafts = quizzes
          .filter((q) => q.status !== "published")
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        setPublicQuizzes(published);
        setPrivateQuizzes(drafts);
      } catch (err: any) {
        setError(err.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading your quizzes…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const showPublic = publicQuizzes.length > 0;
  const showPrivate = privateQuizzes.length > 0;

  if (!showPublic && !showPrivate) {
    return (
      <p className="text-sm text-gray-500">
        You haven&apos;t created any quizzes yet.
      </p>
    );
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (items: Quiz[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((q) => next.add(q.id));
      return next;
    });
  };

  const clearAll = (items: Quiz[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((q) => next.delete(q.id));
      return next;
    });
  };

  const deleteSelected = async (ids: number[]) => {
    if (ids.length === 0) return;
    const ok = window.confirm(
      `Delete ${ids.length} quiz(es)? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await Promise.all(
        ids.map((id) =>
          authFetch(`/api/pq/quizzes/${id}/`, {
            method: "DELETE",
          }).then((res) => {
            if (!res.ok && res.status !== 204) {
              throw new Error(`Failed to delete quiz`);
            }
          })
        )
      );

      setPublicQuizzes((prev) => prev.filter((q) => !ids.includes(q.id)));
      setPrivateQuizzes((prev) => prev.filter((q) => !ids.includes(q.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err: any) {
      alert(err.message || "Failed to delete selected quizzes");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderList = (items: Quiz[], isPublishedSection: boolean) => {
    if (items.length === 0) {
      return <p className="text-sm text-gray-500">None</p>;
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((q) => {
          const session = hostSessions[q.id];
          const hasSession = Boolean(session);
          const isLive = session?.status === "live";

          return (
            <div
              key={q.id}
              className="group rounded-2xl border bg-white/90 px-4 py-3 shadow-sm space-y-2 hover:shadow-md hover:border-emerald-400 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggleSelect(q.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {q.title}
                    </p>
                    {q.owner_username && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Created by {q.owner_username}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Created on {formatDate(q.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* Status pill */}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      isPublishedSection
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    {isPublishedSection ? "Published" : "Draft / Private"}
                  </span>

                  {/* Host action (no IDs or codes shown) */}
                  {hasSession ? (
                    <a
                      href={`/real-time-quiz/host/${session!.session_code}`}
                      className={`mt-1 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium text-white ${
                        isLive
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {isLive ? "Continue live session" : "Open host dashboard"}
                    </a>
                  ) : (
                    <span className="mt-1 text-[11px] text-gray-500">
                      No session started yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const anyPublicSelected = publicQuizzes.some((q) => selected.has(q.id));
  const anyPrivateSelected = privateQuizzes.some((q) => selected.has(q.id));

  return (
    <div className="space-y-6">
      {showPublic && (
        <section className="space-y-2">
          <button
            onClick={() => setOpenPublic((p) => !p)}
            className="flex items-center justify-between w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <span>Published quizzes</span>
            <span className="text-xs text-gray-500">
              {openPublic ? "Hide" : "Show"}
            </span>
          </button>

          <div className="mt-1 flex gap-2 text-[11px] text-gray-600">
            <button
              className="px-2 py-1 rounded-md border bg-gray-50 hover:bg-gray-100"
              onClick={() => selectAll(publicQuizzes)}
            >
              Select all
            </button>
            <button
              className="px-2 py-1 rounded-md border bg-gray-50 hover:bg-gray-100"
              onClick={() => clearAll(publicQuizzes)}
            >
              Clear
            </button>
            <button
              className="px-2 py-1 rounded-md border bg-red-50 text-red-700 disabled:opacity-50"
              disabled={!anyPublicSelected || deleting}
              onClick={() =>
                deleteSelected(
                  publicQuizzes
                    .filter((q) => selected.has(q.id))
                    .map((q) => q.id)
                )
              }
            >
              Delete selected
            </button>
          </div>

          {openPublic && (
            <div className="mt-3">{renderList(publicQuizzes, true)}</div>
          )}
        </section>
      )}

      {showPrivate && (
        <section className="space-y-2">
          <button
            onClick={() => setOpenPrivate((p) => !p)}
            className="flex items-center justify-between w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <span>Draft / private quizzes</span>
            <span className="text-xs text-gray-500">
              {openPrivate ? "Hide" : "Show"}
            </span>
          </button>

          <div className="mt-1 flex gap-2 text-[11px] text-gray-600">
            <button
              className="px-2 py-1 rounded-md border bg-gray-50 hover:bg-gray-100"
              onClick={() => selectAll(privateQuizzes)}
            >
              Select all
            </button>
            <button
              className="px-2 py-1 rounded-md border bg-gray-50 hover:bg-gray-100"
              onClick={() => clearAll(privateQuizzes)}
            >
              Clear
            </button>
            <button
              className="px-2 py-1 rounded-md border bg-red-50 text-red-700 disabled:opacity-50"
              disabled={!anyPrivateSelected || deleting}
              onClick={() =>
                deleteSelected(
                  privateQuizzes
                    .filter((q) => selected.has(q.id))
                    .map((q) => q.id)
                )
              }
            >
              Delete selected
            </button>
          </div>

          {openPrivate && (
            <div className="mt-3">{renderList(privateQuizzes, false)}</div>
          )}
        </section>
      )}
    </div>
  );
}
