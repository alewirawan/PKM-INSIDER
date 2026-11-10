"use client";
import { useState } from "react";
import { reviewDocument } from "../../lib/api/applications";
import { downloadApi, requestApi } from "../../lib/api-client";
import type { StudentDocument } from "../../lib/cms/types";
export function ReviewCard({
  doc,
  number,
  refresh,
}: {
  doc: StudentDocument;
  number: string;
  refresh: () => Promise<void>;
}) {
  const [status, setStatus] = useState(
      doc.status === "Diunggah" || doc.status === "Belum ada"
        ? "Menunggu pemeriksaan"
        : doc.status,
    ),
    [note, setNote] = useState(doc.reviewNote ?? ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [physical, setPhysical] = useState(Boolean(doc.receivedPhysically));
  async function save() {
    setBusy(true);
    setError("");
    try {
      await reviewDocument(number, doc.id!, status, note, physical);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pemeriksaan gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      await requestApi(`/applications/${number}/documents/by-kind/${doc.key}`, {
        method: "PUT",
        body: form,
        timeoutMs: 60000,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setError("");
    try {
      await downloadApi(
        `/applications/${number}/documents/${doc.id}/download`,
        doc.fileName ?? "berkas",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unduhan gagal.");
    }
  }
  return (
    <article className="live-document-card">
      <header>
        <h3>{doc.label}</h3>
        <span>{doc.status}</span>
      </header>
      <p>
        {doc.fileName ??
          (doc.receivedPhysically
            ? "Dokumen fisik diterima"
            : "Belum ada berkas")}
      </p>
      {doc.hasFile && (
        <button onClick={() => void download()}>Unduh untuk diperiksa</button>
      )}
      {doc.status !== "Terverifikasi" && (
        <label>
          Unggah salinan digital (PDF/JPG/PNG, maksimal 5 MB)
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={busy}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) void upload(file);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}
      <label className="consent">
        <input
          type="checkbox"
          checked={physical}
          onChange={(e) => setPhysical(e.target.checked)}
        />
        Berkas fisik sudah diterima panitia
      </label>
      {(doc.hasFile || physical) && (
        <>
          <label>
            Status pemeriksaan
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option>Menunggu pemeriksaan</option>
              <option>Terverifikasi</option>
              <option>Perlu perbaikan</option>
            </select>
          </label>
          <label>
            Catatan untuk pendaftar
            <textarea
              value={note}
              maxLength={400}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jelaskan perbaikan yang diperlukan"
            />
          </label>
          <button
            className="button button-dark"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Menyimpan…" : "Simpan pemeriksaan"}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </article>
  );
}
