// frontend/components/auth/SocialButtons.tsx
"use client";

import React from "react";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

type Provider = "google" | "instagram" | "twitter";

const PROVIDER_LABEL: Record<Provider, string> = {
  google: "Sign up with Google",
  instagram: "Sign up with Instagram",
  twitter: "Sign up with X",
};

/* --------- brand icons --------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M11.99 10.2v3.72h5.18c-.2 1.2-.84 2.22-1.79 2.9l2.9 2.26c1.69-1.56 2.67-3.86 2.67-6.58 0-.63-.06-1.24-.18-1.82H11.99z"
      />
      <path
        fill="#34A853"
        d="M5.27 14.32l-.83.64-2.32 1.8C3.4 19.97 7.37 22 11.99 22c2.7 0 4.97-.9 6.63-2.42l-2.9-2.26c-.8.54-1.84.87-3.73.87-3.01 0-5.56-2-6.48-4.87z"
      />
      <path
        fill="#4A90E2"
        d="M2.12 6.76A9.96 9.96 0 0 0 1 12c0 1.83.49 3.55 1.44 5.04l2.83-2.72A5.94 5.94 0 0 1 4.97 12c0-.9.21-1.75.6-2.51z"
      />
      <path
        fill="#FBBC05"
        d="M11.99 4.04c1.86 0 3.16.8 3.89 1.46l2.84-2.77C16.95 1.44 14.69.5 11.99.5 7.37.5 3.4 2.53 2.12 6.76L5.57 9.5c.92-2.87 3.47-5.46 6.42-5.46z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M6 5l5.2 6.72L6 19h2.1l4.02-5.03L15.6 19H18l-5.3-6.94L17.6 5H15.5l-3.7 4.63L8.4 5H6z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICON_MAP: Record<Provider, React.ReactElement> = {
  google: <GoogleIcon />,
  instagram: <InstagramIcon />,
  twitter: <XIcon />,
};

/* --------- component --------- */

export function SocialButtons() {
  const handleSocial = (provider: Provider) => {
    if (typeof window === "undefined") return;

    const callbackUrl = window.location.origin + "/auth/callback";
    const url = AUTH_ENDPOINTS.socialStart(provider, callbackUrl);
    window.location.href = url;
  };

  return (
    <div className="mt-6">
      {/* divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">OR</span>
        </div>
      </div>

      {/* buttons */}
      <div className="space-y-3">
        {(["google", "instagram", "twitter"] as Provider[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleSocial(p)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
          >
            <span className="text-base">{ICON_MAP[p]}</span>
            <span>{PROVIDER_LABEL[p]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
