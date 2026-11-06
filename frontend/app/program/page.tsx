import type { Metadata } from "next";
import Link from "next/link";
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
          description="Kurikulum nasional diperkaya pengalaman lintas disiplin, proyek nyata, dan pendampingan yang membantu siswa mengenali minatnya."
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
                <b>{index === 0 ? "STEM" : index === 1 ? "HUM" : "ART"}</b>
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
              Setiap semester, siswa memilih tantangan nyata dan mengembangkan
              solusi bersama tim. Guru berperan sebagai mentor, sementara proses
              dan refleksi menjadi bagian penting dari penilaian.
            </p>
          </div>
          <div className="model-steps">
            <article>
              <b>01</b>
              <h3>Eksplorasi</h3>
              <p>Mengenali masalah dan mengumpulkan sudut pandang.</p>
            </article>
            <article>
              <b>02</b>
              <h3>Eksperimen</h3>
              <p>Menguji ide dan belajar dari kegagalan.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Ekspresi</h3>
              <p>Mengkomunikasikan karya kepada audiens nyata.</p>
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
        <section className="cta-section">
          <p className="section-kicker">Siap menemukan pilihanmu?</p>
          <h2>
            Mulai perjalananmu
            <br />
            bersama Nurul Huda.
          </h2>
          <p>Pendaftaran calon siswa tahun ajaran 2026/2027 sudah dibuka.</p>
          <div>
            <Link className="button button-accent" href="/pendaftaran">
              Lihat alur pendaftaran
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
