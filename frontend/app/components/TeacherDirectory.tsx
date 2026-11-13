"use client";

import { BookOpenText, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useDirectory } from "../lib/use-directory";

export function TeacherDirectory() {
  const [cluster, setCluster] = useState<string>("Semua");
  const [query, setQuery] = useState("");
  const {
    directory: { teachers },
    loading,
    error,
    refresh,
  } = useDirectory();
  const clusters = [
    "Semua",
    ...new Set(
      teachers.flatMap((teacher) => (teacher.cluster ? [teacher.cluster] : [])),
    ),
  ];
  const visible = useMemo(
    () =>
      teachers.filter((teacher) => {
        const matchesCluster =
          cluster === "Semua" || teacher.cluster === cluster;
        const haystack =
          `${teacher.name} ${teacher.subject} ${teacher.cluster}`.toLowerCase();
        return matchesCluster && haystack.includes(query.toLowerCase());
      }),
    [cluster, query, teachers],
  );

  return (
    <section className="teacher-directory">
      {loading && <p role="status">Memuat daftar guru…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void refresh()}>Coba lagi</button>
        </p>
      )}
      <header className="teacher-directory-heading">
        <div>
          <p className="section-kicker">Orang-orang di ruang belajar</p>
          <h2>
            Kenali guru yang
            <br />
            menemani prosesnya.
          </h2>
        </div>
        <div className="teacher-heading-aside">
          <p>
            Setiap guru membawa keahlian, cara pandang, dan satu tujuan yang
            sama: membantu siswa berani mencoba.
          </p>
          <div>
            <span>
              <b>{teachers.length}</b> guru & tenaga kependidikan
            </span>
          </div>
        </div>
      </header>
      <div className="teacher-toolbar">
        <label>
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari nama atau mata pelajaran"
            placeholder="Cari nama atau mata pelajaran"
          />
        </label>
        <div>
          {clusters.map((item) => (
            <button
              className={cluster === item ? "active" : ""}
              aria-pressed={cluster === item}
              onClick={() => setCluster(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="teacher-grid">
        {visible.map((teacher, index) => {
          return (
            <article
              className={`teacher-card tone-${teacher.tone}`}
              key={teacher.name}
            >
              <div className="teacher-portrait">
                <span>{teacher.initials}</span>
                <i>{String(index + 1).padStart(2, "0")}</i>
              </div>
              <div className="teacher-card-copy">
                <span className="teacher-subject">
                  <BookOpenText size={13} /> {teacher.subject}
                </span>
                <h3>{teacher.name}</h3>
                <p>{teacher.note}</p>
                <footer>
                  {teacher.cluster && <span>{teacher.cluster}</span>}
                  {teacher.years !== null && (
                    <b>{teacher.years} tahun mengajar</b>
                  )}
                </footer>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <div className="teacher-empty">
          <Sparkles size={21} />
          <b>Belum ada guru yang cocok.</b>
          <span>Coba kata kunci atau bidang lain.</span>
        </div>
      )}
    </section>
  );
}
