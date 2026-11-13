"use client";
import { useSchoolSettingsState } from "./SchoolSettingsProvider";
import school from "../../../contracts/school-profile.json";
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
      {(settings.phone || settings.whatsapp) && (
        <article>
          <span>Telepon / WhatsApp</span>
          <p>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
                {settings.phone}
              </a>
            )}
            {settings.phone && settings.whatsapp && <br />}
            {settings.whatsapp}
          </p>
        </article>
      )}
      <article>
        <span>Email sekolah</span>
        <p>
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
          {settings.ppdbEmail !== settings.email && (
            <>
              <br />
              <a href={`mailto:${settings.ppdbEmail}`}>{settings.ppdbEmail}</a>
            </>
          )}
        </p>
      </article>
      <article>
        <span>Panitia PPDB</span>
        <p>
          {school.ppdbContacts.join(" & ")}
          <br />
          Pendaftaran dilayani sepanjang tahun ajaran.
        </p>
      </article>
      <article>
        <span>Media sosial</span>
        <p>Facebook: {school.facebookName}</p>
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
