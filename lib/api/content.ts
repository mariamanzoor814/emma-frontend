// frontend/lib/api/content.ts
import { apiFetch } from "./client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type ContentBlock = {
  id: number;
  key: string;
  language: string;
  block_type: "text" | "markdown" | "html" | "json" | "image" | "list";
  value: any;
  sort_order: number;
};

export type Page = {
  id: number;
  slug: string;
  template: string;
  blocks: ContentBlock[];
};

export async function getPage(
  slug: string,
  lang: string = "en"
): Promise<Page> {
  return apiFetch<Page>(`/api/content/pages/${slug}/?lang=${lang}`);
}
