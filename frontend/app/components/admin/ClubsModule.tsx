"use client";
import { type FormEvent, useState } from "react";
import { useCatalog } from "../../lib/use-catalog";
import { saveClubs } from "../../lib/cms/catalog";
import { AdminPageHeader } from "./AdminUi";
import type { AdminNotify } from "./types";
export function ClubsModule({ notify }: { notify: AdminNotify }) {
  const { clubs } = useCatalog();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  function save(e: FormEvent) {
    e.preventDefault();
    if (
      !name.trim() ||
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
      id: editing ?? crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      active,
    };
    try {
      saveClubs(
        editing
          ? clubs.map((c) => (c.id === editing ? club : c))
          : [...clubs, club],
      );
      setEditing(null);
      setName("");
      setDescription("");
      setActive(true);
      setError("");
      notify("Ekstrakurikuler disimpan di browser.");
    } catch {
      setError("Penyimpanan browser gagal.");
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
          <button className="button button-dark">Simpan kegiatan</button>
          {editing && (
            <button
              type="button"
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
          {clubs.map((c) => (
            <article key={c.id}>
              <small>{c.active ? "Aktif" : "Nonaktif"}</small>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <button
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
