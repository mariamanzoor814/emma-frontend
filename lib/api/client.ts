// frontend/lib/api/client.ts
import { API_BASE_URL } from "../config";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 0 } // fresh in dev
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `API error ${res.status} ${res.statusText} for ${url}: ${text}`
    );
  }

  return res.json() as Promise<T>;
}
