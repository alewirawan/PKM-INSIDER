"use client";
import { useSchoolSettingsState } from "./SchoolSettingsProvider";
export function ContactInformation() {
  const { settings, status, error, reload } = useSchoolSettingsState();
  if (status === "loading") return <p role="status">Memuat kontak sekolah…</p>;
  if (status === "error")
    return (
      <p role="alert">
        {error}
        <button onClick={reload}>Coba lagi</button>
      </p>
    );
  return (
    <div className="contact-list">
      <article>
        <span>Alamat</span>
        <p>{settings.address}</p>
      </article>
      <article>
        <span>Telepon / WhatsApp</span>
        <p>
          <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
            {settings.phone}
          </a>
          <br />
          {settings.whatsapp}
        </p>
      </article>
      <article>
        <span>Email sekolah</span>
        <p>
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
          <br />
          <a href={`mailto:${settings.ppdbEmail}`}>{settings.ppdbEmail}</a>
        </p>
      </article>
      <article>
        <span>Kunjungan sekolah</span>
        <p>
          Hubungi sekolah terlebih dahulu untuk memastikan waktu layanan dan
          membuat janji kunjungan.
        </p>
      </article>
    </div>
  );
}
