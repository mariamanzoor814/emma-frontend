// frontend/lib/api/config.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

//   const ACCESS_KEY = "emma_token";
// const REFRESH_KEY = "emma_refresh";
const ACCESS_KEY = "emma_access_token";
const REFRESH_KEY = "emma_refresh_token";

function getStoredTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  const access =
    window.sessionStorage.getItem(ACCESS_KEY) ||
    window.localStorage.getItem(ACCESS_KEY);
  const refresh =
    window.sessionStorage.getItem(REFRESH_KEY) ||
    window.localStorage.getItem(REFRESH_KEY);
  return { access, refresh };
}

function persistTokens(access: string | null, refresh: string | null) {
  if (typeof window === "undefined") return;
  if (access) {
    window.sessionStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(ACCESS_KEY, access);
  } else {
    window.sessionStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(ACCESS_KEY);
  }
  if (refresh) {
    window.sessionStorage.setItem(REFRESH_KEY, refresh);
    window.localStorage.setItem(REFRESH_KEY, refresh);
  } else {
    window.sessionStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }
}

let refreshingPromise: Promise<string | null> | null = null;

import { AUTH_ENDPOINTS } from "../authConfig";

async function refreshAccessToken(): Promise<string | null> {
  if (refreshingPromise) return refreshingPromise;
  const { refresh } = getStoredTokens();
  if (!refresh) return null;
  refreshingPromise = (async () => {
    try {
      // use AUTH_ENDPOINTS.refresh which points to /accounts/refresh/
      const res = await fetch(AUTH_ENDPOINTS.refresh, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        // credentials: "include", // only if backend expects cookies
      });
      if (!res.ok) {
        persistTokens(null, null);
        return null;
      }
      const data = await res.json().catch(() => ({} as any));
      if (data.access) {
        persistTokens(data.access as string, refresh);
        return data.access as string;
      }
      return null;
    } finally {
      refreshingPromise = null;
    }
  })();
  return refreshingPromise;
}

/**
 * authFetch
 * - Accepts a path starting with '/' (e.g. '/accounts/me/') or a full URL
 * - Sends JWT from localStorage as `Authorization: Bearer <token>`
 */
export async function authFetch(pathOrUrl: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const { access } = getStoredTokens();

  // if pathOrUrl starts with http use it as full URL, otherwise prefix API_BASE_URL
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE_URL}${pathOrUrl}`;

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (access) {
    (headers as any).Authorization = `Bearer ${access}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      (headers as any).Authorization = `Bearer ${newAccess}`;
      return authFetch(pathOrUrl, { ...options, headers }, false);
    }
  }

  return res;
}

// helpers for other code to set/clear tokens centrally
export function saveAuthTokens(access: string, refresh?: string | null) {
  persistTokens(access || null, refresh || null);
}

export function clearAuthTokens() {
  persistTokens(null, null);
}
