"use client";
import { useCallback, useEffect, useState } from "react";
import { listApplicationPage } from "../../lib/api/applications";
import type { Application } from "../../lib/cms/types";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { OfflineApplicationForm } from "./OfflineApplicationForm";
import { AdminPageHeader } from "../admin/AdminUi";

export function StudentWorkspace({ title = "Data siswa" }: { title?: string }) {
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [cursor, setCursor] = useState<string | null>(null),
    [history, setHistory] = useState<(string | null)[]>([]);
  const [rows, setRows] = useState<Application[]>([]),
    [next, setNext] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<string | null>(null),
    [offline, setOffline] = useState(false);
  const refresh = useCallback(() => setRevision((v) => v + 1), []),
    close = useCallback(() => setSelected(null), []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      const q = new URLSearchParams({ search, limit: "25" });
      if (status) q.set("status", status);
      if (source) q.set("source", source);
      if (cursor) q.set("cursor", cursor);
      listApplicationPage(q)
        .then((v) => {
          if (active) {
            setRows(v.items);
            setNext(v.nextCursor);
          }
        })
        .catch((e) => {
          if (active) {
            setRows([]);
            setError(e.message);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, status, source, cursor, revision]);
  function reset() {
    setCursor(null);
    setHistory([]);
  }
  function exportPage() {
    const cell = (s: string) =>
      '"' + (/^[=+@\-\t\r]/.test(s) ? "'" : "") + s.replaceAll('"', '""') + '"';
    const csv = [
      ["Nomor", "Nama", "NISN", "Asal sekolah", "Sumber", "Status"],
      ...rows.map((r) => [
        r.id,
        r.studentName,
        r.nisn ?? "",
        r.originSchool,
        r.registrationSource ?? "",
        r.status,
      ]),
    ]
      .map((r) => r.map(cell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "pendaftar-halaman-ini.csv";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Penerimaan peserta didik"
        title={title}
        description="Telusuri biodata, periksa berkas, dan pantau proses setiap calon siswa."
        action={
          <button
            className="button button-dark"
            onClick={() => setOffline(true)}
          >
            + Pendaftaran offline
          </button>
        }
      />
      <div className="live-record-toolbar">
        <label>
          Cari nama, NISN, atau nomor
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              reset();
            }}
            placeholder="Cari pendaftar…"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              reset();
            }}
          >
            <option value="">Semua status</option>
            {[
              "Verifikasi",
              "Terverifikasi",
              "Wawancara",
              "Diterima",
              "Ditolak",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Sumber
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              reset();
            }}
          >
            <option value="">Semua sumber</option>
            <option>Website</option>
            <option>Offline</option>
          </select>
        </label>
        <button disabled={!rows.length || loading} onClick={exportPage}>
          Ekspor halaman ini
        </button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
          <button onClick={refresh}>Coba lagi</button>
        </p>
      )}
      {loading && <p role="status">Memuat pendaftar…</p>}
      {!loading && !error && !rows.length && (
        <div className="admin-empty-state">
          <h2>Belum ada hasil.</h2>
          <p>Coba kata pencarian lain atau tambahkan pendaftar offline.</p>
        </div>
      )}
      <div className="live-student-list">
        {rows.map((r) => (
          <button
            className="live-student-row"
            key={r.id}
            onClick={() => setSelected(r.id)}
          >
            <span className="live-student-avatar">
              {r.studentName
                .split(" ")
                .slice(0, 2)
                .map((v) => v[0])
                .join("")}
            </span>
            <span>
              <strong>{r.studentName}</strong>
              <small>
                {r.id} · NISN {r.nisn}
              </small>
              <small>{r.originSchool}</small>
            </span>
            <span>
              <b>{r.status}</b>
              <small>
                {r.registrationSource} ·{" "}
                {new Date(r.submittedAt).toLocaleDateString("id-ID")}
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <footer className="live-pagination">
        <span>
          Halaman {history.length + 1} · {rows.length} data
        </span>
        <button
          disabled={!history.length || loading}
          onClick={() => {
            setCursor(history.at(-1) ?? null);
            setHistory((v) => v.slice(0, -1));
          }}
        >
          Sebelumnya
        </button>
        <button
          disabled={!next || loading}
          onClick={() => {
            setHistory((v) => [...v, cursor]);
            setCursor(next);
          }}
        >
          Berikutnya
        </button>
      </footer>
      {selected && (
        <ApplicationDrawer number={selected} close={close} changed={refresh} />
      )}
      {offline && (
        <OfflineApplicationForm
          close={() => setOffline(false)}
          saved={(id) => {
            setOffline(false);
            setSelected(id);
            refresh();
          }}
        />
      )}
    </div>
  );
}
