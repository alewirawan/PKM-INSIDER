"use client";

import { CalendarPlus, CalendarX2, Check, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { saveAgenda, type Agenda } from "../../lib/local-cms";
import { AdminEmptyState, AdminPageHeader } from "./AdminUi";

export function AgendaModule({
  agenda,
  setAgenda,
  notify,
}: {
  agenda: Agenda[];
  setAgenda: (value: Agenda[]) => void;
  notify: (message: string, tone?: "success" | "warning") => void;
}) {
  const [form, setForm] = useState({
    title: "",
    date: "2026-09-25",
    time: "08:00",
    location: "",
    type: "Kegiatan" as Agenda["type"],
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = [
      ...agenda,
      { id: `agenda-${Date.now()}`, ...form, completed: false },
    ].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    setAgenda(next);
    saveAgenda(next);
    setForm({
      title: "",
      date: form.date,
      time: "08:00",
      location: "",
      type: "Kegiatan",
    });
    notify("Agenda baru berhasil ditambahkan.");
  }
  function toggle(id: string) {
    const next = agenda.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setAgenda(next);
    saveAgenda(next);
    notify("Status agenda diperbarui.");
  }
  function remove(id: string) {
    const next = agenda.filter((item) => item.id !== id);
    setAgenda(next);
    saveAgenda(next);
    notify("Agenda dihapus.", "warning");
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Kalender sekolah"
        title="Agenda sekolah"
        description="Susun kegiatan, rapat, dan jadwal penting dalam satu tempat."
      />
      <section className="agenda-workspace">
        <form className="admin-form-card" onSubmit={submit}>
          <p className="admin-eyebrow">Agenda baru</p>
          <h2>Tambahkan kegiatan</h2>
          <label>
            Nama kegiatan
            <input
              required
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
          <button className="button button-accent icon-button" type="submit">
            <CalendarPlus size={16} /> Tambahkan agenda
          </button>
        </form>
        <section className="agenda-list">
          <div className="panel-heading">
            <div>
              <h2>
                {agenda.filter((item) => !item.completed).length} agenda
                mendatang
              </h2>
              <p>Urut berdasarkan tanggal terdekat</p>
            </div>
          </div>
          {agenda.map((item) => (
            <article
              className={item.completed ? "completed" : ""}
              key={item.id}
            >
              <button className="agenda-check" onClick={() => toggle(item.id)}>
                {item.completed && <Check size={13} />}
              </button>
              <time>
                <b>{new Date(`${item.date}T12:00:00`).getDate()}</b>
                <span>
                  {new Intl.DateTimeFormat("id-ID", { month: "short" })
                    .format(new Date(`${item.date}T12:00:00`))
                    .toUpperCase()}
                </span>
              </time>
              <div>
                <span className={`agenda-type type-${item.type.toLowerCase()}`}>
                  {item.type}
                </span>
                <h3>{item.title}</h3>
                <p>
                  {item.time} · {item.location}
                </p>
              </div>
              <button
                className="icon-danger"
                onClick={() => remove(item.id)}
                aria-label={`Hapus ${item.title}`}
              >
                <X size={15} />
              </button>
            </article>
          ))}
          {!agenda.length && (
            <AdminEmptyState
              icon={CalendarX2}
              title="Kalender masih kosong"
              description="Agenda baru akan tersusun otomatis setelah ditambahkan melalui formulir."
            />
          )}
        </section>
      </section>
    </div>
  );
}
