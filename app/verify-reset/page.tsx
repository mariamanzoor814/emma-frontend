"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import CodeInput from "@/components/auth/CodeInput";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

export default function VerifyResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (!emailParam) setError("Email not provided. Please request a reset again.");
    else setEmail(emailParam);
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;

    setError(null);
    if (code.length !== 6) return setError("Please enter the 6-digit code.");

    setLoading(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.passwordResetVerifyCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Invalid code.");
      }

      // ✅ Code verified → redirect to reset password
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verify your code" subtitle={email ? `We sent a code to ${email}` : undefined}>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {email && (
          <>
            <label className="text-sm text-slate-600">Verification code</label>
            <CodeInput value={code} onChange={setCode} />
          </>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          className="mt-2 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </AuthCard>
  );
}
