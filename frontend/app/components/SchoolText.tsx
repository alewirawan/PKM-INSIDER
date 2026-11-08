"use client";

import { useSchoolSettings } from "./SchoolSettingsProvider";

type IdentityField = "schoolName" | "tagline" | "academicYear";

/**
 * Menampilkan satu field identitas dari Pengaturan di dalam halaman server.
 * Nama/tagline tidak berisiko menyesatkan saat memuat; untuk status PPDB dan
 * kontak gunakan useSchoolSettingsState() agar loading/gagal terlihat.
 */
export function SchoolText({ field }: { field: IdentityField }) {
  const settings = useSchoolSettings();
  return <>{settings[field]}</>;
}
