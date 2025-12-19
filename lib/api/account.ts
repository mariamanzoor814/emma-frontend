// frontend/lib/api/account.ts
import { apiFetch } from "./client";

export type Profile = {
  id: number;
  user: number;
  access_level: string;
  background: string;
  education: string;
  interests: string;
  iq_score: number | null;
  eq_score: number | null;
  gq_score: number | null;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  country: string;
  city: string;
  address: string;
  profession: string;
  organization: string;
  extra: Record<string, any>;
  net_worth: string | null;
  created_at: string;
  updated_at: string;
};

export type LocalChapter = {
  id: number;
  name: string;
  code: string;
  country: string;
  city: string;
  address: string;
  is_active: boolean;
};

export type Membership = {
  id: number;
  user: number;
  chapter: LocalChapter | null;
  chapter_id?: number | null;
  member_tier: string;
  rating_score: number;
  rating_notes: string;
  joined_at: string;
  updated_at: string;
};

export async function getProfile(token: string) {
  return apiFetch<Profile>("/accounts/profile/", {}, token);
}

export async function updateProfile(data: Partial<Profile>, token: string) {
  return apiFetch<Profile>(
    "/accounts/profile/",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function getChapters(token: string) {
  return apiFetch<LocalChapter[]>("/api/auth/chapters/", {}, token);
}

export async function getMembership(token: string) {
  return apiFetch<Membership>("/api/auth/membership/", {}, token);
}

export async function updateMembership(
  data: Partial<Pick<Membership, "chapter_id" | "member_tier" | "rating_score" | "rating_notes">>,
  token: string
) {
  return apiFetch<Membership>(
    "/api/auth/membership/",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}
