"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const codeParam = params.get("code");

    if (!emailParam || !codeParam) {
      setError("Invalid access. Please request reset again.");
    } else {
      setEmail(emailParam);
      setCode(codeParam);
    }
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.passwordResetConfirm, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Reset failed.");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Set new password" subtitle="Enter your new password.">
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          required
        />
        <button
          type="submit"
          disabled={loading || !email || !code}
          className="mt-2 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-70"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthCard>
  );
}
