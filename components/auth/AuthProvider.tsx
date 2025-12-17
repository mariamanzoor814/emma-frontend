// frontend/components/auth/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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
  logoutUser: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // helper to fetch /me with current access token
  const fetchMeWithToken = async (accessToken: string | null) => {
    if (!accessToken) return null;
    try {
      const meRes = await fetch(AUTH_ENDPOINTS.me, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!meRes.ok) return null;
      const me = await meRes.json();
      return me as AuthUser;
    } catch {
      return null;
    }
  };

  // On first load, try to fetch current user using tokens from storage
  useEffect(() => {
    const init = async () => {
      try {
        const access = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEYS.access) : null;
        if (access) {
          const me = await fetchMeWithToken(access);
          if (me) {
            setUser(me);
            return;
          }
          // if access token invalid, you could try using refresh token to get new access (not implemented here)
        }
        setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1) log in and get tokens via AUTH_ENDPOINTS.login (uses accounts/login)
      const res = await fetch(AUTH_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        // credentials: include is not needed for JWT auth unless backend also relies on session cookies
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = data?.detail || "Unable to log in with that email and password.";
        throw new Error(detail);
      }

      if (data?.access) {
        // save tokens using your helper
        saveAuthTokens(data.access, data.refresh);
        // also keep in localStorage for init logic (saveAuthTokens might already do this)
        try {
          localStorage.setItem(TOKEN_KEYS.access, data.access);
          localStorage.setItem(TOKEN_KEYS.refresh, data.refresh);
        } catch {}
      } else {
        throw new Error("Login did not return tokens.");
      }

      // 2) immediately fetch /me to populate user state
      const me = await fetchMeWithToken(data.access);
      if (me) {
        setUser(me);
      } else {
        // if /me fails, clear tokens to avoid inconsistent state
        clearAuthTokens();
        localStorage.removeItem(TOKEN_KEYS.access);
        localStorage.removeItem(TOKEN_KEYS.refresh);
        setUser(null);
        throw new Error("Failed to fetch user profile after login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    clearAuthTokens();
    try {
      localStorage.removeItem(TOKEN_KEYS.access);
      localStorage.removeItem(TOKEN_KEYS.refresh);
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, logoutUser, setUser }}
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
