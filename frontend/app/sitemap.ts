import type { MetadataRoute } from "next";
import { posts } from "./data";
type SitemapPost = { slug: string; updatedAt?: string };

async function getPublishedPosts(): Promise<SitemapPost[]> {
  const apiBase = (
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL
  )?.replace(/\/$/, "");
  if (!apiBase) return posts;
  try {
    const response = await fetch(`${apiBase}/posts`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as unknown;
    return Array.isArray(data)
      ? data.filter((item): item is SitemapPost =>
          Boolean(item && typeof item === "object" && "slug" in item),
        )
      : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const publishedPosts = await getPublishedPosts();
  const pages = [
    "",
    "/tentang",
    "/struktur",
    "/prestasi",
    "/program",
    "/blog",
    "/pendaftaran",
    "/kontak",
  ];
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date("2026-09-18"),
      changeFrequency:
        path === "/blog" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.8,
    })),
    ...publishedPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? "2026-09-18"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
