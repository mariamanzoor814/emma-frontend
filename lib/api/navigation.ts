// frontend/lib/api/navigation.ts
import { apiFetch } from "./client";

/**
 * MenuItem shape used by Sidebar / TopBar
 * - Use optional fields so partial items from backend don't break rendering
 */
export type MenuItem = {
  id: number;
  title_key: string;             // i18n key (required)
  slug?: string | null;          // optional slug stored in CMS
  path?: string | null;          // optional absolute/relative path (e.g. "/about")
  position?: "top" | "main" | "footer";
  order?: number;
  open_in_new_tab?: boolean;
  children?: MenuItem[];         // optional children
};

/**
 * Fetch menu items for a given position.
 * Encodes the position, returns [] on error to keep UI stable.
 */
export async function getMenu(position: "top" | "main" | "footer"): Promise<MenuItem[]> {
  try {
    const encoded = encodeURIComponent(position);
    const res = await apiFetch<MenuItem[]>(`/api/navigation/menus?position=${encoded}`);
    // ensure result is an array (backend may return null)
    return Array.isArray(res) ? res : [];
  } catch (err) {
    // optionally log error here
    console.error("getMenu error:", err);
    return [];
  }
}
