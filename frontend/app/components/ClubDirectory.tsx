"use client";

import { useCatalog } from "../lib/use-catalog";

export function ClubDirectory() {
  const { clubs } = useCatalog();
  const active = clubs.filter((club) => club.active);
  if (!active.length)
    return <p>Informasi ekstrakurikuler akan segera diperbarui.</p>;
  return (
    <div className="club-grid">
      {active.map((club, index) => (
        <span key={club.id} title={club.description}>
          <b>{String(index + 1).padStart(2, "0")}</b>
          {club.name}
        </span>
      ))}
    </div>
  );
}
