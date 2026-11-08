"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { listPublicPosts } from "../lib/cms/posts";
import type { CmsPost } from "../lib/cms/types";

type Status = "loading" | "ready" | "error";

/**
 * Berita terbaru di beranda. Sumber data: listPublicPosts() milik anggota 4
 * (API bila dikonfigurasi, adapter demo bila tidak). Penempatan dan keadaan
 * loading/kosong/gagal milik anggota 1; jangan membuat daftar berita kedua.
 */
export function HomeNews() {
  const [items, setItems] = useState<CmsPost[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    listPublicPosts()
      .then((posts) => {
        if (!active) return;
        setItems(posts.slice(0, 3));
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  if (status === "loading")
    return (
      <p className="news-state" role="status">
        Memuat berita terbaru…
      </p>
    );
  if (status === "error")
    return (
      <div className="news-state is-error" role="alert">
        <p>Berita terbaru belum dapat ditampilkan.</p>
        <button type="button" className="button" onClick={retry}>
          Coba lagi
        </button>
      </div>
    );
  if (items.length === 0)
    return <p className="news-state">Belum ada berita yang diterbitkan.</p>;

  return (
    <div className="news-grid">
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
