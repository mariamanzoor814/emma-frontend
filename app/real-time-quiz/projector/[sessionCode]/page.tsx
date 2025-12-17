// frontend/app/real-time-quiz/projector/[sessionCode]/page.tsx
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/config";

type QuestionPayload = {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  order?: number;
  time_limit?: number;
  correct_option?: string;
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

type SessionByCodePayload = {
  session?: {
    id: number;
    current_question: number | null;
    status: string;
    is_host?: boolean; // 👈 add this
  };
  quiz?: {
    id: number;
    title: string;
    questions: any[];
  };
  question_stats?: StatsPayload[];
  is_host?: boolean; // keep this in case you add it at root later
};


type RoleState = "checking" | "host" | "denied";

export default function ProjectorPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = use(params);

  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPayload | null>(null);
  const [liveStats, setLiveStats] = useState<StatsPayload | null>(null);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">(
    "connecting"
  );
  const [ended, setEnded] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionPayload[]>([]);
  const [statsMap, setStatsMap] = useState<Record<number, StatsPayload>>({});
  const [role, setRole] = useState<RoleState>("checking");
  const [publishedIds, setPublishedIds] = useState<number[]>([]);

 useEffect(() => {
  if (!sessionCode) return;

  const loadInitial = async () => {
    try {
      setRole("checking");

      const res = await authFetch(
        `/api/pq/sessions/by-code/${sessionCode}/`
      );

      if (!res.ok) {
        setRole("denied");
        return;
      }

      const data = (await res.json()) as SessionByCodePayload;

      // 👀 Optional debug while you're testing:
      console.log("[Projector] by-code payload:", data);

      // Look for is_host in both places
      const isHostFlag =
        typeof data.is_host === "boolean"
          ? data.is_host
          : typeof data.session?.is_host === "boolean"
          ? data.session.is_host
          : null;

      if (isHostFlag === false) {
        // We are sure user is NOT host
        setRole("denied");
        return;
      }

      // If it's true OR missing, let host in
      setRole("host");

      const currentId = data.session?.current_question ?? null;
      if (data.session?.status === "ended") {
        setEnded(true);
      }

      if (data.quiz?.questions?.length) {
        const mapped: QuestionPayload[] = data.quiz.questions.map((q: any) => ({
          question_id: Number(q.id),
          question_text: q.text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          order: q.order,
          correct_option: q.correct_option,
        }));
        setAllQuestions(mapped);

        if (currentId) {
          const match = mapped.find(
            (q) => q.question_id === Number(currentId)
          );
          if (match) {
            setCurrentQuestion(match);
          }
        }
      }

      const initialStatsMap: Record<number, StatsPayload> = {};
      const initialPublished = new Set<number>();

      if (Array.isArray(data.question_stats)) {
        data.question_stats.forEach((s) => {
          initialStatsMap[s.question_id] = s;
          if ((s.total_responses ?? 0) > 0) {
            initialPublished.add(s.question_id);
          }
        });
      }

      if (data.session?.current_question) {
        initialPublished.add(Number(data.session.current_question));
      }

      setStatsMap(initialStatsMap);
      setPublishedIds(Array.from(initialPublished));
    } catch (err) {
      console.error("[Projector] loadInitial error:", err);
      setRole("denied");
    }
  };

  loadInitial();
}, [sessionCode]);

  // ---- WEBSOCKET ----
  useEffect(() => {
    if (!sessionCode) return;
    if (role !== "host") return;

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("emma_token")
        : null;

    const wsUrl = token
      ? `ws://localhost:8000/ws/pq/sessions/${sessionCode}/?token=${encodeURIComponent(
          token
        )}`
      : `ws://localhost:8000/ws/pq/sessions/${sessionCode}/`;

    const ws = new WebSocket(wsUrl);
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("online");
      ws.send(JSON.stringify({ action: "join" }));
    };

    ws.onclose = () => setStatus("offline");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.event === "current_question_changed") {
        const incoming = msg.data as QuestionPayload;
        const qid = Number(incoming.question_id);

        const normalized: QuestionPayload = {
          ...incoming,
          question_id: qid,
        };

        setCurrentQuestion(normalized);
        setLiveStats(null);

        setPublishedIds((prev) =>
          prev.includes(qid) ? prev : [...prev, qid]
        );
      }

      if (msg.event === "stats_update") {
        const s = msg.data as StatsPayload;
        setLiveStats((prev) =>
          s.question_id === currentQuestion?.question_id ? s : prev
        );
        setStatsMap((prev) => ({
          ...prev,
          [s.question_id]: s,
        }));
      }

      if (msg.event === "session_ended" || msg.event === "session_results") {
        setEnded(true);
      }
    };

    return () => ws.close();
  }, [sessionCode, role, currentQuestion?.question_id]);

  // ---- DERIVED DATA ----
  const publishedQuestions = useMemo(() => {
    if (publishedIds.length === 0) return [];
    return allQuestions.filter((q) =>
      publishedIds.includes(q.question_id)
    );
  }, [allQuestions, publishedIds]);

  const resultQuestions = useMemo(() => {
    if (ended) return allQuestions;
    return publishedQuestions;
  }, [ended, allQuestions, publishedQuestions]);

  const overallCorrectWrong = useMemo(() => {
    let correct = 0;
    let wrong = 0;

    allQuestions.forEach((q) => {
      const s = statsMap[q.question_id];
      if (!s || !q.correct_option) return;

      const total = s.total_responses ?? 0;
      let correctCount = 0;
      if (q.correct_option === "A") correctCount = s.option_a_count ?? 0;
      else if (q.correct_option === "B") correctCount = s.option_b_count ?? 0;
      else if (q.correct_option === "C") correctCount = s.option_c_count ?? 0;
      else if (q.correct_option === "D") correctCount = s.option_d_count ?? 0;

      const wrongCount = Math.max(total - correctCount, 0);
      correct += correctCount;
      wrong += wrongCount;
    });

    return { correct, wrong };
  }, [allQuestions, statsMap]);

  const overallTotalAnswers =
    overallCorrectWrong.correct + overallCorrectWrong.wrong;
  const overallCorrectPct =
    overallTotalAnswers > 0
      ? (overallCorrectWrong.correct * 100) / overallTotalAnswers
      : 0;

  // ---- RENDERING ----

  if (role === "checking") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking access…</p>
      </main>
    );
  }

  if (role === "denied") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl px-6 py-6 shadow-lg space-y-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
            EMMA • 8PQ
            <span className="h-1 w-8 rounded-full bg-emerald-200" />
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            Projector is host-only
          </h1>
          <p className="text-sm text-slate-500">
            This view is only available to the quiz host. Participants will see
            their own results on their own device after completing the quiz.
          </p>
        </div>
      </main>
    );
  }

  // role === "host"
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 border border-emerald-100 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700">
                Live Projector
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Real-time 8PQ Results
              </h1>
              <p className="text-sm text-slate-500">
                Session{" "}
                <span className="font-mono text-slate-800 bg-white/70 border border-slate-200 rounded-full px-3 py-1 text-xs">
                  {sessionCode}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 border border-slate-200 shadow-sm text-[11px]">
              <span className="text-slate-500">Connection</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                  status === "online"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : status === "connecting"
                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    status === "online"
                      ? "bg-emerald-500"
                      : status === "connecting"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                {status === "online"
                  ? "Connected"
                  : status === "connecting"
                  ? "Connecting…"
                  : "Offline"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 text-right max-w-xs leading-relaxed">
              Host publishes questions from the dashboard. Participants answer
              on their phones, tablets, or laptops in real time.
            </p>
          </div>
        </header>

        {/* CURRENT QUESTION */}
        <section className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-100/40">
          {currentQuestion ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Question{" "}
                    {currentQuestion.order !== undefined
                      ? `#${currentQuestion.order + 1}`
                      : ""}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-semibold leading-snug text-slate-900">
                    {currentQuestion.question_text}
                  </h2>
                </div>
                <div className="text-xs text-slate-500 md:text-right space-y-1">
                  {currentQuestion.time_limit ? (
                    <p>
                      Time limit:{" "}
                      <span className="font-medium text-slate-800">
                        {currentQuestion.time_limit}s
                      </span>
                    </p>
                  ) : null}
                  <p className="text-[11px]">
                    Live responses update automatically as participants answer.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const label =
                    opt === "A"
                      ? currentQuestion.option_a
                      : opt === "B"
                      ? currentQuestion.option_b
                      : opt === "C"
                      ? currentQuestion.option_c
                      : currentQuestion.option_d;

                  if (!label) return null;

                  const s =
                    liveStats &&
                    liveStats.question_id === currentQuestion.question_id
                      ? liveStats
                      : statsMap[currentQuestion.question_id] || null;

                  const pct = s
                    ? opt === "A"
                      ? s.option_a_pct
                      : opt === "B"
                      ? s.option_b_pct
                      : opt === "C"
                      ? s.option_c_pct
                      : s.option_d_pct
                    : 0;

                  const count = s
                    ? opt === "A"
                      ? s.option_a_count
                      : opt === "B"
                      ? s.option_b_count
                      : opt === "C"
                      ? s.option_c_count
                      : s.option_d_count
                    : 0;

                  return (
                    <div
                      key={opt}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-900">
                        <span className="flex-1">
                          <span className="font-semibold">{opt}.</span>{" "}
                          {label}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {count} votes · {pct.toFixed(1)}%
                        </span>
                      </div>
                      {s && (
                        <div className="mt-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(() => {
                const s =
                  liveStats &&
                  liveStats.question_id === currentQuestion.question_id
                    ? liveStats
                    : statsMap[currentQuestion.question_id] || null;

                if (!s) return null;
                return (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      Responses:{" "}
                      <span className="font-medium text-slate-800">
                        {s.total_responses}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Avg time:{" "}
                      <span className="font-medium text-slate-800">
                        {s.average_time?.toFixed(1)}s
                      </span>
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {ended ? "Session ended" : "Waiting for the first question…"}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once the host publishes a question from the dashboard, it will
                appear here with live response percentages.
              </p>
            </div>
          )}
        </section>

        {/* RESULTS GRID */}
        {resultQuestions.length > 0 && (
          <section className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/60 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {ended ? "Final results" : "Live results so far"}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {resultQuestions.length}{" "}
                  {resultQuestions.length === 1 ? "question" : "questions"}{" "}
                  {ended ? "(session ended)" : "(published so far)"}
                </p>
              </div>

              {ended && overallTotalAnswers > 0 && (
                <div className="flex items-center gap-5">
                  <div
                    className="h-20 w-20 rounded-full border border-slate-200 flex items-center justify-center text-[11px] text-slate-800 bg-white shadow-sm"
                    style={{
                      backgroundImage: `conic-gradient(#22c55e 0 ${overallCorrectPct}%, #ef4444 ${overallCorrectPct}% 100%)`,
                    }}
                  >
                    <span className="text-center leading-tight px-2">
                      {overallCorrectPct.toFixed(1)}%{" "}
                      <span className="block text-[10px] text-slate-600">
                        correct
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p>
                      Correct answers:{" "}
                      <span className="font-semibold">
                        {overallCorrectWrong.correct}
                      </span>
                    </p>
                    <p>
                      Wrong answers:{" "}
                      <span className="font-semibold">
                        {overallCorrectWrong.wrong}
                      </span>
                    </p>
                    <p>Total answers: {overallTotalAnswers}</p>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                        Correct
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                        Wrong
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resultQuestions.map((q, idx) => {
                const s = statsMap[q.question_id];
                const correctOpt = q.correct_option;

                const optionData = [
                  {
                    key: "A",
                    label: q.option_a,
                    count: s?.option_a_count ?? 0,
                    pct: s?.option_a_pct ?? 0,
                  },
                  {
                    key: "B",
                    label: q.option_b,
                    count: s?.option_b_count ?? 0,
                    pct: s?.option_b_pct ?? 0,
                  },
                  {
                    key: "C",
                    label: q.option_c,
                    count: s?.option_c_count ?? 0,
                    pct: s?.option_c_pct ?? 0,
                  },
                  {
                    key: "D",
                    label: q.option_d,
                    count: s?.option_d_count ?? 0,
                    pct: s?.option_d_pct ?? 0,
                  },
                ].filter((o) => o.label);

                const total = s?.total_responses ?? 0;

                let correctCount = 0;
                if (correctOpt === "A") correctCount = s?.option_a_count ?? 0;
                else if (correctOpt === "B")
                  correctCount = s?.option_b_count ?? 0;
                else if (correctOpt === "C")
                  correctCount = s?.option_c_count ?? 0;
                else if (correctOpt === "D")
                  correctCount = s?.option_d_count ?? 0;

                const wrongCount = Math.max(total - correctCount, 0);
                const correctPct =
                  total > 0 ? (correctCount * 100) / total : 0;
                const wrongPct = Math.max(100 - correctPct, 0);

                const colors = ["#22c55e", "#3b82f6", "#eab308", "#f97316"];
                let accAngle = 0;
                const slices: string[] = [];
                optionData.forEach((o, i) => {
                  const start = accAngle;
                  const end = accAngle + o.pct;
                  const color = colors[i % colors.length];
                  slices.push(`${color} ${start}% ${end}%`);
                  accAngle = end;
                });
                const pieStyle =
                  slices.length > 0
                    ? {
                        backgroundImage: `conic-gradient(${slices.join(", ")})`,
                      }
                    : {
                        backgroundColor: "#e5e7eb",
                      };

                return (
                  <div
                    key={q.question_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Q{(q.order ?? idx) + 1}: {q.question_text}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Total responses: {total}
                        </p>
                        {correctOpt && (
                          <p className="text-[11px] text-slate-700">
                            Correct:{" "}
                            <span className="text-emerald-700 font-semibold">
                              {correctCount} ({correctPct.toFixed(1)}%)
                            </span>{" "}
                            · Wrong:{" "}
                            <span className="text-red-600 font-semibold">
                              {wrongCount} ({wrongPct.toFixed(1)}%)
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="h-16 w-16 rounded-full border border-slate-200 bg-white shadow-sm"
                          style={pieStyle}
                        />
                        <span className="text-[10px] text-slate-500">
                          Option mix
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {optionData.length === 0 && (
                        <p className="text-xs text-slate-500">
                          No options / no responses yet.
                        </p>
                      )}
                      {optionData.map((o, i) => (
                        <div key={o.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                correctOpt === o.key
                                  ? "text-emerald-800 font-semibold"
                                  : "text-slate-700"
                              }`}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    colors[i % colors.length],
                                }}
                              />
                              {o.key}. {o.label}
                            </span>
                            <span className="text-slate-500">
                              {o.count} · {o.pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                correctOpt === o.key
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${Math.min(o.pct, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {correctOpt && (
                        <p className="text-[10px] text-slate-500 pt-1">
                          Green bars indicate the correct option for each
                          question.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
