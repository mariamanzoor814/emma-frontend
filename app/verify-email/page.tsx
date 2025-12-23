"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CodeInput from "@/components/auth/CodeInput";
import { AuthCard } from "@/components/auth/AuthCard";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);

  // Get email from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (!emailParam) {
      setError("Email not found. Please register first.");
    } else {
      setEmail(emailParam.trim().toLowerCase());
      setCountdown(60); // start countdown on page load
    }
  }, []);

  // OTP countdown effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Submit verification code
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;

    setError(null);
    setSuccess(null);

    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(AUTH_ENDPOINTS.confirmRegistration, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Invalid code or email.");
      }

      setSuccess("Email verified! Account created. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const resendCode = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(AUTH_ENDPOINTS.resendSignup, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to resend code.");
      }

      setSuccess("Verification code resent. Check your email.");
      setCountdown(60); // reset countdown on resend
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Enter verification code"
      subtitle={email ? `We sent a 6-digit code to ${email}` : undefined}
    >
      <form onSubmit={submit} className="space-y-4" autoComplete="off">
        {error && (
          <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {email && (
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Verification code</label>
            <CodeInput value={code} onChange={setCode} />
            <p className="text-xs text-slate-400 mt-2">
              Enter the 6-digit code we sent to your email.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <button
          type="button"
          disabled={loading || countdown > 0 || !email}
          onClick={resendCode}
          className="mt-2 w-full text-sm text-violet-600 hover:text-violet-700 underline"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
}
