"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";
import {
  describeRegistration,
  useSchoolSettingsState,
} from "./SchoolSettingsProvider";

const items = [
  ["Beranda", "/"],
  ["Tentang", "/tentang"],
  ["Struktur & Guru", "/struktur"],
  ["Program", "/program"],
  ["Prestasi", "/prestasi"],
  ["Blog", "/blog"],
  ["Kontak", "/kontak"],
] as const;

export function SiteHeader({ active = "" }: { active?: string }) {
  const settingsState = useSchoolSettingsState();
  const settings = settingsState.settings;
  const registration = describeRegistration(settingsState);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Separate enter/exit thresholds avoid toggling on tiny trackpad movements.
    const handleScroll = () =>
      setScrolled((current) => window.scrollY > (current ? 8 : 24));
    const frame = window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: "instant" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function prepareNavigation() {
    setMenuOpen(false);
    setScrolled(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  return (
    <>
      <div className="notice-bar">
        <span>
          {registration.kind === "loading" && "Memuat informasi PPDB…"}
          {registration.kind === "error" &&
            "Informasi PPDB sementara tidak dapat dimuat"}
          {registration.kind === "open" &&
            `PPDB Tahun Ajaran ${registration.academicYear} telah dibuka`}
          {registration.kind === "closed" &&
            `PPDB Tahun Ajaran ${registration.academicYear} sedang ditutup`}
        </span>
        <span className="notice-actions">
          <Link href="/pendaftaran" onClick={prepareNavigation}>
            Informasi PPDB <span aria-hidden="true">→</span>
          </Link>
          <Link href="/admin" onClick={prepareNavigation}>
            Login Admin
          </Link>
        </span>
      </div>
      <div className={`site-navigation-shell${scrolled ? " is-scrolled" : ""}`}>
        <header className="site-header">
          <Link
            className="brand"
            href="/"
            aria-label="SMP Nurul Huda"
            onClick={prepareNavigation}
          >
            <BrandMark />
            <span>
              <b>{settings.schoolName}</b>
              <small>{settings.tagline}</small>
            </span>
          </Link>
          <nav aria-label="Navigasi utama">
            {items.map(([label, href]) => (
              <Link
                className={active === href ? "active" : ""}
                key={href}
                href={href}
                onClick={prepareNavigation}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            className="button button-dark button-small header-cta"
            href="/pendaftaran"
            onClick={prepareNavigation}
          >
            Daftar sekarang
          </Link>
          <button
            className="mobile-menu-trigger"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </header>
      </div>
      {menuOpen && (
        <div
          className="mobile-nav-panel open"
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <header>
            <Link className="brand" href="/" onClick={prepareNavigation}>
              <BrandMark />
              <span>
                <b>{settings.schoolName}</b>
                <small>{settings.tagline}</small>
              </span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
            >
              <X size={23} />
            </button>
          </header>
          <nav aria-label="Navigasi mobile">
            {items.map(([label, href], index) => (
              <Link
                className={active === href ? "active" : ""}
                key={href}
                href={href}
                onClick={prepareNavigation}
              >
                <small>0{index + 1}</small>
                <span>{label}</span>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </nav>
          <footer>
            <Link
              className="button button-accent"
              href="/pendaftaran"
              onClick={prepareNavigation}
            >
              Daftar calon siswa <ArrowUpRight size={16} />
            </Link>
            <Link href="/admin" onClick={prepareNavigation}>
              <UserRound size={16} /> Login Admin
            </Link>
          </footer>
        </div>
      )}
    </>
  );
}
