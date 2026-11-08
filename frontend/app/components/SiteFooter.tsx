"use client";

import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { useSchoolSettingsState } from "./SchoolSettingsProvider";

export function SiteFooter() {
  const { settings, status } = useSchoolSettingsState();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <BrandMark />
            <span>
              <b>{settings.schoolName}</b>
              <small>{settings.tagline}</small>
            </span>
          </Link>
          <p>
            Ruang belajar yang hangat untuk generasi yang berani berpikir,
            peduli, dan berkarya.
          </p>
          <span className="domain-chip">www.nurulhuda.sch.id</span>
        </div>
        <div>
          <h3>Jelajahi</h3>
          <Link href="/tentang">Tentang sekolah</Link>
          <Link href="/struktur">Struktur & guru</Link>
          <Link href="/program">Program belajar</Link>
          <Link href="/prestasi">Prestasi sekolah</Link>
          <Link href="/blog">Cerita Nurul Huda</Link>
          <Link href="/pendaftaran">Pendaftaran siswa</Link>
        </div>
        <div>
          <h3>Hubungi</h3>
          {status === "ready" ? (
            <>
              <p>{settings.address}</p>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
                {settings.phone}
              </a>
            </>
          ) : (
            <p role="status">
              {status === "loading"
                ? "Memuat kontak sekolah…"
                : "Kontak sekolah sementara tidak dapat dimuat."}
            </p>
          )}
        </div>
        <div>
          <h3>Jam layanan</h3>
          <p>
            Senin–Jumat
            <br />
            07.00–16.00 WIB
          </p>
          <p>
            Sabtu
            <br />
            08.00–12.00 WIB
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {settings.schoolName}. Website simulasi.</span>
        <span>{settings.tagline}</span>
      </div>
    </footer>
  );
}
