import type { Post } from "../../data";
import { ApiError, hasBackendApi, requestApi } from "../api-client";
import { getBlogPosts, upsertBlogPost, deleteBlogPost } from "./posts-demo";
import type { CmsPost, PostStatus } from "./types";

export type PostPayload = Omit<Post, "date" | "readTime"> & {
  author: string;
  status: PostStatus;
  publishedAt: string;
};

type ApiPost = Omit<PostPayload, "publishedAt"> & {
  id: string;
  publishedAt: string;
  updatedAt: string;
};

export function slugify(value: string) {
  return (
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "artikel-baru"
  );
}

export function parseArticleContent(value: string) {
  return value.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function articleContentToText(content: string[]) {
  return content.join("\n\n");
}

export function estimateReadTime(content: string[]) {
  const words = content.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} menit`;
}

export function formatIndonesianDate(value: string) {
  const date = value.length === 10
    ? new Date(`${value}T12:00:00.000Z`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date);
}

function fromApi(post: ApiPost): CmsPost {
  return {
    ...post,
    date: formatIndonesianDate(post.publishedAt),
    readTime: estimateReadTime(post.content),
  };
}

export async function listPublicPosts() {
  if (!hasBackendApi()) return getBlogPosts(false);
  const posts = await requestApi<ApiPost[]>("/posts");
  return posts.map(fromApi);
}

export async function listAdminPosts() {
  if (!hasBackendApi()) return getBlogPosts(true);
  const posts = await requestApi<ApiPost[]>("/admin/posts");
  return posts.map(fromApi);
}

export async function getPublicPost(slug: string) {
  if (!hasBackendApi()) {
    const post = getBlogPosts(false).find((item) => item.slug === slug);
    if (!post) throw new ApiError(404, "Artikel tidak ditemukan.");
    return post;
  }
  const post = await requestApi<ApiPost>(`/posts/by-slug/${encodeURIComponent(slug)}`);
  return fromApi(post);
}

export async function createPost(input: PostPayload) {
  if (!hasBackendApi()) return saveDemoPost(crypto.randomUUID(), input);
  return fromApi(await requestApi<ApiPost>("/posts", { method: "POST", body: JSON.stringify(input) }));
}

export async function updatePost(id: string, input: PostPayload) {
  if (!hasBackendApi()) return saveDemoPost(id, input);
  return fromApi(await requestApi<ApiPost>(`/posts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }));
}

export async function removePost(id: string) {
  if (!hasBackendApi()) { deleteBlogPost(id); return; }
  await requestApi<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

function saveDemoPost(id: string, input: PostPayload) {
  if (getBlogPosts(true).some((post) => post.id !== id && post.slug === input.slug))
    throw new ApiError(409, "Slug artikel sudah digunakan.");
  const post = fromApi({ ...input, id, updatedAt: new Date().toISOString() });
  upsertBlogPost(post);
  return post;
}
