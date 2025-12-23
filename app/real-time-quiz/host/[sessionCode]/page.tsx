// frontend/app/real-time-quiz/host/[sessionCode]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/config";
import { TOKEN_KEYS } from "@/lib/authConfig";
import toast from "react-hot-toast";

type RouteParams = { sessionCode: string };

type Question = {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  order?: number;
  time_limit_seconds?: number;
  effective_time_limit?: number;
  correct_option?: "A" | "B" | "C" | "D" | "";
};

type StatsPayload = {
  question_id: number;
  total_responses: number;
  average_time: number;
  option_a_count: number;
  option_b_count: number;
  option_c_count: number;
  option_d_count: number;
  option_a_pct: number;
  option_b_pct: number;
  option_c_pct: number;
  option_d_pct: number;
};

type Participant = {
  id: number;
  user: number | null;
  guest_name: string;
  display_name: string;
  joined_at: string;
  last_active_at: string;
  completed: boolean;
};

type SessionPayload = {
  session: {
    id: number;
    session_code: string;
    status: string;
    mode?: "live" | "async";
    total_time_limit_seconds?: number;
    total_time_expires_at?: string | null;
    current_question?: number | null;
    // 👇 NEW: coming from QuizSessionSerializer
    is_host?: boolean;
    is_participant?: boolean;
  };
  quiz: {
    id: number;
    title: string;
    status?: string;
    total_time_limit_seconds?: number;
    questions: Question[];
  };
  participants?: Participant[];
  question_stats?: StatsPayload[];
};

type RoleState = "checking" | "host" | "denied";


const emptyQuestion: Question = {
  id: 0,
  text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  order: 0,
  correct_option: "",
};

export default function HostPage() {
  const { sessionCode } = useParams<RouteParams>();

  const wsRef = useRef<WebSocket | null>(null);

  const [sessionData, setSessionData] = useState<SessionPayload | null>(null);
  const [role, setRole] = useState<RoleState>("checking");

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [questionStats, setQuestionStats] = useState<Record<number, StatsPayload>>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [totalTimeInput, setTotalTimeInput] = useState<string>("");
  const [savingTotalTime, setSavingTotalTime] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);

  const [newQuestion, setNewQuestion] = useState<Question>(emptyQuestion);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showResults, setShowResults] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">(
    "connecting"
  );

  const formatSeconds = (secs: number) => {
    const clamped = Math.max(0, Math.floor(secs));
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  // Keep per-tab token copy if you ever want sessionStorage-based auth later
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(TOKEN_KEYS.access);
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEYS.access, token);
    }
  }, []);

  // Helper: convert array of stats to map
  const toStatsMap = (list: StatsPayload[] = []) => {
    const map: Record<number, StatsPayload> = {};
    list.forEach((s) => {
      map[s.question_id] = s;
    });
    return map;
  };

  // Load session + quiz by code (REST)
  // Load session + quiz by code (REST)
useEffect(() => {
  if (!sessionCode) return;

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      setRole("checking");

      const res = await authFetch(`/api/pq/sessions/by-code/${sessionCode}/`);
      const data = (await res.json().catch(() => ({}))) as SessionPayload & {
        detail?: string;
        participants?: Participant[];
        question_stats?: StatsPayload[];
        // some views might also put is_host at root
        is_host?: boolean;
      };

      if (!res.ok) {
        throw new Error(data.detail || "Failed to load session");
      }

      // 🔐 Host gate: prefer root is_host, fall back to session.is_host
      const isHostFlag =
        typeof data.is_host === "boolean"
          ? data.is_host
          : typeof data.session?.is_host === "boolean"
          ? data.session.is_host
          : null;

      if (isHostFlag === false) {
        // Definitely NOT the host
        setRole("denied");
        setLoading(false);
        return;
      }

      // If host or missing flag, treat as host for now
      setRole("host");
      setSessionData(data);

      setTotalTimeInput(
        `${Math.round((data.quiz.total_time_limit_seconds || 0) / 60)}`
      );

      setParticipants(data.participants || []);

      if (data.question_stats?.length) {
        setQuestionStats(toStatsMap(data.question_stats));
      }

      const maybeCurrentId = data.session?.current_question ?? null;

      if (maybeCurrentId) {
        const found = data.quiz.questions.find((q) => q.id === maybeCurrentId);
        if (found) {
          setCurrentQuestion(found);
          setSelectedQuestionId(found.id);
        } else {
          setSelectedQuestionId(data.quiz.questions[0]?.id ?? null);
        }
      } else {
        setSelectedQuestionId(data.quiz.questions[0]?.id ?? null);
      }

      if (data.session.total_time_expires_at) {
        const diff = Math.max(
          0,
          Math.floor(
            (new Date(data.session.total_time_expires_at).getTime() -
              Date.now()) /
              1000
          )
        );
        setSessionTimeLeft(diff);
      } else {
        setSessionTimeLeft(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load session");
      setRole("denied");
    } finally {
      setLoading(false);
    }
  };

  loadSession();
}, [sessionCode]);


  // Countdown for overall session time
  useEffect(() => {
    if (!sessionData?.session.total_time_expires_at) return;

    const compute = () => {
      const diff = Math.max(
        0,
        Math.floor(
          (new Date(sessionData.session.total_time_expires_at as string).getTime() -
            Date.now()) /
            1000
        )
      );
      setSessionTimeLeft(diff);
    };

    compute();
    const timer = setInterval(compute, 1000);
    return () => clearInterval(timer);
  }, [sessionData?.session.total_time_expires_at]);

 // WebSocket connection as host (live events)
