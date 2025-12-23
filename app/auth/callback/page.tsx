"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_ENDPOINTS, TOKEN_KEYS } from "@/lib/authConfig";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SocialCallbackPage() {
  const router = useRouter();
  const { loginWithTokens } = useAuth(); // <-- use the token-based helper from AuthProvider
  const [message, setMessage] = useState("Finalizing login…");

  useEffect(() => {
    const finalize = async () => {
      console.log("SocialCallbackPage: Starting finalize...");
      try {
        console.log("SocialCallbackPage: Fetching JWT from", AUTH_ENDPOINTS.socialJwt);
        const res = await fetch(AUTH_ENDPOINTS.socialJwt, {
          method: "GET",
          credentials: "include", // session cookie
        });

        console.log("SocialCallbackPage: Fetch response status:", res.status);
        const data = await res.json().catch(() => null);
        console.log("SocialCallbackPage: Data received:", data);

        if (!res.ok || !data?.access || !data?.refresh) {
          throw new Error(data?.detail || "Social login failed (no tokens).");
        }

        // Use the centralized helper that saves tokens and loads /me
        console.log("SocialCallbackPage: Calling loginWithTokens...");
        await loginWithTokens(data.access, data.refresh);

        setMessage("Login successful. Redirecting…");
        setMessage("Login successful. Redirecting…");
        console.log("SocialCallbackPage: Redirecting to /dashboard");
        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        console.error("SocialCallbackPage: Error during finalize:", err);
        setMessage(err?.message || "Login failed. Please try again.");
      }
    };

    finalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, loginWithTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-60">
      <div className="rounded-xl bg-white px-6 py-4 shadow text-sm font-medium text-slate-800">
        {message}
      </div>
    </div>
  );
}
