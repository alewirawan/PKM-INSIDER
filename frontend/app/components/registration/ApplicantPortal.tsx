"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { requestApi, downloadApi } from "../../lib/api-client";
import { getApplicant, replaceDocument } from "../../lib/api/applications";
import type { Application, StudentDocument } from "../../lib/cms/types";
import { validateDemoFile } from "../../lib/registration-files";

export function ApplicantPortal() {
  const [record, setRecord] = useState<Application | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [number, setNumber] = useState(""),
    [password, setPassword] = useState(""),
    [token, setToken] = useState(""),
    [confirm, setConfirm] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const access = fragment.get("token");
    if (access) {
      const timer = window.setTimeout(() => {
        setToken(access);
        window.history.replaceState(null, "", window.location.pathname);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    getApplicant()
      .then((r) => {
        if (active) setRecord(r);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      if (token) {
        if (password !== confirm)
          throw new Error("Konfirmasi password belum sama.");
        await requestApi("/applicant/activate", {
          method: "POST",
          body: JSON.stringify({ token, password }),
        });
        setToken("");
        setPassword("");
        setConfirm("");
        setNotice(
          "Password tersimpan. Masuk menggunakan nomor pendaftaran dan password baru.",
        );
      } else {
        await requestApi("/applicant/login", {
          method: "POST",
          body: JSON.stringify({ number, password }),
        });
        setRecord(await getApplicant());
        setPassword("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Akses gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(doc: StudentDocument, file: File) {
    const invalid = validateDemoFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await replaceDocument(doc.key, file);
      setRecord(await getApplicant());
      setNotice("Berkas baru diterima. Tunggu pemeriksaan panitia.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function download(doc: StudentDocument) {
    setError("");
    try {
      await downloadApi(
        `/applicant/documents/${doc.id}/download`,
        doc.fileName ?? "berkas",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unduhan gagal.");
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await requestApi("/applicant/logout", { method: "POST" });
      setRecord(null);
      setNotice("");
    } catch {
      setError("Keluar gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p role="status">Memeriksa sesi pendaftar…</p>;
  if (!record)
    return (
      <form className="registration-form portal-login" onSubmit={submit}>
        <p className="section-kicker">
          {token ? "Aktivasi / pemulihan akun" : "Masuk portal"}
        </p>
        <h2>{token ? "Buat password baru" : "Selamat datang kembali."}</h2>
        {notice && <p role="status">{notice}</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-grid">
          {!token && (
            <label className="span-2">
              Nomor pendaftaran
              <input
                required
                autoComplete="username"
                value={number}
                onChange={(e) => setNumber(e.target.value.toUpperCase())}
                placeholder="NH-…"
              />
            </label>
          )}
          <label>
            Password
            <input
              type="password"
              required
              minLength={token ? 12 : 1}
              maxLength={128}
              autoComplete={token ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {token && (
            <label>
              Ulangi password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          )}
        </div>
        <button type="submit" disabled={busy} className="button button-dark">
          {busy ? "Memproses…" : token ? "Simpan password" : "Masuk"}
        </button>
        <p className="form-help">
          Lupa password atau mendaftar lewat sekolah? Hubungi panitia untuk
          verifikasi identitas dan tautan aktivasi/pemulihan yang berlaku 30
          menit.
        </p>
        <Link href="/pendaftaran">Belum mendaftar? Isi formulir →</Link>
      </form>
    );
  return (
    <div className="portal-record">
      <header className="portal-record-heading">
        <div>
          <p className="section-kicker">{record.id}</p>
          <h2>{record.studentName}</h2>
          <p>
            {record.originSchool} · {record.registrationSource}
          </p>
        </div>
        <div>
          <strong className="status-badge">{record.status}</strong>
          <button
            className="button registration-back"
            disabled={busy}
            onClick={() => void logout()}
          >
            Keluar
          </button>
        </div>
      </header>
      {notice && (
        <p className="inline-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="registration-review">
        <h3>Berkas pendaftaran</h3>
        <p>
          Perbaiki berkas yang diminta panitia. Berkas terverifikasi hanya dapat
          dibuka kembali oleh panitia.
        </p>
        <div className="registration-upload-grid">
          {record.documents?.map((doc) => (
            <article className="upload-card" key={doc.key}>
              <h3>{doc.label}</h3>
              <p>
                <b>{doc.status}</b>
                {doc.receivedPhysically ? " · Diterima fisik" : ""}
              </p>
              {doc.reviewNote && (
                <p className="document-review-note">{doc.reviewNote}</p>
              )}
              <p>{doc.fileName ?? "Belum ada berkas digital"}</p>
              {doc.hasFile && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void download(doc)}
                >
                  Unduh berkas
                </button>
              )}
              {doc.status !== "Terverifikasi" && doc.key !== "photo" && (
                <label>
                  Pilih berkas {doc.label}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void upload(doc, file);
                    }}
                  />
                </label>
              )}
              <small>PDF, JPG, PNG · maksimal 5 MB</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