useEffect(() => {
  if (!sessionCode) return;
  if (role !== "host") return; // 🔐 only host connects

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(TOKEN_KEYS.access)
      : null;

  const wsUrl = token
    ? `ws://localhost:8000/ws/pq/sessions/${sessionCode}/?token=${encodeURIComponent(
        token
      )}`
    : `ws://localhost:8000/ws/pq/sessions/${sessionCode}/`;

  const ws = new WebSocket(wsUrl);
  wsRef.current = ws;
  setWsStatus("connecting");

  ws.onopen = () => {
    setWsStatus("open");
    ws.send(JSON.stringify({ action: "join" }));
  };

  ws.onclose = () => {
    setWsStatus("closed");
    console.log("Host WS closed");
  };

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    const { event: ev, data } = payload;

    if (ev === "current_question_changed") {
      const q: Question = {
        id: data.question_id,
        text: data.question_text,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        option_d: data.option_d,
        order: data.order,
        correct_option: data.correct_option || "",
      };
      setCurrentQuestion(q);
      setSelectedQuestionId(q.id);
    }

    if (ev === "stats_update") {
      const s = data as StatsPayload;
      setStats(s);
      setQuestionStats((prev) => ({
        ...prev,
        [s.question_id]: s,
      }));
    }

    if (ev === "session_ended") {
      setError("Session ended");
    }

    if (ev === "participant_joined") {
      const p = data as Participant;
      setParticipants((prev) => {
        const exists = prev.some((item) => item.id === p.id);
        return exists ? prev : [...prev, p];
      });
    }
  };

  return () => {
    ws.close();
  };
}, [sessionCode, role]); // 👈 add role


  // Broadcast a question via WS + HTTP fallback
  const sendSetQuestion = async (id: number) => {
    if (!sessionData) return;

    const question = sessionData.quiz.questions.find((q) => q.id === id) || null;

    if (question && (!question.correct_option)) {
      toast.error("Select a correct answer before publishing/broadcasting this question.");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ action: "host_set_question", question_id: id })
      );
    }

    try {
      const res = await authFetch(
        `/api/pq/sessions/${sessionCode}/set-current-question/`,
        {
          method: "POST",
          body: JSON.stringify({ question_id: id }),
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to broadcast question");
      }

      if (question) {
        setCurrentQuestion(question);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to broadcast question. Are you the host?");
    }
  };

  // End session via WebSocket (optional; wire to a button if you want)
  const sendEnd = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "host_end" }));
  };

  const updateCorrectOption = async (questionId: number, value: string) => {
    try {
      const res = await authFetch(`/api/pq/questions/${questionId}/`, {
        method: "PATCH",
        body: JSON.stringify({ correct_option: value }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save correct option");
      }

      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              quiz: {
                ...prev.quiz,
                questions: prev.quiz.questions.map((q) =>
                  q.id === questionId ? { ...q, correct_option: value as any } : q
                ),
              },
            }
          : prev
      );
    } catch (err: any) {
      toast.error(err.message || "Could not set correct answer");
    }
  };

  const handleSaveTotalTime = async () => {
    if (!sessionData) return;

    const minutes = Number(totalTimeInput);
    const seconds = Math.max(
      0,
      Math.round((Number.isFinite(minutes) ? minutes : 0) * 60)
    );

    setSavingTotalTime(true);
    try {
      const res = await authFetch(`/api/pq/quizzes/${sessionData.quiz.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ total_time_limit_seconds: seconds }),
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save total time");
      }

      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              quiz: {
                ...prev.quiz,
                total_time_limit_seconds: data.total_time_limit_seconds,
                questions: prev.quiz.questions,
              },
              session: {
                ...prev.session,
                total_time_limit_seconds: data.total_time_limit_seconds,
              },
            }
          : prev
      );
    } catch (err: any) {
      toast.error(err.message || "Could not save total time");
    } finally {
      setSavingTotalTime(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!sessionData) return;
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      const res = await authFetch(
        `/api/pq/sessions/${sessionData.session.id}/analytics/`
      );
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to load results");
      }

      const qsStats = (data.question_stats || []) as StatsPayload[];
      setQuestionStats(toStatsMap(qsStats));

      if (Array.isArray(data.participants)) {
        setParticipants(data.participants as Participant[]);
      }
    } catch (err: any) {
      setAnalyticsError(err.message || "Could not load results");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!sessionData) return;

    if (!newQuestion.text.trim() || !newQuestion.option_a || !newQuestion.option_b) {
      toast.error("Question text and options A/B are required.");
      return;
    }

    setSavingQuestion(true);
    try {
      const res = await authFetch("/api/pq/questions/", {
        method: "POST",
        body: JSON.stringify({
          quiz: sessionData.quiz.id,
          text: newQuestion.text,
          option_a: newQuestion.option_a,
          option_b: newQuestion.option_b,
          option_c: newQuestion.option_c,
          option_d: newQuestion.option_d,
          correct_option: "",
          weights: null,
          time_limit_seconds: newQuestion.time_limit_seconds || 0,
          order: sessionData.quiz.questions.length || 0,
          active: true,
        }),
      });
      const data = await res.json().catch(() => ({} as Question));

      if (!res.ok) {
        throw new Error((data as any).detail || "Failed to add question");
      }

      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              quiz: { ...prev.quiz, questions: [...prev.quiz.questions, data] },
            }
          : prev
      );
      setNewQuestion(emptyQuestion);
    } catch (err: any) {
      toast.error(err.message || "Could not add question");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    const ok = window.confirm(
      "Delete this question? Answers linked to it will be removed."
    );
    if (!ok) return;

    try {
      const res = await authFetch(`/api/pq/questions/${questionId}/`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data.detail || "Failed to delete question");
      }

      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              quiz: {
                ...prev.quiz,
                questions: prev.quiz.questions.filter((q) => q.id !== questionId),
              },
            }
          : prev
      );

      if (currentQuestion?.id === questionId) {
        setCurrentQuestion(null);
      }
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not delete question");
    }
  };

  const handlePublishQuizStatus = async (action: "publish" | "unpublish") => {
    if (!sessionData) return;
    setPublishing(true);

    try {
      const res = await authFetch(
        `/api/pq/quizzes/${sessionData.quiz.id}/${action}/`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update quiz status");
      }

      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              quiz: { ...prev.quiz, status: data.status },
            }
          : prev
      );
    } catch (err: any) {
      toast.error(err.message || "Could not update quiz visibility");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!sessionData) return;
    const ok = window.confirm(
      "Delete this quiz permanently? Sessions and questions will be gone."
    );
    if (!ok) return;

    try {
      const res = await authFetch(`/api/pq/quizzes/${sessionData.quiz.id}/`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data.detail || "Failed to delete quiz");
      }

      window.location.href = "/real-time-quiz";
    } catch (err: any) {
      toast.error(err.message || "Could not delete quiz");
    }
  };

  // ---------- RENDER ----------

  // ---------- RENDER ----------

if (role === "checking") {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p className="text-sm text-gray-600">Checking host permissions…</p>
    </main>
  );
}

if (role === "denied") {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl px-6 py-6 shadow-lg space-y-3">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          EMMA • 8PQ
          <span className="h-1 w-8 rounded-full bg-emerald-200" />
        </p>
        <h1 className="text-lg font-semibold text-gray-900">
          Host dashboard is restricted
        </h1>
        <p className="text-sm text-gray-600">
          This page is only available to the quiz host. Participants can join or
          continue the quiz from the player page using the session code given by
          the host.
        </p>
      </div>
    </main>
  );
}

if (loading) {
  return (
    <main className="p-6">
      <p className="text-sm text-gray-600">Loading session...</p>
    </main>
  );
}

if (error || !sessionData) {
  return (
    <main className="p-6">
      <p className="text-sm text-red-600">{error || "Session not found"}</p>
    </main>
  );
}


  const { quiz, session } = sessionData;
  const quizStatus = quiz.status || "draft";
  const isLive = (session.mode || "").toLowerCase() === "live";

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
            Host: {quiz.title}
            {isLive && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                LIVE
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-600">
            Session code:{" "}
            <span className="font-mono px-1.5 py-0.5 rounded bg-gray-100">
              {sessionCode}
            </span>
          </p>
          <p className="text-xs text-gray-500">WebSocket: {wsStatus}</p>
          <p className="text-xs text-gray-500">
            Total quiz time:{" "}
            {quiz.total_time_limit_seconds && quiz.total_time_limit_seconds > 0
              ? `${Math.round(quiz.total_time_limit_seconds / 60)} minutes`
              : "No overall limit"}
          </p>
          {sessionData.session.total_time_expires_at && (
            <p className="text-xs text-amber-600">
              Time left:{" "}
              {sessionTimeLeft !== null
                ? formatSeconds(sessionTimeLeft)
                : "calculating..."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/real-time-quiz/projector/${sessionCode}`}
            className="text-xs text-blue-600 underline"
          >
            Open projector view
          </a>

          <button
            onClick={() => {
              setShowResults(true);
              fetchAnalytics();
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({ action: "host_show_results" })
                );
              }
            }}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm"
          >
            Show results (keep live)
          </button>

          <button
            onClick={() =>
              handlePublishQuizStatus(
                quizStatus === "published" ? "unpublish" : "publish"
              )
            }
            className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-60"
            disabled={publishing}
          >
            {publishing
              ? "Saving..."
              : quizStatus === "published"
              ? "Unpublish quiz"
              : "Publish quiz"}
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={totalTimeInput}
              onChange={(e) => setTotalTimeInput(e.target.value)}
              className="w-20 border rounded px-2 py-1 text-xs"
            />
            <span className="text-[11px] text-gray-500">min</span>
            <button
              onClick={handleSaveTotalTime}
              className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 disabled:opacity-60"
              disabled={savingTotalTime}
            >
              {savingTotalTime ? "Saving..." : "Set time"}
            </button>
          </div>

          {/* Optional: hook to sendEnd() if you want a full "end session" button */}
          {/* <button
            onClick={sendEnd}
            className="px-3 py-1.5 rounded bg-red-600 text-white text-sm"
          >
            End session
          </button> */}

          <button
            onClick={handleDeleteQuiz}
            className="px-3 py-1.5 rounded bg-red-100 text-red-700 text-xs"
          >
            Delete quiz
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* QUESTIONS + PUBLISHING */}
        <section className="lg:col-span-2 space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions</h2>
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-gray-500">
                Select question to publish
              </label>
              <select
                value={selectedQuestionId ?? ""}
                onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                className="border rounded px-2 py-1 text-xs"
              >
                {quiz.questions.map((q, idx) => (
                  <option key={q.id} value={q.id}>
                    Q{idx + 1}: {q.text.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`rounded-lg border p-3 ${
                  currentQuestion?.id === q.id ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">
                      Q{idx + 1}: {q.text}
                    </p>
                    <span className="text-[11px] text-gray-500">
                      ID: {q.id} • Time limit:{" "}
                      {q.effective_time_limit || q.time_limit_seconds || "∞"}s
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    onClick={() => sendSetQuestion(q.id)}
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    Delete
                  </button>
                </div>

                <ul className="mt-2 text-xs text-gray-700 space-y-1">
                  <li>A. {q.option_a}</li>
                  <li>B. {q.option_b}</li>
                  {q.option_c && <li>C. {q.option_c}</li>}
                  {q.option_d && <li>D. {q.option_d}</li>}
                </ul>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Correct option:</span>
                  <select
                    value={q.correct_option || ""}
                    onChange={(e) => updateCorrectOption(q.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="">Not set</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE QUESTION + STATS + PARTICIPANTS */}
        <div className="space-y-3">
          <section className="space-y-3 border rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg font-semibold">Live question</h3>
            {currentQuestion ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{currentQuestion.text}</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>A. {currentQuestion.option_a}</li>
                  <li>B. {currentQuestion.option_b}</li>
                  {currentQuestion.option_c && (
                    <li>C. {currentQuestion.option_c}</li>
                  )}
                  {currentQuestion.option_d && (
                    <li>D. {currentQuestion.option_d}</li>
                  )}
                </ul>
                <p className="text-[11px] text-gray-500">
                  Time limit:{" "}
                  {currentQuestion.effective_time_limit ||
                    currentQuestion.time_limit_seconds ||
                    "∞"}{" "}
                  seconds
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No question live yet. Click a question to broadcast.
              </p>
            )}

            <div className="pt-2 border-t">
              <h4 className="text-sm font-semibold">Live stats</h4>
              {stats && currentQuestion ? (
                <div className="space-y-2">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const count =
                      opt === "A"
                        ? stats.option_a_count
                        : opt === "B"
                        ? stats.option_b_count
                        : opt === "C"
                        ? stats.option_c_count
                        : stats.option_d_count;
                    const pct =
                      opt === "A"
                        ? stats.option_a_pct
                        : opt === "B"
                        ? stats.option_b_pct
                        : opt === "C"
                        ? stats.option_c_pct
                        : stats.option_d_pct;
                    const label =
                      opt === "A"
                        ? currentQuestion.option_a
                        : opt === "B"
                        ? currentQuestion.option_b
                        : opt === "C"
                        ? currentQuestion.option_c
                        : currentQuestion.option_d;
                    if (!label) return null;
                    return (
                      <div key={opt} className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {opt}. {label}
                          </span>
                          <span className="text-gray-500">
                            {count} / {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 rounded bg-gray-100 overflow-hidden">
                          <div
                            className="h-2 bg-blue-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-gray-500">
                    Responses: {stats.total_responses} | Avg time:{" "}
                    {stats.average_time?.toFixed(1)}s
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Waiting for answers to roll in.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3 border rounded-2xl p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Participants</h3>
              <span className="text-xs text-gray-500">
                {participants.length} joined
              </span>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants yet.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {participants.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between text-sm border rounded px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {p.display_name || "Guest"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Joined: {new Date(p.joined_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        p.completed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.completed ? "Completed" : "Active"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* QUESTION ANALYTICS */}
      <section className="border rounded-2xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Question analytics</h3>
            {showResults && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Showing results
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {analyticsLoading && (
              <span className="text-amber-600">Refreshing...</span>
            )}
            {analyticsError && (
              <span className="text-red-600">{analyticsError}</span>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quiz.questions.map((q, idx) => {
            const s = questionStats[q.id];
            return (
              <div key={q.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">Q{idx + 1}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {q.text}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {s ? `${s.total_responses} responses` : "No data"}
                  </span>
                </div>

                {s ? (
                  <div className="space-y-1 text-xs">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const label =
                        opt === "A"
                          ? q.option_a
                          : opt === "B"
                          ? q.option_b
                          : opt === "C"
                          ? q.option_c
                          : q.option_d;
                      if (!label) return null;
                      const pct =
                        opt === "A"
                          ? s.option_a_pct
                          : opt === "B"
                          ? s.option_b_pct
                          : opt === "C"
                          ? s.option_c_pct
                          : s.option_d_pct;
                      return (
                        <div
                          key={opt}
                          className="flex items-center justify-between"
                        >
                          <span className="font-semibold">
                            {opt}. {label}
                          </span>
                          <span className="text-gray-500">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Waiting for answers.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ADD QUESTION */}
      <section className="border rounded-2xl p-5 bg-white shadow-sm space-y-3">
        <h3 className="text-lg font-semibold">Add question</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="Question text"
            value={newQuestion.text}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, text: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

            placeholder="Option A"
            value={newQuestion.option_a}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, option_a: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

            placeholder="Option B"
            value={newQuestion.option_b}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, option_b: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

            placeholder="Option C (optional)"
            value={newQuestion.option_c}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, option_c: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

            placeholder="Option D (optional)"
            value={newQuestion.option_d}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, option_d: e.target.value }))
            }
          />
        </div>
        <button
          onClick={handleAddQuestion}
          disabled={savingQuestion}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
        >
          {savingQuestion ? "Saving..." : "Add question"}
        </button>
      </section>
    </main>
  );
}
