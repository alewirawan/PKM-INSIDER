"use client";

import { BookOpenText, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useDirectory } from "../lib/use-directory";
import { type Teacher } from "../school-directory-data";

const clusters: ("Semua" | Teacher["cluster"])[] = [
  "Semua",
  "Sains",
  "Bahasa",
  "Sosial",
  "Kreatif & Karakter",
];
const portraitPositions = [
  "0% 0%",
  "33.333% 0%",
  "66.667% 0%",
  "100% 0%",
  "0% 100%",
  "33.333% 100%",
  "66.667% 100%",
  "100% 100%",
];

export function TeacherDirectory() {
  const [cluster, setCluster] = useState<(typeof clusters)[number]>("Semua");
  const [query, setQuery] = useState("");
  const {
    directory: { teachers },
    loading,
    error,
    refresh,
  } = useDirectory();
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
              <b>{teachers.length}</b> profil pendidik
            </span>
            <span>
              <b>4</b> rumpun belajar
            </span>
          </div>
        </div>
      </header>
      <div className="teacher-toolbar">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau mata pelajaran"
          />
        </label>
        <div>
          {clusters.map((item) => (
            <button
              className={cluster === item ? "active" : ""}
              onClick={() => setCluster(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="teacher-grid">
        {visible.map((teacher) => {
          const portraitIndex = teacher.portraitIndex % 8;
          return (
            <article
              className={`teacher-card tone-${teacher.tone}`}
              key={teacher.name}
            >
              <div
                className="teacher-portrait"
                style={{ backgroundPosition: portraitPositions[portraitIndex] }}
              >
                <span>{teacher.initials}</span>
                <i>{String(portraitIndex + 1).padStart(2, "0")}</i>
              </div>
              <div className="teacher-card-copy">
                <span className="teacher-subject">
                  <BookOpenText size={13} /> {teacher.subject}
                </span>
                <h3>{teacher.name}</h3>
                <p>“{teacher.note}”</p>
                <footer>
                  <span>{teacher.cluster}</span>
                  <b>{teacher.years} tahun mengajar</b>
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
