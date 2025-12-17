"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

type FormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
};

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ---------- VALIDATION HELPERS ---------- */

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) return "Username is required.";
    if (value.length < 3) return "Username must be at least 3 characters.";
    if (value.length > 30) return "Username must be at most 30 characters.";
    if (!USERNAME_REGEX.test(value)) {
      return "Only letters, numbers, underscores (_) and hyphens (-) are allowed.";
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address.";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    return undefined;
  };

  const validateConfirmPassword = (
    value: string,
    password: string
  ): string | undefined => {
    if (!value) return "Please confirm your password.";
    if (value !== password) return "Passwords do not match.";
    return undefined;
  };

  const validateField = (name: keyof FormState, value: string): string | undefined => {
    switch (name) {
      case "username":
        return validateUsername(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value, form.password);
      default:
        return undefined;
    }
  };

  /* ---------- EVENTS ---------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const key = name as keyof FormState;

    setForm((prev) => ({ ...prev, [key]: value }));

    // live validation
    const fieldError = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: fieldError }));
    setGlobalError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccess(null);

    // validate all fields before submit
    const newErrors: FieldErrors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(
        form.confirmPassword,
        form.password
      ),
    };

    setErrors(newErrors);

    // if any error exists, stop submission
    if (Object.values(newErrors).some((msg) => msg)) {
      setGlobalError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.register, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: form.email.trim().toLowerCase(),
    username: form.username.trim(),
    password: form.password,
  }),
  credentials: "include", // <-- ensure session cookie is stored by browser
});


      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail =
          data?.detail ||
          data?.email?.[0] ||
          data?.username?.[0] ||
          "Unable to create account. Please check your details.";
        throw new Error(detail);
      }

      setSuccess("Your account has been created. Please verify your email.");

      setTimeout(() => {
        router.push(`/verify-email?email=${form.email.trim().toLowerCase()}`);
      }, 1500);

    } catch (err: any) {
      setGlobalError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none transition-colors";
  const validRing =
    "border-slate-200 focus:ring-2 focus:ring-violet-500/70 focus:border-violet-500";
  const errorRing =
    "border-red-400 focus:ring-2 focus:ring-red-400/80 focus:border-red-500";

  return (
    <AuthCard
      title="Create an account"
      subtitle='Path to The "1% & Better".'
      // logoSrc="http://127.0.0.1:8000/media/emma-logo.png"
      // or logoSrc="/assets/emma-logo.png"
      footer={
        <p className="text-xs">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-violet-600 hover:text-violet-700"
            onClick={() => router.push("/login")}
          >
            Log in
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
        {globalError && (
          <div className="mb-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {globalError}
          </div>
        )}
        {success && (
          <div className="mb-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {/* USERNAME */}
        <div className="space-y-1">
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className={`${inputBase} ${
              errors.username ? errorRing : validRing
            }`}
            placeholder="Username"
          />
          {errors.username && (
            <p className="text-[11px] text-red-500">{errors.username}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`${inputBase} ${errors.email ? errorRing : validRing}`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-[11px] text-red-500">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={`${inputBase} pr-10 ${
                errors.password ? errorRing : validRing
              }`}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? (
                // eye off
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-3.5-10-8 0-1.3.3-2.5.84-3.6" />
                  <path d="M6.1 6.1C7.6 5.1 9.25 4.5 11 4.5c5 0 9 3.5 10 8-.38 1.9-1.43 3.6-2.9 4.9" />
                  <path d="M9.88 9.88A2.5 2.5 0 0 0 12 14.5c.4 0 .8-.1 1.16-.26" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              ) : (
                // eye
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500">{errors.password}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1">
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${inputBase} pr-10 ${
                errors.confirmPassword ? errorRing : validRing
              }`}
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                // eye off
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-3.5-10-8 0-1.3.3-2.5.84-3.6" />
                  <path d="M6.1 6.1C7.6 5.1 9.25 4.5 11 4.5c5 0 9 3.5 10 8-.38 1.9-1.43 3.6-2.9 4.9" />
                  <path d="M9.88 9.88A2.5 2.5 0 0 0 12 14.5c.4 0 .8-.1 1.16-.26" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              ) : (
                // eye
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <SocialButtons />
    </AuthCard>
  );
}
