"use client";

import { CalendarPlus, CalendarX2, Check, Pencil, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  deleteAgendaItem,
  saveAgendaItem,
  type AgendaInput,
} from "../../lib/api/agenda";
import { hasBackendApi } from "../../lib/api-client";
import type { Agenda } from "../../lib/cms/types";
import { useAgenda } from "../../lib/use-agenda";
import { announceContentUpdate } from "../../lib/use-content-list";
import { AdminEmptyState, AdminPageHeader } from "./AdminUi";
import type { AdminNotify } from "./types";

function emptyForm(): AgendaInput {
  return {
    title: "",
    date: "",
    time: "08:00",
    location: "",
    type: "Kegiatan",
    completed: false,
    visibility: "Internal",
  };
}

function inputOf(item: Agenda): AgendaInput {
  return {
    title: item.title,
    date: item.date,
    time: item.time,
    location: item.location,
    type: item.type,
    completed: item.completed,
    visibility: item.visibility,
  };
}

export function AgendaModule({ notify }: { notify: AdminNotify }) {
  const { agenda, loading, error: loadError, refresh } = useAgenda(true);
  const [form, setForm] = useState<AgendaInput>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function mutate(
    action: () => Promise<unknown>,
    message: string,
    after?: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      after?.();
      announceContentUpdate();
      notify(message + (hasBackendApi() ? "" : " (demo browser)"));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Agenda gagal disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }
  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.title.trim().length < 2 || form.location.trim().length < 2) {
      setError("Nama kegiatan dan lokasi minimal 2 karakter.");
      return;
    }
    void mutate(
      () =>
        saveAgendaItem(
          { ...form, title: form.title.trim(), location: form.location.trim() },
          editing ?? undefined,
        ),
      "Agenda berhasil disimpan.",
      cancelEdit,
    );
  }
  function toggle(item: Agenda) {
    void mutate(
      () =>
        saveAgendaItem(
          { ...inputOf(item), completed: !item.completed },
          item.id,
        ),
      "Status agenda diperbarui.",
      () => {
        if (editing === item.id)
          setForm((current) => ({ ...current, completed: !item.completed }));
      },
    );
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Kalender sekolah"
        title="Agenda sekolah"
        description="Atur kegiatan dan visibilitasnya. Hanya agenda Publik yang ditampilkan di website sekolah."
      />
      <section className="agenda-workspace">
        <form className="admin-form-card" onSubmit={submit}>
          <p className="admin-eyebrow">
            {editing ? "Edit agenda" : "Agenda baru"}
          </p>
          <h2>{editing ? "Perbarui kegiatan" : "Tambahkan kegiatan"}</h2>
          <label>
            Nama kegiatan
            <input
              required
              minLength={2}
              maxLength={160}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Contoh: Rapat orang tua"
            />
          </label>
          <div className="admin-form-grid">
            <label>
              Tanggal
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />
            </label>
            <label>
              Waktu
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm({ ...form, time: event.target.value })
                }
              />
            </label>
          </div>
          <label>
            Lokasi
            <input
              required
              minLength={2}
              maxLength={160}
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
              placeholder="Lokasi kegiatan"
            />
          </label>
          <label>
            Jenis
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value as Agenda["type"] })
              }
            >
              <option>Akademik</option>
              <option>PPDB</option>
              <option>Kegiatan</option>
              <option>Rapat</option>
            </select>
          </label>
          <label>
            Visibilitas
            <select
              value={form.visibility}
              onChange={(event) =>
                setForm({
                  ...form,
                  visibility: event.target.value as Agenda["visibility"],
                })
              }
            >
              <option value="Internal">Internal — hanya admin</option>
              <option value="Publik">Publik — tampil di website</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="admin-form-error">
              {error}
            </p>
          )}
          <button
            className="button button-accent icon-button"
            type="submit"
            disabled={busy || loading || Boolean(loadError)}
          >
            <CalendarPlus size={16} />
            {busy
              ? "Menyimpan…"
              : editing
                ? "Simpan perubahan"
                : "Tambahkan agenda"}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit} disabled={busy}>
              Batal edit
            </button>
          )}
        </form>
        <section className="agenda-list">
          <div className="panel-heading">
            <div>
              <h2>
                {agenda.filter((item) => !item.completed).length} agenda belum
                selesai
              </h2>
              <p>Urut berdasarkan tanggal dan waktu</p>
            </div>
          </div>
          {loading && <p role="status">Memuat agenda…</p>}
          {loadError && (
            <div role="alert">
              <p>{loadError}</p>
              <button onClick={() => void refresh()}>Coba lagi</button>
            </div>
          )}
          {agenda.map((item) => (
            <article
              className={item.completed ? "completed" : ""}
              key={item.id}
            >
              <button
                className="agenda-check"
                disabled={busy}
                onClick={() => toggle(item)}
                aria-label={
                  (item.completed
                    ? "Tandai belum selesai: "
                    : "Tandai selesai: ") + item.title
                }
                aria-pressed={item.completed}
              >
                {item.completed && <Check size={13} />}
              </button>
              <time dateTime={item.date + "T" + item.time}>
                <b>{Number(item.date.slice(8, 10))}</b>
                <span>
                  {new Intl.DateTimeFormat("id-ID", { month: "short" })
                    .format(new Date(item.date + "T12:00:00"))
                    .toUpperCase()}
                </span>
              </time>
              <div>
                <span className={"agenda-type type-" + item.type.toLowerCase()}>
                  {item.type} · {item.visibility}
                </span>
                <h3>{item.title}</h3>
                <p>
                  {item.time} · {item.location}
                </p>
                {confirmDelete === item.id && (
                  <div className="delete-confirm">
                    <p>Hapus agenda ini?</p>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void mutate(
                          () => deleteAgendaItem(item.id),
                          "Agenda dihapus.",
                          () => {
                            setConfirmDelete(null);
                            if (editing === item.id) cancelEdit();
                          },
                        )
                      }
                    >
                      Ya, hapus
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => setConfirmDelete(null)}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
              <div className="agenda-actions">
                <button
                  disabled={busy}
                  onClick={() => {
                    setEditing(item.id);
                    setForm(inputOf(item));
                    setError("");
                    setConfirmDelete(null);
                  }}
                  aria-label={"Edit " + item.title}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="icon-danger"
                  disabled={busy}
                  onClick={() => setConfirmDelete(item.id)}
                  aria-label={"Hapus " + item.title}
                >
                  <X size={15} />
                </button>
              </div>
            </article>
          ))}
          {!loading && !loadError && !agenda.length && (
            <AdminEmptyState
              icon={CalendarX2}
              title="Kalender masih kosong"
              description="Tambahkan agenda melalui formulir. Agenda baru secara default bersifat internal."
            />
          )}
        </section>
      </section>
    </div>
  );
}
