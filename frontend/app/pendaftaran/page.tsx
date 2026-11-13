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
      <main className="admission-page">
        <PageHero
          eyebrow="Penerimaan peserta didik baru"
          title="Langkah baru dimulai di Nurul Huda."
          description="Pendaftaran siswa SMP Nurul Huda Cisoka. Kenali persyaratannya, siapkan berkas, lalu isi formulir dari rumah."
        />
        <nav className="admission-quicklinks" aria-label="Navigasi pendaftaran">
          <a href="#formulir-ppdb">
            Isi formulir <span aria-hidden="true">↘</span>
          </a>
          <a href="#persyaratan-ppdb">Persyaratan</a>
          <a href="#alur-ppdb">Alur pendaftaran</a>
          <a href="/pendaftar">Sudah mendaftar? Masuk portal →</a>
        </nav>
        <section
          className="school-admission-facts"
          aria-label="Informasi biaya dan layanan PPDB"
        >
          <article>
            <span>01 / Akses pendidikan</span>
            <h2>Tanpa SPP. Tanpa uang gedung.</h2>
            <p>
              Biaya awal masuk digunakan untuk pembelian seragam dan atribut
              sekolah. Rincian administrasi dapat ditanyakan kepada panitia.
            </p>
          </article>
          <article>
            <span>02 / Kami siap membantu</span>
            <h2>Pak Humaidi & Bu Jannah</h2>
            <p>
              Pendaftaran dilayani sepanjang tahun ajaran. Berkas dapat diunggah
              melalui formulir atau diserahkan langsung ke sekolah.
            </p>
            <a
              className="text-link"
              href="/images/sekolah/brosur-ppdb.jpeg"
              target="_blank"
              rel="noreferrer"
            >
              Lihat brosur sekolah ↗
            </a>
          </article>
        </section>
        <section className="admission-content">
          <AdmissionInformation />
          <div id="formulir-ppdb" className="admission-form-anchor">
            <RegistrationForm />
          </div>
        </section>
        <section className="admission-steps" id="alur-ppdb">
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
