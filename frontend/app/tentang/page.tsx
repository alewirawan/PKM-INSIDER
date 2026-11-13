import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageHero } from "../components/PageHero";
import { HomePpdbCta } from "../components/HomePpdbCta";
import { aboutContent as content } from "../lib/content/about";

export const metadata: Metadata = {
  title: "Tentang Sekolah",
  description: content.hero.description,
};
export default function AboutPage() {
  return (
    <>
      <SiteHeader active="/tentang" />
      <main>
        <PageHero {...content.hero} />
        <section className="about-story">
          <div className="about-image">
            <Image
              src="/images/sekolah/halaman-sekolah.jpeg"
              alt="Gedung dan halaman SMP Nurul Huda Cisoka"
              width={1600}
              height={1200}
              sizes="(max-width: 820px) 100vw, 50vw"
            />
            <span>{content.story.badge}</span>
          </div>
          <div className="about-copy">
            <p className="section-kicker">{content.story.kicker}</p>
            <h2>{content.story.heading}</h2>
            {content.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Link className="text-link" href="/struktur">
              Kenali struktur & guru →
            </Link>
          </div>
        </section>
        <section className="school-timeline" aria-label="Perjalanan sekolah">
          {content.timeline.map((item) => (
            <article key={item.year}>
              <b>{item.year}</b>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
        <section className="vision-grid" aria-label="Visi dan misi sekolah">
          <article>
            <span>01</span>
            <p className="section-kicker">Visi sekolah</p>
            <h2>{content.vision}</h2>
          </article>
          <article>
            <span>02</span>
            <p className="section-kicker">Misi sekolah</p>
            <ol className="school-missions">
              {content.missions.map((mission) => (
                <li key={mission}>{mission}</li>
              ))}
            </ol>
          </article>
        </section>
        <section className="intro-section">
          <p className="section-kicker">Tujuan & karakter lulusan</p>
          <h2>
            Bekal untuk hari ini.
            <br />
            <em>Berarti untuk masa depan.</em>
          </h2>
        </section>
        <div className="value-grid">
          {content.values.map((v) => (
            <article key={v.number}>
              <b>{v.number}</b>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
        <HomePpdbCta />
      </main>
      <SiteFooter />
    </>
  );
}
