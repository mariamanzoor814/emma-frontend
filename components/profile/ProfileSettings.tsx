"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/config";
import { useAuth } from "@/components/auth/AuthProvider";

type Profile = {
  id: number;
  user: number;
  bio: string;
  about: string;
  location: string;
  country: string;
  city: string;
  address: string;
  avatar_url?: string | null;
};

export function ProfileSettings() {
  const { user, logoutUser, loading, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStats, setQuizStats] = useState<{ total: number; published: number; draft: number }>({
    total: 0,
    published: 0,
    draft: 0,
  });

  useEffect(() => {
    if (!user || loading) return;
    loadProfile();
    loadQuizStats();
  }, [user, loading]);

  const loadProfile = async () => {
    try {
      const res = await authFetch("/api/auth/profile/");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile({
        id: data.id,
        user: data.user,
        bio: data.bio || "",
        about: data.about || "",
        location: data.location || "",
        country: data.country || "",
        city: data.city || "",
        address: data.address || "",
        avatar_url: data.avatar_url,
      });
    } catch (err: any) {
      setError(err.message || "Could not load profile");
    }
  };

  const loadQuizStats = async () => {
    try {
      const res = await authFetch("/api/pq/quizzes/");
      if (!res.ok) return;
      const data = await res.json();
      const total = Array.isArray(data) ? data.length : 0;
      const published = Array.isArray(data)
        ? data.filter((q: any) => q.status === "published").length
        : 0;
      const draft = Array.isArray(data)
        ? data.filter((q: any) => q.status !== "published").length
        : 0;
      setQuizStats({ total, published, draft });
    } catch {
      /* ignore */
    }
  };

  const handleSave = async (fileOverride?: File | null) => {
    if (!profile) return;
    setSaving(true);
    if (fileOverride) setAvatarUploading(true);
    setError(null);
    try {
      const file = fileOverride ?? avatarFile;
      const form = new FormData();
      form.append("bio", profile.bio || "");
      form.append("about", profile.about || "");
      form.append("location", profile.location || "");
      form.append("country", profile.country || "");
      form.append("city", profile.city || "");
      form.append("address", profile.address || "");
      if (file) {
        form.append("avatar", file);
      }
      const res = await authFetch("/api/auth/profile/", {
        method: "PATCH",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to save profile");
      }
      const data = await res.json();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              bio: data.bio || "",
              about: data.about || "",
              location: data.location || "",
              country: data.country || "",
              city: data.city || "",
              address: data.address || "",
              avatar_url: data.avatar_url || prev.avatar_url,
            }
          : prev
      );
      setAvatarFile(null);
      setAvatarPreview(null);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatar_url: data.avatar_url || prev.avatar_url,
            }
          : prev
      );
    } catch (err: any) {
      setError(err.message || "Could not save profile");
    } finally {
      setSaving(false);
      setAvatarUploading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "Delete your account? This will remove your profile and sign you out."
    );
    if (!ok) return;
    try {
      const res = await authFetch("/api/auth/delete-account/", { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(async () => {
          const text = await res.text().catch(() => "");
          return { detail: text };
        });
        const detail =
          data.detail ||
          data.error ||
          "Failed to delete account. Remove linked quizzes/records and try again.";
        throw new Error(detail);
      }
      logoutUser();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message ||
          "Could not delete account. If you have quizzes or attempts linked to this account, remove them first."
      );
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
    if (file) {
      void handleSave(file);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <p className="text-sm text-gray-600">You need to log in to view your profile.</p>
        <a href="/login" className="text-blue-600 underline text-sm">
          Go to login
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Account</p>
          <h1 className="text-2xl font-semibold">Your profile</h1>
          <p className="text-sm text-gray-600">Manage your info, avatar, and account.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 border relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Click to change profile photo"
          >
            {(avatarPreview || profile?.avatar_url) ? (
              <img
                src={avatarPreview || profile?.avatar_url || ""}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
          </button>
          <div className="text-right text-sm">
            <p className="font-semibold">{user.first_name || user.username}</p>
            <p className="text-gray-500">{user.email}</p>
            {avatarFile && (
              <p className="text-[11px] text-gray-500 mt-1">
                {avatarUploading ? "Uploading..." : `Selected: ${avatarFile.name}`}
              </p>
            )}
          </div>
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <section className="border rounded-2xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profile details</h2>
          <button
            type="button"
            onClick={handleAvatarClick}
            className="text-xs font-semibold text-blue-600 underline"
          >
            Change profile photo
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Bio</label>
            <textarea
              value={profile?.bio || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, bio: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">About</label>
            <textarea
              value={profile?.about || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, about: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Location</label>
            <input
              value={profile?.location || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, location: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Address</label>
            <input
              value={profile?.address || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, address: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Street address"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">City</label>
            <input
              value={profile?.city || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, city: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="City"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Country</label>
            <input
              value={profile?.country || ""}
              onChange={(e) => setProfile((p) => (p ? { ...p, country: e.target.value } : p))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Country"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {avatarFile ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Selected: {avatarFile.name}</span>
              <button
                type="button"
                className="underline"
                onClick={() => setAvatarFile(null)}
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Click your photo above to add/update.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </section>

      <section className="border rounded-2xl p-5 bg-white shadow-sm grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total quizzes</p>
          <p className="text-2xl font-semibold">{quizStats.total}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-gray-500">Published</p>
          <p className="text-2xl font-semibold text-emerald-600">{quizStats.published}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-gray-500">Drafts</p>
          <p className="text-2xl font-semibold text-amber-600">{quizStats.draft}</p>
        </div>
      </section>

      <section className="border rounded-2xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>
        <p className="text-sm text-gray-600">
          Delete your account and profile. This cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          className="mt-3 px-4 py-2 rounded-md bg-red-600 text-white text-sm"
        >
          Delete account
        </button>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </main>
  );
}
