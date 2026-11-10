"use client";
import Link from "next/link";
import { useSchoolSettingsState } from "../SchoolSettingsProvider";
import { documentLabels } from "../../lib/cms/student-documents";
export function AdmissionInformation() {
  const { settings, status, error, reload } = useSchoolSettingsState();
  const date = (v: string | null) =>
    v
      ? new Date(v).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Menunggu informasi sekolah";
  return (
    <aside className="admission-guide">
      <p className="section-kicker">PPDB {settings.academicYear}</p>
      <h2>Siapkan langkah pertamamu.</h2>
      {status === "error" ? (
        <p role="alert">
          {error}
          <button onClick={reload}>Coba lagi</button>
        </p>
      ) : status === "loading" ? (
        <p role="status">Memuat persyaratan…</p>
      ) : (
        <>
          <p>
            <b>
              {settings.registrationOpen
                ? "Pendaftaran dibuka"
                : "Pendaftaran ditutup"}
            </b>
          </p>
          <p>
            Informasi mulai: {date(settings.registrationOpensAt)}
            <br />
            Informasi selesai: {date(settings.registrationClosesAt)}
          </p>
          <ul>
            {documentLabels.map((d, i) => (
              <li key={d.key}>
                <b>0{i + 1}</b>
                <span>
                  {d.label}
                  <small>
                    {settings.documentRequirements.requiredKinds.includes(
                      d.key as "kk",
                    )
                      ? "Wajib"
                      : d.key === "kip"
                        ? "Jika memiliki"
                        : settings.documentRequirements
                              .requireOneGraduationDocument &&
                            ["skl", "ijazah"].includes(d.key)
                          ? "Salah satu SKL / ijazah"
                          : "Opsional"}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="form-help">
        PDF, JPG, PNG; maksimal 5 MB per berkas. Ekstrakurikuler opsional dan
        boleh lebih dari satu.
      </p>
      <div className="help-card">
        <b>Sudah memiliki nomor?</b>
        <p>Pantau pemeriksaan dan perbaiki berkas melalui akun pendaftar.</p>
        <Link href="/pendaftar">Buka portal pendaftar →</Link>
      </div>
    </aside>
  );
}
