"use client";
import { useEffect, useState } from "react";
import { getApplication, updateApplication } from "../../lib/api/applications";
import { requestApi } from "../../lib/api-client";
import type { Application } from "../../lib/cms/types";
import { DialogPortal } from "../DialogPortal";
import { OfflineApplicationForm } from "./OfflineApplicationForm";
import { ReviewCard } from "./ReviewCard";
const statuses = [
  "Verifikasi",
  "Terverifikasi",
  "Wawancara",
  "Diterima",
  "Ditolak",
] as const;
export function ApplicationDrawer({
  number,
  close,
  changed,
}: {
  number: string;
  close: () => void;
  changed: () => void;
}) {
  const [record, setRecord] = useState<Application | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("biodata"),
    [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<Application["status"]>("Verifikasi"),
    [notes, setNotes] = useState(""),
    [accessLink, setAccessLink] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  async function refresh() {
    const value = await getApplication(number);
    setRecord(value);
    setStatus(value.status);
    setNotes(value.notes ?? "");
    changed();
  }
  useEffect(() => {
    let active = true;
    getApplication(number)
      .then((v) => {
        if (active) {
          setRecord(v);
          setStatus(v.status);
          setNotes(v.notes ?? "");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [number]);

  async function save() {
    setBusy(true);
    setError("");
    try {
      await updateApplication(number, { status, notes });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Perubahan gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function issue() {
    setBusy(true);
    setError("");
    try {
      const result = await requestApi<{ token: string }>(
        `/applications/${number}/access`,
        { method: "POST" },
      );
      setAccessLink(
        `${window.location.origin}/pendaftar#token=${encodeURIComponent(result.token)}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tautan gagal dibuat.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <DialogPortal
      className="live-modal-backdrop"
      dialogClassName="live-modal live-student-drawer"
      labelledBy="application-title"
      onClose={() => {
        if (!busy && !editing) close();
      }}
    >
      <header>
        <div>
          <p className="admin-eyebrow">{number}</p>
          <h2 id="application-title">
            {record?.studentName ?? "Memuat pendaftar…"}
          </h2>
        </div>
        <button onClick={close} disabled={busy}>
          Tutup
        </button>
      </header>
      <nav className="filter-row" aria-label="Bagian detail">
        {["biodata", "berkas", "status", "akses"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {record && (
        <div className="live-drawer-body">
          {tab === "biodata" && (
            <>
              <dl className="live-biodata">
                {[
                  ["NISN", record.nisn],
                  ["Asal sekolah", record.originSchool],
                  [
                    "Tempat, tanggal lahir",
                    `${record.birthPlace}, ${record.birthDate}`,
                  ],
                  ["Jenis kelamin", record.gender],
                  ["Alamat", record.address],
                  ["Orang tua/wali", record.parentName],
                  ["Pekerjaan", record.parentOccupation],
                  ["Telepon", record.phone],
                  ["Email", record.email],
                  ["Ekstrakurikuler", record.extracurricular],
                  ["Sumber", record.registrationSource],
                  [
                    "Waktu daftar",
                    new Date(record.submittedAt).toLocaleString("id-ID"),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "—"}</dd>
                  </div>
                ))}
              </dl>
              <button
                className="button button-dark"
                onClick={() => setEditing(true)}
              >
                Edit biodata
              </button>
            </>
          )}
          {tab === "berkas" && (
            <>
              <p>
                Verifikasi berkas tidak otomatis menerima siswa. Status
                penerimaan diatur pada tab Status.
              </p>
              <div className="live-documents">
                {record.documents?.map((doc) => (
                  <ReviewCard
                    key={`${doc.id}:${doc.status}:${doc.fileName}`}
                    doc={doc}
                    number={number}
                    refresh={refresh}
                  />
                ))}
              </div>
            </>
          )}
          {tab === "status" && (
            <div className="live-status-editor">
              <label>
                Status penerimaan
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Application["status"])
                  }
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Catatan internal
                <textarea
                  maxLength={1000}
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <p>
                Status Terverifikasi/Diterima memerlukan berkas wajib yang telah
                diverifikasi sesuai persyaratan saat mendaftar.
              </p>
              <button
                className="button button-dark"
                disabled={busy}
                onClick={() => void save()}
              >
                Simpan status
              </button>
            </div>
          )}
          {tab === "akses" && (
            <div className="live-status-editor">
              <h3>Aktivasi dan pemulihan akun</h3>
              <p>
                Untuk pendaftaran offline atau lupa password. Verifikasi
                identitas pemohon terlebih dahulu, kemudian serahkan tautan
                secara pribadi. Berlaku 30 menit dan hanya sekali pakai.
              </p>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                Identitas pemohon sudah diperiksa.
              </label>
              <button
                className="button button-dark"
                disabled={busy || !confirmed}
                onClick={() => void issue()}
              >
                Buat tautan akses
              </button>
              {accessLink && (
                <label>
                  Tautan pribadi
                  <input
                    readOnly
                    value={accessLink}
                    onFocus={(e) => e.target.select()}
                  />
                  <small>
                    Salin dan berikan bersama nomor pendaftaran. Tautan
                    sebelumnya tidak berlaku.
                  </small>
                </label>
              )}
            </div>
          )}
        </div>
      )}
      {editing && record && (
        <OfflineApplicationForm
          record={record}
          close={() => setEditing(false)}
          saved={() => {
            setEditing(false);
            void refresh().catch((e) => setError(e.message));
          }}
        />
      )}
    </DialogPortal>
  );
}
