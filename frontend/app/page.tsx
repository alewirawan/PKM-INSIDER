import { HomeAchievements } from "./components/HomeAchievements";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HomeNews } from "./components/HomeNews";
import { HomePpdbCta } from "./components/HomePpdbCta";
import { SchoolText } from "./components/SchoolText";
import { programs } from "./data";
import { homeContent } from "./lib/content/home";

export default function Home() {
  return (
    <>
      <SiteHeader active="/" />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> SMP Nurul Huda · Cisoka, Tangerang
            </p>
            <h1>
              Kesempatan belajar.
              <br />
              <em>Harapan yang tumbuh.</em>
            </h1>
            <p className="hero-lead">{homeContent.heroLead}</p>
            <div className="hero-actions">
              <Link className="button button-accent" href="/pendaftaran">
                Mulai pendaftaran <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/tentang">
                Kenali sekolah kami <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="hero-trust">
              <span className="school-trust-mark" aria-hidden="true">
                ✦
              </span>
              <p>
                <strong>{homeContent.trust.score}</strong>
                <br />
                {homeContent.trust.caption}
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/sekolah/gedung-sekolah.jpeg"
              alt="Gedung dua lantai SMP Nurul Huda Cisoka dengan halaman dan pepohonan"
              width={1600}
              height={1200}
              sizes="(max-width: 820px) 100vw, 50vw"
              priority
            />
            <div className="hero-badge">
              <strong>{homeContent.badge.value}</strong>
              <span>
                {homeContent.badge.lines[0]}
                <br />
                {homeContent.badge.lines[1]}
              </span>
            </div>
            <div className="hero-card">
              <span className="hero-card-icon" aria-hidden="true">
                ✦
              </span>
              <div>
                <small>{homeContent.accreditation.label}</small>
                <strong>{homeContent.accreditation.value}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="Mengenal SMP Nurul Huda">
          {homeContent.stats.map((stat) => (
            <div key={stat.value}>
              <strong>{stat.value}</strong>
              <span>
                {stat.lines[0]}
                <br />
                {stat.lines[1]}
              </span>
            </div>
          ))}
        </section>

        <section className="intro-section">
          <p className="section-kicker">
            Belajar di <SchoolText field="schoolName" />
          </p>
          <h2>
            Setiap anak punya cahaya.
            <br />
            Kami membantu mereka <em>menemukannya.</em>
          </h2>
          <p>{homeContent.intro}</p>
        </section>

        <section className="program-section">
          <div className="section-heading horizontal">
            <div>
              <p className="section-kicker">Minat & ekstrakurikuler</p>
              <h2>
                Belajar dengan arah,
                <br />
                tumbuh dengan pilihan.
              </h2>
            </div>
            <Link className="text-link" href="/program">
              Lihat semua program →
            </Link>
          </div>
          <div className="program-grid">
            {programs.map((program) => (
              <article className="program-card" key={program.number}>
                <span className="program-number">{program.number}</span>
                <div>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                </div>
                <ul>
                  {program.subjects.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href="/program" aria-label={`Pelajari ${program.title}`}>
                  ↗
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="experience-section">
          <div className="experience-images">
            <Image
              className="image-main"
              src="/images/sekolah/halaman-sekolah.jpeg"
              alt="Halaman dan deretan ruang kelas SMP Nurul Huda Cisoka"
              width={1600}
              height={1200}
              sizes="(max-width: 820px) 86vw, 45vw"
            />
            <Image
              className="image-small"
              src="/images/sekolah/warga-sekolah.jpeg"
              alt="Foto bersama warga sekolah di halaman SMP Nurul Huda"
              width={1200}
              height={576}
              sizes="(max-width: 820px) 42vw, 22vw"
            />
            <span className="round-label">
              Ruang aman
              <br />
              untuk tumbuh
            </span>
          </div>
          <div className="experience-copy">
            <p className="section-kicker">Pengalaman yang utuh</p>
            <h2>Sekolah adalah tempat menemukan siapa dirimu.</h2>
            <p>{homeContent.experience}</p>
            <div className="feature-list">
              {homeContent.features.map((feature) => (
                <div key={feature.number}>
                  <b>{feature.number}</b>
                  <span>
                    <strong>{feature.title}</strong>
                    <small>{feature.text}</small>
                  </span>
                </div>
              ))}
            </div>
            <Link className="button button-dark" href="/tentang">
              Cerita tentang Nurul Huda
            </Link>
          </div>
        </section>

        <section className="quote-section">
          <span className="quote-mark">“</span>
          <blockquote>{homeContent.quote.text}</blockquote>
          <p>
            <b>{homeContent.quote.author}</b>
            <span>{homeContent.quote.role}</span>
          </p>
        </section>

        <section className="news-section">
          <div className="section-heading horizontal">
            <div>
              <p className="section-kicker">Cerita terbaru</p>
              <h2>Kabar dari Nurul Huda</h2>
            </div>
            <Link className="text-link" href="/blog">
              Baca semua cerita →
            </Link>
          </div>
          <HomeNews />
        </section>

        <HomeAchievements />
        <HomePpdbCta />
      </main>
      <SiteFooter />
    </>
  );
}
