"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { listPublicPosts } from "../lib/cms/posts";
import type { CmsPost } from "../lib/cms/types";
import { NewsletterForm } from "./NewsletterForm";

export function PublicBlog() {
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Semua");
  useEffect(() => {
    let active = true;
    listPublicPosts().then((items) => { if (active) setPosts(items); }).catch((error) => { if (active) setError(error instanceof Error ? error.message : "Artikel gagal dimuat."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );
  const visible =
    category === "Semua"
      ? posts
      : posts.filter((post) => post.category === category);
  const [featured, ...rest] = visible;

  return (
    <>
      {loading ? <p role="status">Memuat artikel…</p> : error ? <p role="alert">{error}</p> : featured ? (
        <section className="featured-post">
          <Link href={`/blog/${featured.slug}`}>
            <Image
              src={featured.image}
              alt={`Ilustrasi ${featured.title}`}
              width={900}
              height={600}
              sizes="(max-width: 820px) 100vw, 55vw"
              priority
            />
          </Link>
          <div>
            <div className="news-meta">
              <span>{featured.category}</span>
              <time>{featured.date}</time>
            </div>
            <h2>
              <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p>{featured.excerpt}</p>
            <Link
              className="button button-dark"
              href={`/blog/${featured.slug}`}
            >
              Baca selengkapnya →
            </Link>
          </div>
        </section>
      ) : (
        <section className="empty-public-state">
          <h2>Belum ada artikel terbit.</h2>
          <p>
            Artikel yang dipublikasikan dari dashboard admin akan tampil
            otomatis di sini.
          </p>
        </section>
      )}
      <section className="blog-list-section">
        <div className="blog-filter">
          <strong>Artikel terbaru</strong>
          <div>
            {categories.map((item) => (
              <button
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="blog-grid">
          {rest.map((post) => (
            <article className="news-card" key={post.id}>
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
      </section>
      <section className="newsletter">
        <div>
          <p className="section-kicker">Newsletter Nurul Huda</p>
          <h2>Cerita baik, langsung ke kotak masuk.</h2>
        </div>
        <NewsletterForm />
      </section>
    </>
  );
}
