import type { Metadata } from "next";
import { HomePpdbCta } from "../components/HomePpdbCta";
import { PageHero } from "../components/PageHero";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ClubDirectory } from "../components/ClubDirectory";
import { PublicAgenda } from "../components/PublicAgenda";
import { programs } from "../data";

export const metadata: Metadata = {
  title: "Program Belajar",
  description: "Program akademik dan pengembangan diri di SMP Nurul Huda.",
};

export default function ProgramPage() {
  return (
    <>
      <SiteHeader active="/program" />
      <main>
        <PageHero
          eyebrow="Program belajar"
          title="Pilih jalanmu. Temukan caramu bertumbuh."
          description="Mengembangkan ilmu, iman, keterampilan, dan minat melalui kegiatan belajar serta tujuh pilihan ekstrakurikuler SMP Nurul Huda."
        />
        <section className="program-detail-list">
          {programs.map((program, index) => (
            <article key={program.number}>
              <div className="program-detail-title">
                <span>{program.number}</span>
                <h2>{program.title}</h2>
              </div>
              <div>
                <p>{program.description}</p>
                <ul>
                  {program.subjects.map((item) => (
                    <li key={item}>✦ {item}</li>
                  ))}
                </ul>
              </div>
              <div className={`program-visual visual-${index + 1}`}>
                <b>{program.label}</b>
              </div>
            </article>
          ))}
        </section>
        <section className="learning-model">
          <div>
            <p className="section-kicker">Cara kami belajar</p>
            <h2>
              Tidak hanya tahu.
              <br />
              Siswa belajar melakukan.
            </h2>
            <p>
              Pembelajaran di SMP Nurul Huda mengutamakan kedisiplinan dan
              kehadiran siswa. Kegiatan di luar kelas melengkapi proses belajar
              dengan ruang untuk mengembangkan minat, kebersamaan, dan
              kepedulian.
            </p>
          </div>
          <div className="model-steps">
            <article>
              <b>01</b>
              <h3>Kehadiran</h3>
              <p>
                Mengikuti pembelajaran dengan disiplin dan bertanggung jawab.
              </p>
            </article>
            <article>
              <b>02</b>
              <h3>Pengembangan diri</h3>
              <p>
                Mengenali minat melalui kegiatan seni, keterampilan, dan
                olahraga.
              </p>
            </article>
            <article>
              <b>03</b>
              <h3>Akhlak & kepedulian</h3>
              <p>
                Membangun kebiasaan baik, iman, dan sikap peduli kepada sesama.
              </p>
            </article>
          </div>
        </section>
        <section className="extracurricular-section">
          <div className="section-heading horizontal">
            <div>
              <p className="section-kicker">Di luar kelas</p>
              <h2>
                Ruang untuk mencoba
                <br />
                hal yang kamu suka.
              </h2>
            </div>
            <p>
              Ekstrakurikuler menjadi laboratorium kepemimpinan, kolaborasi, dan
              ketekunan.
            </p>
          </div>
          <ClubDirectory />
        </section>
        <PublicAgenda />
        <HomePpdbCta />
      </main>
      <SiteFooter />
    </>
  );
}
