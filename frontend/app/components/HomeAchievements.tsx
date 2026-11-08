"use client";

import { hasBackendApi } from "../lib/api-client";
import { Achievements } from "./Achievements";

/**
 * Penempatan prestasi terbit di beranda (anggota 1). Sumber datanya milik
 * anggota 8. Selama client prestasi dari server belum ada, mode API tidak
 * boleh diam-diam menampilkan data simulasi lokal.
 */
export function HomeAchievements() {
  if (hasBackendApi())
    return (
      <section className="achievements-section compact">
        <p className="news-state" role="status">
          Prestasi sekolah belum dapat ditampilkan.
        </p>
      </section>
    );
  return <Achievements compact />;
}
