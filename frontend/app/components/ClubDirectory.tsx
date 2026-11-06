"use client";

import { useClubs } from "../lib/use-clubs";

export function ClubDirectory() {
  const { clubs, loading, error, refresh } = useClubs();
  if (loading) return <p role="status">Memuat ekstrakurikuler…</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={() => void refresh()}>Coba lagi</button>
      </div>
    );
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
