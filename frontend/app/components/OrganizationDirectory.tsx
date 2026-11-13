"use client";
import { useDirectory } from "../lib/use-directory";
import { OrganizationWorkspace } from "./school-directory/OrganizationWorkspace";

export function OrganizationDirectory() {
  const {
    directory: { leaders },
    loading,
    error,
    refresh,
  } = useDirectory();
  return (
    <div className="org-chart" aria-label="Bagan struktur organisasi sekolah">
      {loading && <p role="status">Memuat struktur organisasi…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void refresh()}>Coba lagi</button>
        </p>
      )}
      {!loading && !error && !leaders.length && (
        <p>Struktur organisasi belum dipublikasikan.</p>
      )}
      {leaders.length > 0 && <OrganizationWorkspace leaders={leaders} />}
    </div>
  );
}
