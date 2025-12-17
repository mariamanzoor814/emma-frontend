// frontend/app/real-time-quiz/play/[sessionCode]/page.tsx
"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function PlayPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode: rawSessionCode } = use(params);
  const sessionCode = (rawSessionCode || "").toUpperCase();
  const hasSessionCode = Boolean(sessionCode);
  const wsRef = useRef<WebSocket | null>(null);
  const formatSeconds = (secs: number) => {
    const clamped = Math.max(0, Math.floor(secs));
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const [joined, setJoined] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [allQuestions, setAllQuestions] = useState<QuestionPayload[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [answering, setAnswering] = useState(false);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [questionStart, setQuestionStart] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number | null>(null);
  const [totalTimeUp, setTotalTimeUp] = useState(false);
  const [totalTimeExpiresAt, setTotalTimeExpiresAt] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<"live" | "async">("live");
  const [showSummary, setShowSummary] = useState(false);
  const [questionStats, setQuestionStats] = useState<StatsPayload[]>([]);

  const statsByQuestionId = useMemo(() => {
    const map: Record<number, StatsPayload> = {};
    questionStats.forEach((s) => {
      map[s.question_id] = s;
    });
    return map;
  }, [questionStats]);

  const [participantId, setParticipantId] = useState<number | null>(null);
  const [participantCompleted, setParticipantCompleted] = useState(false);

  const fetchParticipantAnswers = useCallback(
    async (participant: number) => {
      try {
        const res = await authFetch(`/api/pq/my/results/${participant}/`);
        if (!res.ok) return;
        const payload = await res.json();
        const map: Record<string, string> = {};
        if (Array.isArray(payload.answers)) {
          payload.answers.forEach((ans: any) => {
            if (ans.question) {
              map[String(ans.question)] = ans.selected_option;
            }
          });
        }
        setAnswered(map);
        setShowSummary(true);
      } catch {}
    },
    []
  );

  const refreshQuestions = useCallback(
    async (alsoStats = false) => {
      if (!sessionCode) return;
      try {
        const res = await authFetch(`/api/pq/sessions/by-code/${sessionCode}/`);
        if (!res.ok) return;
        const payload = await res.json();
        setSessionMode(payload.session?.mode || "live");
        if (payload.quiz?.questions?.length) {
          const mapped = payload.quiz.questions.map((q: any) => ({
            question_id: Number(q.id),
            question_text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            order: q.order,
            time_limit: q.effective_time_limit || q.time_limit_seconds || 0,
            correct_option: q.correct_option,
          }));
          setAllQuestions(mapped);
          if (!question && payload.session?.current_question) {
            const match = mapped.find(
              (m: QuestionPayload) => m.question_id === payload.session.current_question
            );
            if (match) {
              setQuestion(match);
            }
          }
        }
        if (alsoStats && Array.isArray(payload.question_stats)) {
          setQuestionStats(payload.question_stats as StatsPayload[]);
        }
      } catch {}
    },
    [question, sessionCode]
  );

  const answeredCurrent = useMemo(() => {
    if (!question) return false;
    return Boolean(answered[String(question.question_id)]);
  }, [answered, question]);

  useEffect(() => {
    if (!question && showSummary) {
      setTimeUp(true);
      setTotalTimeUp(true);
    }
  }, [question, showSummary]);

  useEffect(() => {
    if (!question) {
      setTimeLeft(null);
      setTimeUp(totalTimeUp);
    }
  }, [question, totalTimeUp]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimeUp(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!joined || sessionMode === "async") return;
    const token = localStorage.getItem("emma_token");
    const wsUrl = token
      ? `ws://localhost:8000/ws/pq/sessions/${sessionCode}/?token=${encodeURIComponent(
          token
        )}`
      : `ws://localhost:8000/ws/pq/sessions/${sessionCode}/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "join" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "current_question_changed") {
        const incoming = data.data as QuestionPayload;
        const normalized: QuestionPayload = {
          ...incoming,
          question_id: Number(incoming.question_id),
        };
        setQuestion(normalized);
        setStats(null);
        setSelectedOption("");
        setQuestionStart(Date.now());
        const tl = normalized.time_limit;
        setTimeLeft(typeof tl === "number" ? tl : null);
        setTimeUp(totalTimeUp);
      }
      if (data.event === "stats_update") {
        // stats hidden from participant; keep for potential future but not rendered
        setStats(data.data as StatsPayload);
      }
      if (data.event === "session_ended" || data.event === "session_results") {
        setShowSummary(true);
        refreshQuestions(true);
        setTotalTimeUp(true);
      }
    };

    ws.onclose = () => {
      console.log("Participant WS closed");
    };

    return () => ws.close();
  }, [joined, sessionCode, sessionMode, refreshQuestions, totalTimeUp]);

  useEffect(() => {
    if (!joined) return;
    const loadSessionMeta = async () => {
      try {
        const res = await authFetch(`/api/pq/sessions/by-code/${sessionCode}/`);
        if (!res.ok) return;
        const payload = await res.json();
        setSessionMode(payload.session?.mode || "live");
        if (payload.quiz?.questions?.length) {
          const mapped = payload.quiz.questions.map((q: any) => ({
            question_id: Number(q.id),
            question_text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            order: q.order,
            time_limit: q.effective_time_limit || q.time_limit_seconds || 0,
            correct_option: q.correct_option,
          }));
          setAllQuestions(mapped);
          // For live mode, keep current question in sync if not yet set
          if (!question && payload.session?.current_question) {
            const match = mapped.find(
              (m: QuestionPayload) => m.question_id === Number(payload.session.current_question)
            );
            if (match) {
              setQuestion(match);
            }
          }
        }
        const limitSeconds =
          payload.session?.total_time_limit_seconds ||
          payload.quiz?.total_time_limit_seconds ||
          0;
        const expiresAt: string | null =
          payload.session?.total_time_expires_at || null;
        const startedAtMs = payload.session?.started_at
          ? new Date(payload.session.started_at).getTime()
          : null;

        let computedExpires = expiresAt;
        if (!computedExpires && startedAtMs && limitSeconds > 0) {
          computedExpires = new Date(startedAtMs + limitSeconds * 1000).toISOString();
        }

        if (computedExpires) {
          setTotalTimeExpiresAt(computedExpires);
        } else if (limitSeconds > 0) {
          setTotalTimeLeft(limitSeconds);
        }
      } catch {}
    };
    loadSessionMeta();
  }, [joined, sessionCode]);

  useEffect(() => {
    if (showSummary) {
      refreshQuestions(true);
      if (participantId && participantCompleted) {
        fetchParticipantAnswers(participantId);
      }
    }
  }, [showSummary, refreshQuestions, participantId, participantCompleted, fetchParticipantAnswers]);

  // ⬇️ LOAD ANSWERS FROM BACKEND AFTER JOINING
useEffect(() => {
  if (!joined) return;

  const loadAnswers = async () => {
    try {
      const res = await authFetch(`/api/pq/sessions/${sessionCode}/my-answers/`);
      if (!res.ok) return;

      const payload = await res.json();
      const map: Record<number, string> = {};

      payload.answers.forEach((a: any) => {
        map[Number(a.question_id)] = a.selected_option;
      });

      setAnswered(map);
    } catch (err) {
      console.error("Failed to load answers", err);
    }
  };

  loadAnswers();
}, [joined, sessionCode]);

  useEffect(() => {
    if (!totalTimeExpiresAt) return;
    const compute = () => {
      const diff = Math.max(
        0,
        Math.floor(
          (new Date(totalTimeExpiresAt).getTime() - Date.now()) / 1000
        )
      );
      setTotalTimeLeft(diff);
      if (diff <= 0) {
        setTotalTimeUp(true);
        setTimeUp(true);
      }
    };
    compute();
    const timer = setInterval(compute, 1000);
    return () => clearInterval(timer);
  }, [totalTimeExpiresAt]);

  useEffect(() => {
  if (!totalTimeUp) return;
  setTimeUp(true);
  if (sessionMode === "async") {
    setShowSummary(true);
  }
}, [totalTimeUp, sessionMode]);


  async function handleJoin(isAuto = false) {
    if (joining) return;
    if (!sessionCode) {
      setJoinError("Missing session code");
      return;
    }
    try {
      setJoining(true);
      setJoinError(null);
      const res = await authFetch(`/api/pq/sessions/${sessionCode}/join/`, {
        method: "POST",
        body: JSON.stringify({ join_password: joinPassword || "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to join session");
      }
      const data = await res.json().catch(() => ({}));
      if (data?.id) {
        setParticipantId(data.id as number);
        if (data.completed) {
          setParticipantCompleted(true);
          fetchParticipantAnswers(data.id as number);
        } else {
          setParticipantCompleted(false);
        }
      }
      setJoined(true);
      setJoinError(null);
    } catch (err: any) {
      if (!isAuto) {
        setJoinError(err.message || "Could not join session");
      }
    } finally {
      setJoining(false);
    }
  }

  const submitAnswer = async (target?: QuestionPayload) => {
    const targetQuestion = target || question;
    if (!targetQuestion || !selectedOption || timeUp || totalTimeUp || participantCompleted) return;
    setAnswering(true);
    try {
      const elapsedMs = questionStart ? Date.now() - questionStart : 0;
      const res = await authFetch(`/api/pq/sessions/${sessionCode}/answer/`, {
        method: "POST",
        body: JSON.stringify({
          question_id: Number(targetQuestion.question_id),
          selected_option: selectedOption,
          time_taken_seconds: Math.max(elapsedMs / 1000, 0),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to submit answer");
      }
      setAnswered((prev) => ({
        ...prev,
        [String(targetQuestion.question_id)]: selectedOption,
      }));

      // If all questions answered (but only for async mode) show summary
      if (sessionMode === "async") {
        const total = allQuestions.length || Object.keys(answered).length;
        if (total > 0 && Object.keys(answered).length + 1 >= total) {
          setShowSummary(true);
        }
      }

    } catch (err: any) {
      alert(err.message || "Could not submit answer");
    } finally {
      setAnswering(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
  <div>
    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
      {sessionMode === "live" ? "Play live quiz" : "Play quiz"}
    </p>
    <h1 className="text-2xl font-semibold mt-1 flex items-center gap-2">
      Session {sessionCode}
      {sessionMode === "live" && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold tracking-wide">
          LIVE
        </span>
      )}
    </h1>
    {totalTimeLeft !== null ? (
      <p className="text-xs text-amber-600">
        Quiz time left: {formatSeconds(totalTimeLeft)}
      </p>
    ) : (
      <p className="text-xs text-gray-500">No overall timer</p>
    )}
  </div>
  
</header>


      {!joined && (
        <section className="space-y-3 border rounded-2xl p-5 bg-white shadow-sm">
          <p className="text-sm text-gray-700">
            Join this session to receive live questions.
          </p>
          <label className="text-xs text-gray-600">
            Password/key (leave blank if public)
          </label>
          <input
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
            placeholder="Optional"
          />
          {joinError && (
            <p className="text-xs text-red-600">
              {joinError}. If this quiz is private, provide the password.
            </p>
          )}
          <button
            className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm"
            onClick={() => handleJoin(false)}
            disabled={joining}
          >
            {joining ? "Joining..." : "Join session"}
          </button>
        </section>
      )}

      {joined && sessionMode === "live" && (
        <section className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          {question ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Question #{question.order !== undefined ? question.order + 1 : 1}
                </p>
                <h2 className="text-lg font-semibold">
                  {question.question_text}
                </h2>
                {typeof question.time_limit === "number" ? (
                  <p className="text-xs text-gray-500">
                    Time left: {timeLeft !== null ? `${timeLeft}s` : `${question.time_limit}s`}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const label =
                    opt === "A"
                      ? question.option_a
                      : opt === "B"
                        ? question.option_b
                        : opt === "C"
                          ? question.option_c
                          : question.option_d;
                  if (!label) return null;
                  const isSelected = selectedOption === opt;
                  const isAnswered = answered[String(question.question_id)] === opt;
                  return (
                    <button
                      key={opt}
                      className={`rounded-lg border px-3 py-2 text-left text-sm ${
                        isSelected || isAnswered
                          ? "border-emerald-500 bg-emerald-50"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedOption(opt)}
                      disabled={answeredCurrent || timeUp || totalTimeUp}
                    >
                      <span className="font-semibold">{opt}.</span> {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => submitAnswer()}
                  disabled={!selectedOption || answering || timeUp || totalTimeUp}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
                >
                  {answeredCurrent ? "Answer submitted" : "Submit answer"}
                </button>
                {timeUp && (
                  <p className="text-xs text-red-600">
                    Time is up. Wait for the next question.
                  </p>
                )}
                {totalTimeUp && (
                  <p className="text-xs text-red-600">
                    Total quiz time is over. Answers are closed.
                  </p>
                )}
                {answeredCurrent && (
                  <p className="text-xs text-emerald-600">
                    Answer locked. Waiting for next question.
                  </p>
                )}
              </div>

            </>
          ) : (
            <p className="text-sm text-gray-600">
              Waiting for the host to start or change the question.
            </p>
          )}
        </section>
      )}

      {joined && sessionMode === "async" && (
        <section className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Self-paced quiz</h2>
            <span className="text-xs text-gray-500">
              {allQuestions.length} questions
            </span>
          </div>
          {allQuestions.length === 0 ? (
            <p className="text-sm text-gray-600">No questions available yet.</p>
          ) : (
            allQuestions.map((q, idx) => {
               const answeredOpt = answered[String(q.question_id)];
              return (
                <div key={q.question_id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Q{idx + 1}: {q.question_text}
                      </p>
                      {typeof q.time_limit === "number" && q.time_limit > 0 && (
                        <p className="text-[11px] text-gray-500">
                          Time hint: {q.time_limit}s
                        </p>
                      )}
                    </div>
                    {answeredOpt && (
                      <span className="text-[11px] text-emerald-600">Answered</span>
                    )}
                  </div>
                  <div className="grid gap-2">
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
                      const isSelected = selectedOption === opt && question?.question_id === q.question_id;
                      const isAnswered = answeredOpt === opt;
                      return (
                        <button
                          key={opt}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${
                            isSelected || isAnswered
                              ? "border-emerald-500 bg-emerald-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => {
                            setQuestion(q);
                            setSelectedOption(opt);
                            setQuestionStart(Date.now());
                          }}
                          disabled={!!answeredOpt || totalTimeUp}
                        >
                          <span className="font-semibold">{opt}.</span> {label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => submitAnswer(q)}
                    disabled={!selectedOption || question?.question_id !== q.question_id || totalTimeUp || answering}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
                  >
                    {answeredOpt ? "Answer submitted" : "Submit answer"}
                  </button>
                  {answeredOpt && (
                    <p className="text-xs text-emerald-600">
                      Answer locked for this question.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {joined && showSummary && allQuestions.length > 0 && (
  <section className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
    <h3 className="text-lg font-semibold">Your result</h3>
    {(() => {
      let correct = 0;
      let unanswered = 0;
      allQuestions.forEach((q) => {
        const ans = answered[String(q.question_id)];
        if (!ans) {
          unanswered += 1;
          return;
        }
        if (q.correct_option && ans === q.correct_option) {
          correct += 1;
        }
      });
      const total = allQuestions.length;
      const scorePct = total > 0 ? (correct * 100) / total : 0;
      return (
        <>
          {/* PERSONAL RESULT */}
          <div className="space-y-2">
            <p className="text-sm">
              Correct: <span className="font-semibold">{correct}</span> / {total}
              {"  "}({scorePct.toFixed(1)}%)
            </p>
            <p className="text-sm text-gray-600">Unanswered: {unanswered}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {allQuestions.map((q, idx) => {
                const ans = answered[String(q.question_id)];
                const isCorrect = q.correct_option && ans === q.correct_option;
                return (
                  <div
                    key={q.question_id}
                    className={`rounded-lg border p-3 text-xs ${
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50"
                        : ans
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="font-semibold">
                      Q{idx + 1}: {q.question_text}
                    </p>
                    {ans && !isCorrect && (
                      <p className="text-red-600">
                        Your answer: {ans} (incorrect)
                      </p>
                    )}
                    {!ans && <p className="text-gray-500">Not answered</p>}
                    {q.correct_option && (
                      <p className="text-emerald-700">
                        Correct answer: {q.correct_option}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROJECTOR-STYLE GROUP VIEW */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold">
              Class overview (projector view)
            </h4>
            <p className="text-xs text-gray-500">
              See how many people chose each option for every question.
            </p>

            {questionStats.length === 0 && (
              <p className="text-xs text-gray-500">
                Group stats are not available yet. Please wait for the host to
                publish results.
              </p>
            )}

            {questionStats.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {allQuestions.map((q, idx) => {
                  const s = statsByQuestionId[q.question_id];
                  if (!s) return null;

                  const options = [
                    {
                      key: "A" as const,
                      label: q.option_a,
                      count: s.option_a_count,
                      pct: s.option_a_pct,
                    },
                    {
                      key: "B" as const,
                      label: q.option_b,
                      count: s.option_b_count,
                      pct: s.option_b_pct,
                    },
                    {
                      key: "C" as const,
                      label: q.option_c,
                      count: s.option_c_count,
                      pct: s.option_c_pct,
                    },
                    {
                      key: "D" as const,
                      label: q.option_d,
                      count: s.option_d_count,
                      pct: s.option_d_pct,
                    },
                  ].filter((o) => o.label);

                  return (
                    <div
                      key={q.question_id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold">
                            Q{idx + 1}: {q.question_text}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {s.total_responses} responses
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {options.map((o) => (
                          <div key={o.key} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold">
                                {o.key}. {o.label}
                              </span>
                              <span className="text-gray-500">
                                {o.count} / {o.pct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 rounded bg-gray-200 overflow-hidden">
                              <div
                                className="h-2 bg-emerald-500"
                                style={{
                                  width: `${Math.min(o.pct, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      );
    })()}
  </section>
)}

    </main>
  );
}
