"use client";
import { type FormEvent, useState } from "react";
import { useClubs } from "../../lib/use-clubs";
import { saveClub } from "../../lib/api/clubs";
import { hasBackendApi } from "../../lib/api-client";
import { announceContentUpdate } from "../../lib/use-content-list";
import { AdminPageHeader } from "./AdminUi";
import type { AdminNotify } from "./types";
export function ClubsModule({ notify }: { notify: AdminNotify }) {
  const { clubs, loading, error: loadError, refresh } = useClubs(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (
      !name.trim() ||
      !description.trim() ||
      name.trim().toLowerCase() === "belum menentukan" ||
      clubs.some(
        (c) =>
          c.id !== editing &&
          c.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError("Gunakan nama kegiatan yang berbeda dan tidak kosong.");
      return;
    }
    const club = {
      name: name.trim(),
      description: description.trim(),
      active,
    };
    setSaving(true);
    try {
      await saveClub(club, editing ?? undefined);
      announceContentUpdate();
      setEditing(null);
      setName("");
      setDescription("");
      setActive(true);
      setError("");
      notify(
        hasBackendApi()
          ? "Ekstrakurikuler tersimpan di server."
          : "Ekstrakurikuler disimpan di browser (demo).",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Penyimpanan gagal.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Ruang minat siswa"
        title="Ekstrakurikuler"
        description="Kegiatan aktif tampil pada formulir PPDB dan input offline. Pilihan pendaftar lama tetap disimpan meski kegiatan dinonaktifkan."
      />
      <div className="catalog-admin-grid">
        <form className="catalog-editor" onSubmit={save}>
          <h2>{editing ? "Edit kegiatan" : "Kegiatan baru"}</h2>
          <label>
            Nama kegiatan
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Deskripsi
            <textarea
              required
              rows={4}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="catalog-checkbox">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Tersedia untuk pendaftar baru
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-dark"
            disabled={saving || loading || Boolean(loadError)}
          >
            {saving ? "Menyimpan…" : "Simpan kegiatan"}
          </button>
          {editing && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setEditing(null);
                setName("");
                setDescription("");
                setActive(true);
                setError("");
              }}
            >
              Batal edit
            </button>
          )}
        </form>
        <div className="catalog-records">
          {loading && <p role="status">Memuat kegiatan…</p>}
          {loadError && (
            <div role="alert">
              <p>{loadError}</p>
              <button onClick={() => void refresh()}>Coba lagi</button>
            </div>
          )}
          {!loading && !loadError && !clubs.length && (
            <p>
              Belum ada ekstrakurikuler. Tambahkan kegiatan melalui formulir.
            </p>
          )}
          {clubs.map((c) => (
            <article key={c.id}>
              <small>{c.active ? "Aktif" : "Nonaktif"}</small>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <button
                disabled={saving}
                onClick={() => {
                  setEditing(c.id);
                  setName(c.name);
                  setDescription(c.description);
                  setActive(c.active);
                  setError("");
                }}
              >
                Edit {c.name}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
