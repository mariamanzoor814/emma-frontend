"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/config";

import { PublicLiveSessionsList } from "./PublicLiveSessionsList";
import { MyQuizzesList } from "./MyQuizzesList";

type Role = "none" | "host" | "participant";
type HostStep = 1 | 2 | 3 | 4;

type QuestionDraft = {
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type QuestionPayload = {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  time_limit: number;
};

export function RealTimeQuizLanding() {
  const [role, setRole] = useState<Role>("none");
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("emma_token")
        : null;
    setIsAuthenticated(Boolean(token));
    setCheckedAuth(true);
  }, []);

  if (!checkedAuth) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <p className="text-sm text-gray-500">Loading quiz platform…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Real-Time 8PQ Quiz Platform
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl">
            You need to log in to host or join quizzes. Your quiz history and
            results are linked to your EMMA account.
          </p>
        </header>

        <div className="rounded-2xl border bg-amber-50 px-4 py-4 text-sm text-amber-800 flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
          <div>
            <p className="font-semibold mb-1">
              Sign in required to use Real-Time 8PQ.
            </p>
            <p className="mb-3">
              Please log in first, then come back to this page to host or join
              a quiz.
            </p>
            <a
              href="/login"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[color:var(--page-bg,#f3f4f9)]">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* HERO */}
        <header className="grid gap-8 md:grid-cols-[1.6fr,1.2fr] items-start">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              EMMA • Real-time 8PQ
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Host live 8PQ quizzes or{" "}
              <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                join in real time
              </span>
              .
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
              Questions and results update instantly for everyone – ideal for
              EMMA chapters, classrooms, and online events. Run sessions in{" "}
              <span className="font-semibold">live</span> or{" "}
              <span className="font-semibold">async</span> mode.
            </p>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live projector
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 border border-sky-100">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Host & participant views
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 border border-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Bias & logic focused
              </span>
            </div>
          </div>

          {/* ROLE SELECTION */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-200/40 via-sky-200/40 to-transparent blur-xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  What do you want to do?
                </h2>
                <span className="text-[11px] text-slate-500">
                  Pick a role to start
                </span>
              </div>
              <RoleSelection onSelect={setRole} />
            </div>
          </div>
        </header>

        {/* FLOWS */}
        {role === "host" && (
          <section className="mt-2">
            <HostFlow onBack={() => setRole("none")} />
          </section>
        )}

        {role === "participant" && (
          <section className="mt-2">
            <ParticipantFlow onBack={() => setRole("none")} />
          </section>
        )}

        {/* DASHBOARD ROWS */}
        <section className="grid gap-8 lg:grid-cols-[1.3fr,1fr] items-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                My quizzes
              </h2>
              <p className="text-[11px] text-slate-500">
                Manage and host your existing quizzes.
              </p>
            </div>
            <MyQuizzesList />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Public live quizzes
              </h2>
              <p className="text-[11px] text-slate-500">
                Join a live session in one click.
              </p>
            </div>
            <PublicLiveSessionsList />
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- ROLE SELECTION ---------- */

function RoleSelection({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect("host")}
        className="group flex flex-col items-start rounded-2xl border bg-white/90 p-4 text-left shadow-sm hover:shadow-md hover:border-blue-400 transition-all"
      >
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
          Host
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        </div>
        <h3 className="text-sm font-semibold mb-1">I want to host a quiz</h3>
        <p className="text-xs text-gray-600 mb-2">
          Create a quiz, choose public or private access, and control questions
          in real time.
        </p>
        <span className="text-[11px] font-medium text-blue-600 group-hover:underline">
          Continue as host →
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelect("participant")}
        className="group flex flex-col items-start rounded-2xl border bg-white/90 p-4 text-left shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
      >
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
          Participant
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <h3 className="text-sm font-semibold mb-1">I want to join a quiz</h3>
        <p className="text-xs text-gray-600 mb-2">
          Enter the session code you received. For private quizzes, you&apos;ll
          also need the password/key.
        </p>
        <span className="text-[11px] font-medium text-emerald-600 group-hover:underline">
          Continue as participant →
        </span>
      </button>
    </div>
  );
}

/* ---------- HOST FLOW ---------- */

function HostFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter();

  const [step, setStep] = useState<HostStep>(1);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { text: "", option_a: "", option_b: "", option_c: "", option_d: "" },
  ]);
  const [isPublic, setIsPublic] = useState(true);
  const [joinPassword, setJoinPassword] = useState("");
  const [sessionMode, setSessionMode] = useState<"live" | "async">("live");
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number>(0);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGoNextStep1 = quizTitle.trim().length > 0;
  const canGoNextStep2 = questions.every(
    (q) => q.text.trim() && q.option_a && q.option_b
  );
  const canCreateSession =
    quizId !== null &&
    (isPublic || (!isPublic && joinPassword.trim().length > 0));

  const createQuizAndQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const totalTimeSeconds = Math.max(
        0,
        Math.round(
          (Number.isFinite(totalTimeMinutes) ? totalTimeMinutes : 0) * 60
        )
      );

      const quizRes = await authFetch("/api/pq/quizzes/", {
        method: "POST",
        body: JSON.stringify({
          title: quizTitle,
          description: "",
          category: "8PQ",
          classroom: null,
          status: "draft",
          default_time_limit_seconds: 60,
          total_time_limit_seconds: totalTimeSeconds,
        }),
      });

      if (!quizRes.ok) {
        const data = await quizRes.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create quiz");
      }

      const quizData = await quizRes.json();
      const createdQuizId = quizData.id as number;
      setQuizId(createdQuizId);

      // Create questions sequentially
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const questionRes = await authFetch("/api/pq/questions/", {
          method: "POST",
          body: JSON.stringify({
            quiz: createdQuizId,
            text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: "",
            weights: null,
            time_limit_seconds: 0,
            order: index,
            active: true,
          }),
        });

        if (!questionRes.ok) {
          const data = await questionRes.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to create question");
        }
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Something went wrong while creating quiz");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch("/api/pq/sessions/", {
        method: "POST",
        body: JSON.stringify({
          quiz: quizId,
          classroom: null,
          mode: sessionMode,
          allow_guests: true,
          require_classroom_membership: false,
          show_leaderboard: true,
          show_names_on_projector: false,
          is_public: isPublic,
          join_password: isPublic ? "" : joinPassword || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create session");
      }

      const data = await res.json();
      const createdSessionCode = data.session_code as string;

      if (!createdSessionCode) {
        throw new Error("Backend did not return session_code");
      }

      setSessionCode(createdSessionCode);

      await authFetch(`/api/pq/sessions/${data.id}/start/`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      setStep(4);

      // Go straight to the polished host dashboard
      router.push(`/real-time-quiz/host/${createdSessionCode}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error creating session");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", option_a: "", option_b: "", option_c: "", option_d: "" },
    ]);
  };

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  return (
    <section className="space-y-6 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Host a new quiz</h2>
          <p className="text-sm text-gray-600">
            Create your quiz, choose how people join it, and then control it
            live — all from the host dashboard.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className={step >= 1 ? "font-semibold text-gray-800" : ""}>
          1. Quiz info
        </span>
        <span>→</span>
        <span className={step >= 2 ? "font-semibold text-gray-800" : ""}>
          2. Questions
        </span>
        <span>→</span>
        <span className={step >= 3 ? "font-semibold text-gray-800" : ""}>
          3. Access
        </span>
        <span>→</span>
        <span className={step >= 4 ? "font-semibold text-gray-800" : ""}>
          4. Go live
        </span>
      </div>

      {/* STEP 1 – QUIZ INFO */}
      {step === 1 && (
        <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Quiz title</label>
            <input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. EMMA 8PQ Warm-up Quiz"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-500">
              This title will appear to participants and in your results.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              disabled={!canGoNextStep1}
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
            >
              Next: Add questions →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 – QUESTIONS */}
      {step === 2 && (
        <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <h3 className="text-sm font-semibold">
            Questions (at least one required)
          </h3>
          <p className="text-xs text-gray-500">
            Keep questions short and clear. For 8PQ, each question can map to
            different pistons later via weights.
          </p>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className="rounded-xl border p-4 space-y-2 bg-gray-50"
              >
                <p className="text-xs font-semibold text-gray-500">
                  Question {index + 1}
                </p>
                <input
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(index, { text: e.target.value })
                  }
                  placeholder="Question text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 mb-2"
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    value={q.option_a}
                    onChange={(e) =>
                      updateQuestion(index, { option_a: e.target.value })
                    }
                    placeholder="Option A"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50"
                  />
                  <input
                    value={q.option_b}
                    onChange={(e) =>
                      updateQuestion(index, { option_b: e.target.value })
                    }
                    placeholder="Option B"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50"
                  />
                  <input
                    value={q.option_c}
                    onChange={(e) =>
                      updateQuestion(index, { option_c: e.target.value })
                    }
                    placeholder="Option C (optional)"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50"
                  />
                  <input
                    value={q.option_d}
                    onChange={(e) =>
                      updateQuestion(index, { option_d: e.target.value })
                    }
                    placeholder="Option D (optional)"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-dashed border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              + Add another question
            </button>
            <div className="space-x-2">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-md text-xs bg-gray-100 text-gray-700"
              >
                ← Back
              </button>
              <button
                disabled={!canGoNextStep2 || loading}
                onClick={createQuizAndQuestions}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Next: Access settings →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 – ACCESS */}
      {step === 3 && (
        <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <h3 className="text-sm font-semibold">Who can join this quiz?</h3>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setIsPublic(true);
                setJoinPassword("");
              }}
              className={`rounded-xl border p-4 text-left text-sm transition ${
                isPublic
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold mb-1">Public quiz</p>
              <p className="text-gray-600 text-xs">
                Anyone with the session code can join. No password required.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`rounded-xl border p-4 text-left text-sm transition ${
                !isPublic
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold mb-1">
                Private (password protected)
              </p>
              <p className="text-gray-600 text-xs">
                Participants need both the session code and the password you set
                here.
              </p>
            </button>
          </div>

          {!isPublic && (
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Session password / key
              </label>
              <input
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="e.g. EMMA2025"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              <p className="text-xs text-gray-500">
                Share this carefully with your participants.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Session mode</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setSessionMode("live")}
                className={`rounded-xl border p-4 text-left text-sm transition ${
                  sessionMode === "live"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold mb-1">Live (broadcast)</p>
                <p className="text-gray-600 text-xs">
                  You control which question is visible; participants answer in
                  real time.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSessionMode("async")}
                className={`rounded-xl border p-4 text-left text-sm transition ${
                  sessionMode === "async"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold mb-1">Async (self-paced)</p>
                <p className="text-gray-600 text-xs">
                  Participants can access the quiz on their own time.
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold">
              Total quiz time (minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={totalTimeMinutes}
                onChange={(e) => setTotalTimeMinutes(Number(e.target.value))}
                className="w-32 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-xs text-gray-500">
                0 = no overall limit. Applied when the session starts.
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-3 py-1.5 rounded-md text-xs bg-gray-100 text-gray-700"
            >
              ← Back
            </button>
            <button
              disabled={!canCreateSession || loading}
              onClick={createSession}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? "Creating session..." : "Create session & go live →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- PARTICIPANT FLOW ---------- */

function ParticipantFlow({ onBack }: { onBack: () => void }) {
  const [sessionCode, setSessionCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "joining" | "joined" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPayload | null>(null);

  const normalizedCode = sessionCode.trim().toUpperCase();

  const handleJoin = async () => {
    if (!normalizedCode) return;
    try {
      setStatus("joining");
      setError(null);

      const res = await authFetch(
        `/api/pq/sessions/${normalizedCode}/join/`,
        {
          method: "POST",
          body: JSON.stringify({ join_password: joinPassword || "" }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to join session");
      }

      setStatus("joined");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Error joining session");
    }
  };

  useEffect(() => {
    if (status !== "joined" || !normalizedCode) return;

    const token = localStorage.getItem("emma_token");
    const wsUrl = token
      ? `ws://localhost:8000/ws/pq/sessions/${normalizedCode}/?token=${encodeURIComponent(
          token
        )}`
      : `ws://localhost:8000/ws/pq/sessions/${normalizedCode}/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ action: "join" }));
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "current_question_changed") {
        setCurrentQuestion(data.data as QuestionPayload);
      }
      if (data.event === "session_ended") {
        setCurrentQuestion(null);
      }
    };
    ws.onclose = () => {
      // silently close for participants
    };

    return () => ws.close();
  }, [status, normalizedCode]);

  return (
    <section className="space-y-6 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Join a quiz</h2>
          <p className="text-sm text-gray-600">
            Enter the session code from your host. If the quiz is private, also
            enter the password/key they shared with you.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Session code</label>
          <input
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="e.g. PQ8F3K2L"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Password / key (if required)
          </label>
          <input
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            placeholder="Leave blank if the host said it’s public"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleJoin}
            disabled={!normalizedCode || status === "joining"}
            className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white disabled:opacity-50"
          >
            {status === "joining" ? "Joining…" : "Join quiz"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {status === "joined" && (
        <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.18em]">
                You&apos;re in
              </p>
              <p className="text-sm text-gray-600">
                Stay on this page. Questions appear here as your host starts the
                quiz.
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="text-[11px] text-gray-500">Session code</p>
              <p className="font-mono px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                {normalizedCode}
              </p>
            </div>
          </div>

          {currentQuestion ? (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <h3 className="text-base font-semibold text-slate-900">
                {currentQuestion.question_text}
              </h3>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div className="rounded-xl bg-white border px-3 py-2">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    A.
                  </span>
                  {currentQuestion.option_a}
                </div>
                <div className="rounded-xl bg-white border px-3 py-2">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    B.
                  </span>
                  {currentQuestion.option_b}
                </div>
                {currentQuestion.option_c && (
                  <div className="rounded-xl bg-white border px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      C.
                    </span>
                    {currentQuestion.option_c}
                  </div>
                )}
                {currentQuestion.option_d && (
                  <div className="rounded-xl bg-white border px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      D.
                    </span>
                    {currentQuestion.option_d}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Time limit: {currentQuestion.time_limit}s</span>
                <span>
                  To answer, use the full play UI:{" "}
                  <a
                    href={`/real-time-quiz/play/${normalizedCode}`}
                    className="text-blue-600 underline"
                  >
                    open play view →
                  </a>
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Waiting for the host to start or change the question…
            </p>
          )}
        </div>
      )}
    </section>
  );
}
