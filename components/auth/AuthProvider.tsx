// frontend/components/auth/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { AUTH_ENDPOINTS, TOKEN_KEYS } from "@/lib/authConfig";
import { saveAuthTokens, clearAuthTokens } from "@/lib/config";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  access_level: string;
  access_level_label: string;
  avatar_url?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  loginWithTokens: (access: string, refresh: string) => Promise<void>;
  logoutUser: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ...imports and types (unchanged)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeWithToken = useCallback(async (accessToken: string | null) => {
    if (!accessToken) return null;
    try {
      const meRes = await fetch(AUTH_ENDPOINTS.me, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!meRes.ok) {
        console.error("fetchMeWithToken failed:", meRes.status, meRes.statusText);
        return null;
      }
      const me = await meRes.json();
      console.log("fetchMeWithToken success:", me);
      return me as AuthUser;
    } catch (e) {
      console.error("fetchMeWithToken error:", e);
      return null;
    }
  }, []);

  // On first load, try to fetch current user using tokens from storage
  useEffect(() => {
    const init = async () => {
      try {
        const access = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEYS.access) : null;
        console.log("AuthProvider init: Found access token?", access ? "Yes (length " + access.length + ")" : "No");

        if (access) {
          console.log("AuthProvider init: Fetching me...");
          const me = await fetchMeWithToken(access);
          if (me) {
            console.log("AuthProvider init: Me fetched successfully", me);
            setUser(me);
            return;
          } else {
             console.error("AuthProvider init: Fetch me returned null");
          }
        } else {
             console.log("AuthProvider init: No access token found in localStorage");
        }
        setUser(null);
      } catch (err) {
        console.error("AuthProvider init: Error", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMeWithToken]);

  // NEW: centralized token-based login used by social flow and normal login once tokens are obtained
  const loginWithTokens = useCallback(async (access: string, refresh: string) => {
    setLoading(true);
    try {
      // Save tokens (use your helper if you have one)
      try {
        localStorage.setItem(TOKEN_KEYS.access, access);
        localStorage.setItem(TOKEN_KEYS.refresh, refresh);
      } catch {}

      // Optionally call saveAuthTokens(access, refresh) if you use cookies/local secure storage there:
      try {
        saveAuthTokens(access, refresh);
      } catch {}

      // Fetch /me and set user
      const me = await fetchMeWithToken(access);
      if (!me) {
        // token invalid: cleanup
        localStorage.removeItem(TOKEN_KEYS.access);
        localStorage.removeItem(TOKEN_KEYS.refresh);
        setUser(null);
        throw new Error("Failed to fetch user profile after token login.");
      }

      console.log("loginWithTokens: Setting user", me);
      setUser(me);
    } finally {
      setLoading(false);
    }
  }, [fetchMeWithToken]);

  // Existing loginUser (email/password) unchanged
  const loginUser = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = data?.detail || "Unable to log in with that email and password.";
        throw new Error(detail);
      }

      if (!data?.access || !data?.refresh) throw new Error("Login did not return tokens.");

      // reuse new helper
      await loginWithTokens(data.access, data.refresh);
    } finally {
      setLoading(false);
    }
  }, [loginWithTokens]);

  const logoutUser = useCallback(() => {
    clearAuthTokens();
    try {
      localStorage.removeItem(TOKEN_KEYS.access);
      localStorage.removeItem(TOKEN_KEYS.refresh);
    } catch {}
    setUser(null);
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        loginWithTokens,        // <-- expose it
        logoutUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
