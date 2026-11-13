"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Trophy } from "lucide-react";
import { useCatalog } from "../lib/use-catalog";

export function Achievements({ compact = false }: { compact?: boolean }) {
  const { achievements, achievementsLoading, achievementsError, refresh } =
    useCatalog();
  const [category, setCategory] = useState("Semua");
  const [year, setYear] = useState("Semua");
  const published = achievements
    .filter((item) => item.published)
    .sort((a, b) => b.year.localeCompare(a.year));
  const visible = compact
    ? published.slice(0, 3)
    : published.filter(
        (item) =>
          (category === "Semua" || category === item.category) &&
          (year === "Semua" || year === item.year),
      );
  if (
    compact &&
    !achievementsLoading &&
    !achievementsError &&
    published.length === 0
  )
    return null;
  return (
    <section className={"achievements-section" + (compact ? " compact" : "")}>
      <header className="achievement-heading">
        <div>
          <p className="section-kicker">Jejak usaha, cerita bersama</p>
          <h2>
            {compact
              ? "Ruang untuk tumbuh. Alasan untuk bangga."
              : "Setiap pencapaian punya cerita."}
          </h2>
        </div>
        {compact && (
          <Link className="text-link" href="/prestasi">
            Lihat semua prestasi <ArrowUpRight size={16} />
          </Link>
        )}
      </header>
      {achievementsLoading && <p role="status">Memuat prestasi…</p>}
      {achievementsError && (
        <p role="alert">
          {achievementsError}{" "}
          <button onClick={() => void refresh()}>Coba lagi</button>
        </p>
      )}
      {!compact && (
        <div className="achievement-filters">
          <label>
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Semua</option>
              {[...new Set(published.map((i) => i.category))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Tahun
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option>Semua</option>
              {[...new Set(published.map((i) => i.year))].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <span>{visible.length} cerita prestasi</span>
        </div>
      )}
      <div className="achievement-grid">
        {visible.map((item, index) => (
          <article className="achievement-card" key={item.id}>
            <div className="achievement-image">
              <Image
                src={item.image}
                alt={"Ilustrasi " + item.title}
                width={800}
                height={550}
              />
              <span>
                {item.year} / {item.level}
              </span>
            </div>
            <div className="achievement-copy">
              <span className="achievement-award">
                <Trophy size={18} />
                {item.award}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <footer>
                <span>{item.category}</span>
                <small>0{index + 1} · Pencapaian sekolah</small>
              </footer>
            </div>
          </article>
        ))}
      </div>
      {!achievementsLoading && !achievementsError && !visible.length && (
        <div className="catalog-empty">
          <Trophy size={32} />
          <h3>Belum ada prestasi yang ditampilkan</h3>
          <p>
            {published.length
              ? "Coba kategori atau tahun lainnya."
              : "Cerita pencapaian siswa akan dibagikan di halaman ini."}
          </p>
          {!compact && published.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCategory("Semua");
                setYear("Semua");
              }}
            >
              Reset filter
            </button>
          )}
        </div>
      )}
    </section>
  );
}
