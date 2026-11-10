import type { Metadata } from "next";
import { ContactInformation } from "../components/ContactInformation";
import { ContactForm } from "../components/ContactForm";
import { PageHero } from "../components/PageHero";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi dan jadwalkan kunjungan ke SMP Nurul Huda.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader active="/kontak" />
      <main>
        <PageHero
          eyebrow="Hubungi kami"
          title="Kami senang mendengar dari Anda."
          description="Tanyakan program belajar, proses pendaftaran, atau jadwalkan kunjungan untuk merasakan langsung suasana Nurul Huda."
        />
        <section className="contact-layout">
          <div className="contact-map">
            <div className="map-grid" />
            <span className="map-road one" />
            <span className="map-road two" />
            <div className="map-pin">
              <b>N</b>
              <span>SMP Nurul Huda</span>
            </div>
          </div>
          <div className="contact-details">
            <p className="section-kicker">Kunjungi kampus</p>
            <h2>Rumah belajar kami terbuka untuk Anda.</h2>
            <ContactInformation />
          </div>
        </section>
        <section className="contact-form-section">
          <div>
            <p className="section-kicker">Kirim pesan</p>
            <h2>Ada yang ingin ditanyakan?</h2>
            <p>
              Isi formulir berikut. Pesan akan diterima pengelola sekolah untuk
              ditindaklanjuti.
            </p>
          </div>
          <ContactForm />
        </section>
        <section className="faq-section">
          <div className="section-heading">
            <p className="section-kicker">Pertanyaan umum</p>
            <h2>Informasi yang sering dicari.</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>Apakah PIP/KIP wajib dilampirkan?</summary>
              <p>
                Tidak. Lampirkan jika memiliki. Berkas wajib lainnya mengikuti
                persyaratan pada halaman Pendaftaran.
              </p>
            </details>
            <details>
              <summary>Bagaimana memperbaiki berkas pendaftaran?</summary>
              <p>
                Masuk melalui Portal Pendaftar dengan nomor dan password. Lihat
                catatan pemeriksaan, lalu unggah berkas pengganti yang belum
                terverifikasi.
              </p>
            </details>
            <details>
              <summary>Apakah bisa mendaftar langsung di sekolah?</summary>
              <p>
                Bisa. Hubungi panitia untuk membuat janji dan membawa dokumen.
                Panitia akan mencatat pendaftaran serta berkas yang diterima.
              </p>
            </details>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
