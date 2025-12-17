// frontend/lib/api/auth.ts
import { API_BASE_URL, authFetch, saveAuthTokens } from "./config";
import { AUTH_ENDPOINTS } from "@/lib/authConfig";

export type LoginResponse = {
  access: string;
  refresh?: string | null;
};

export type MeResponse = {
  id: number;
  username: string;
  email: string | null;
  access_level: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};


export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(AUTH_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Partial<LoginResponse>;

  if (!res.ok || !data.access) {
    throw new Error("Login failed");
  }

  return { access: data.access, refresh: data.refresh ?? null };
}

export async function getMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch(AUTH_ENDPOINTS.me, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }

  return res.json() as Promise<MeResponse>;
}

export function storeTokens(access: string, refresh?: string | null) {
  saveAuthTokens(access, refresh ?? undefined);
}


