"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { listPublicPosts } from "../lib/cms/posts";
import type { CmsPost } from "../lib/cms/types";

export function HomeNews() {
  const [items, setItems] = useState<CmsPost[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    listPublicPosts().then((posts) => { if (active) setItems(posts.slice(0, 3)); }).catch((error) => { if (active) setError(error instanceof Error ? error.message : "Berita gagal dimuat."); });
    return () => { active = false; };
  }, []);

  return (
    <div className="news-grid">
      {error && <p role="alert">{error}</p>}
      {items.map((post, index) => (
        <article
          className={`news-card ${index === 0 ? "featured" : ""}`}
          key={post.id}
        >
          <Link href={`/blog/${post.slug}`}>
            <Image
              src={post.image}
              alt={`Ilustrasi ${post.title}`}
              width={700}
              height={467}
              sizes="(max-width: 720px) 100vw, 33vw"
            />
          </Link>
          <div className="news-meta">
            <span>{post.category}</span>
            <time>{post.date}</time>
          </div>
          <h3>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <p>{post.excerpt}</p>
          <Link className="read-link" href={`/blog/${post.slug}`}>
            Baca cerita <span>→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
