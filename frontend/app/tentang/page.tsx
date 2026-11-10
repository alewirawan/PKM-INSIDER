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
              src="/images/campus.jpg"
              alt="Ilustrasi lingkungan belajar sekolah"
              width={1600}
              height={1048}
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
        <section className="vision-grid" aria-label="Arah pendidikan">
          <article>
            <span>01</span>
            <p className="section-kicker">Arah pendidikan</p>
            <h2>{content.vision}</h2>
          </article>
          <article>
            <span>02</span>
            <p className="section-kicker">Semangat pembelajaran</p>
            <h2>{content.mission}</h2>
          </article>
        </section>
        <section className="intro-section">
          <p className="section-kicker">Nilai yang kami jaga</p>
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
