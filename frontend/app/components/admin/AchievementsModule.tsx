"use client";
import { useState, type FormEvent } from "react";
import { useCatalog } from "../../lib/use-catalog";
import { storeAchievement, removeAchievement } from "../../lib/api/school";
import { AdminPageHeader } from "./AdminUi";
import type { AdminNotify } from "./types";
const empty = {
  title: "",
  award: "",
  level: "Kota",
  year: "2026",
  category: "Akademik",
  description: "",
  image: "/images/science.jpg",
  published: false,
};
export function AchievementsModule({ notify }: { notify: AdminNotify }) {
  const { achievements, achievementsError, achievementsLoading } =
    useCatalog(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await storeAchievement(form, editing ?? undefined);
      setForm(empty);
      setEditing(null);
      notify("Prestasi tersimpan.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Penyimpanan gagal.",
        "warning",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Cerita pencapaian"
        title="Prestasi sekolah"
        description="Kelola cerita pencapaian sekolah. Hanya prestasi terbit yang terlihat oleh pengunjung."
      />
      {achievementsError && <p role="alert">{achievementsError}</p>}
      {achievementsLoading && <p role="status">Memuat prestasi…</p>}
      <div className="catalog-admin-grid">
        <form className="catalog-editor" onSubmit={save}>
          <h2>{editing ? "Edit prestasi" : "Prestasi baru"}</h2>
          {(["title", "award", "year"] as const).map((key, i) => (
            <label key={key}>
              {["Judul cerita", "Penghargaan", "Tahun"][i]}
              <input
                required
                maxLength={key === "year" ? 4 : 120}
                pattern={key === "year" ? "[0-9]{4}" : undefined}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <label>
            Tingkat
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              {[
                "Sekolah",
                "Kecamatan",
                "Kabupaten",
                "Kota",
                "Provinsi",
                "Nasional",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Kategori
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {["Akademik", "Olahraga", "Seni", "Literasi", "Keagamaan"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Cerita singkat
            <textarea
              required
              maxLength={600}
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Foto ilustrasi
            <select
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            >
              <option value="/images/science.jpg">Kegiatan sains</option>
              <option value="/images/students.jpg">Kegiatan siswa</option>
              <option value="/images/library.jpg">Perpustakaan</option>
              <option value="/images/campus.jpg">Sekolah</option>
            </select>
          </label>
          <label className="catalog-checkbox">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Tampilkan di website
          </label>
          <button
            className="button button-dark"
            type="submit"
            disabled={saving}
          >
            Simpan prestasi
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Batal edit
            </button>
          )}
        </form>
        <div className="catalog-records">
          {!achievements.length && (
            <p>Belum ada prestasi. Tambahkan melalui formulir.</p>
          )}
          {achievements.map((a) => (
            <article key={a.id}>
              <small>
                {a.year} · {a.level} · {a.published ? "Terbit" : "Draft"}
              </small>
              <h3>{a.title}</h3>
              <p>{a.award}</p>
              <div className="file-actions">
                <button
                  onClick={() => {
                    setEditing(a.id);
                    setForm(a);
                  }}
                >
                  Edit {a.title}
                </button>
                <button onClick={() => setDeleting(a.id)}>Hapus</button>
              </div>
              {deleting === a.id && (
                <div className="delete-confirm">
                  <p>Hapus prestasi ini?</p>
                  <button
                    onClick={async () => {
                      try {
                        await removeAchievement(a.id);
                        setDeleting(null);
                        if (editing === a.id) {
                          setEditing(null);
                          setForm(empty);
                        }
                        notify("Prestasi dihapus.");
                      } catch {
                        notify("Penyimpanan gagal.", "warning");
                      }
                    }}
                  >
                    Ya, hapus
                  </button>
                  <button onClick={() => setDeleting(null)}>Batal</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
