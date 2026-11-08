"use client";

import Link from "next/link";
import {
  describeRegistration,
  useSchoolSettingsState,
} from "./SchoolSettingsProvider";
import { homeContent } from "../lib/content/home";

function formatDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("id-ID", { dateStyle: "long" });
}

export function HomePpdbCta() {
  const state = useSchoolSettingsState();
  const registration = describeRegistration(state);
  const opens = formatDate(state.settings.registrationOpensAt);
  const closes = formatDate(state.settings.registrationClosesAt);
  const schedule =
    registration.kind === "open" || registration.kind === "closed"
      ? opens && closes
        ? `Informasi jadwal: ${opens} – ${closes}.`
        : opens
          ? `Informasi jadwal: dibuka ${opens}.`
          : closes
            ? `Informasi jadwal: ditutup ${closes}.`
            : null
      : null;

  return (
    <section className="cta-section">
      <p className="section-kicker">
        Penerimaan siswa baru
        {(registration.kind === "open" || registration.kind === "closed") &&
          ` ${registration.academicYear}`}
      </p>
      <h2>
        Perjalanan besar dimulai
        <br />
        dari satu langkah kecil.
      </h2>
      <p>{homeContent.cta}</p>
      <p className="cta-status" role="status">
        {registration.kind === "loading" && "Memuat status pendaftaran…"}
        {registration.kind === "error" &&
          "Status pendaftaran sementara tidak dapat dimuat."}
        {registration.kind === "open" && "Pendaftaran sedang dibuka."}
        {registration.kind === "closed" && "Pendaftaran sedang ditutup."}
        {schedule && ` ${schedule}`}
      </p>
      <div>
        <Link className="button button-accent" href="/pendaftaran">
          {registration.kind === "closed"
            ? "Lihat informasi PPDB"
            : "Daftar sebagai calon siswa"}
        </Link>
        <Link className="button button-outline-light" href="/kontak">
          Jadwalkan kunjungan
        </Link>
      </div>
    </section>
  );
}
