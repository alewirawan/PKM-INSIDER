import { HomeAchievements } from "../components/HomeAchievements";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { HomeNews } from "../components/HomeNews";
import { HomePpdbCta } from "../components/HomePpdbCta";
import { SchoolText } from "../components/SchoolText";
import { programs } from "../data";
import { homeContent } from "../lib/content/home";

export default function Home() {
  return (
    <>
      <SiteHeader active="/" />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> Pendidikan yang tumbuh bersama zaman
            </p>
            <h1>
              Membentuk generasi yang <em>berani bermimpi.</em>
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
              <div className="avatar-stack" aria-hidden="true">
                <span>AN</span>
                <span>KS</span>
                <span>RM</span>
              </div>
              <p>
                <strong>{homeContent.trust.score}</strong>
                <br />
                {homeContent.trust.caption}
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/hero-classroom.jpg"
              alt="Guru dan siswa belajar bersama di ruang kelas"
              width={1800}
              height={1120}
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

        <section className="stats" aria-label="Statistik sekolah">
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
              <p className="section-kicker">Program unggulan</p>
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
              src="/images/campus.jpg"
              alt="Lingkungan kampus sekolah yang hijau"
              width={1600}
              height={1048}
              sizes="(max-width: 820px) 86vw, 45vw"
            />
            <Image
              className="image-small"
              src="/images/students.jpg"
              alt="Siswa Nurul Huda berdiskusi bersama"
              width={1400}
              height={933}
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
