// frontend/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_ENDPOINTS, TOKEN_KEYS } from "@/lib/authConfig";

export default function SocialCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizing social login...");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(AUTH_ENDPOINTS.socialJwt, {
          credentials: "include", // use session cookie from allauth
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.access || !data?.refresh) {
          throw new Error(
            data?.detail || "Unable to complete social login."
          );
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEYS.access, data.access);
          localStorage.setItem(TOKEN_KEYS.refresh, data.refresh);
        }

        setMessage("Login successful. Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (err: any) {
        setMessage(err.message || "Social login failed. You can try again.");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-2xl bg-white shadow-lg px-6 py-5 text-sm text-slate-700">
        {message}
      </div>
    </div>
  );
}
