import type { Metadata } from "next";
import { PageHero } from "../components/PageHero";
import { AdmissionInformation } from "../components/registration/AdmissionInformation";
import { RegistrationForm } from "../components/RegistrationForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Pendaftaran Siswa",
  description: "Informasi dan formulir PPDB SMP Nurul Huda.",
};

export default function RegistrationPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Penerimaan peserta didik baru"
          title="Satu langkah menuju perjalanan yang berarti."
          description="Temukan alur, jadwal, persyaratan, dan isi formulir pendaftaran calon siswa SMP Nurul Huda."
        />
        <section className="admission-content">
          <AdmissionInformation />
          <RegistrationForm />
        </section>
        <section className="admission-steps">
          <div className="section-heading">
            <p className="section-kicker">Alur seleksi</p>
            <h2>Empat langkah menuju Nurul Huda.</h2>
          </div>
          <div className="step-grid">
            <article>
              <b>01</b>
              <h3>Isi formulir</h3>
              <p>Lengkapi data calon siswa dan orang tua.</p>
            </article>
            <article>
              <b>02</b>
              <h3>Verifikasi</h3>
              <p>Tim kami memeriksa kelengkapan dokumen.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Tindak lanjut</h3>
              <p>Ikuti arahan panitia dan perbaiki berkas jika diperlukan.</p>
            </article>
            <article>
              <b>04</b>
              <h3>Pengumuman</h3>
              <p>Hasil seleksi tersedia melalui portal.</p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
