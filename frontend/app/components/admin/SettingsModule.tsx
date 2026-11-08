"use client";

import { BadgeCheck, Mail, RotateCcw } from "lucide-react";
import { type FormEvent, useState } from "react";
import { hasBackendApi } from "../../lib/api-client";
import {
  REQUIRABLE_DOCUMENT_KINDS,
  fromLocalDateTimeInput,
  saveSettings,
  toLocalDateTimeInput,
  validateSettings,
  type SettingsErrors,
} from "../../lib/api/settings";
import {
  saveSchoolSettings,
  type RequirableDocumentKind,
  type SchoolSettings,
} from "../../lib/local-cms";
import { useSchoolSettingsState } from "../SchoolSettingsProvider";
import { AdminPageHeader } from "./AdminUi";

/** Isian form; tanggal disimpan sebagai nilai datetime-local agar dapat dikosongkan. */
type FormState = Omit<
  SchoolSettings,
  "registrationOpensAt" | "registrationClosesAt"
> & { opensLocal: string; closesLocal: string };

function toForm(value: SchoolSettings): FormState {
  const { registrationOpensAt, registrationClosesAt, ...rest } = value;
  return {
    ...rest,
    opensLocal: toLocalDateTimeInput(registrationOpensAt),
    closesLocal: toLocalDateTimeInput(registrationClosesAt),
  };
}

function toSettings(form: FormState): SchoolSettings {
  const { opensLocal, closesLocal, ...rest } = form;
  return {
    ...rest,
    registrationOpensAt: fromLocalDateTimeInput(opensLocal),
    registrationClosesAt: fromLocalDateTimeInput(closesLocal),
    dataRetention: "indefinite",
  };
}

export function SettingsModule({
  settings,
  setSettings,
  newsletterCount,
  notify,
  onReset,
}: {
  settings: SchoolSettings;
  setSettings: (value: SchoolSettings) => void;
  newsletterCount: number;
  notify: (message: string) => void;
  onReset: () => void;
}) {
  // Mode API: sumber data adalah GET /settings (lewat provider), bukan state demo.
  const useApi = hasBackendApi();
  const state = useSchoolSettingsState();
  const source = useApi ? state.settings : settings;
  const sourceReady = !useApi || state.status === "ready";

  const [form, setForm] = useState<FormState>(() => toForm(source));
  const [syncedFrom, setSyncedFrom] = useState(source);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Muat ulang isian hanya ketika data sumber berganti (setelah muat/simpan).
  if (syncedFrom !== source) {
    setSyncedFrom(source);
    setForm(toForm(source));
    setErrors({});
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleKind(kind: RequirableDocumentKind, checked: boolean) {
    setForm((current) => {
      const kinds = current.documentRequirements.requiredKinds;
      return {
        ...current,
        documentRequirements: {
          ...current.documentRequirements,
          requiredKinds: checked
            ? kinds.includes(kind)
              ? kinds
              : [...kinds, kind]
            : kinds.filter((item) => item !== kind),
        },
      };
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const candidate = toSettings(form);
    const found = validateSettings(candidate);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) {
      setSubmitError("Periksa kembali isian yang ditandai.");
      return;
    }
    if (!useApi) {
      saveSchoolSettings(candidate);
      setSettings(candidate);
      notify("Pengaturan sekolah berhasil disimpan.");
      return;
    }
    setBusy(true);
    try {
      // PUT mengirim seluruh SchoolSettings; sukses ditampilkan setelah respons server.
      const saved = await saveSettings(candidate);
      state.applySaved(saved);
      setSettings(saved);
      notify("Pengaturan sekolah berhasil disimpan di server.");
    } catch (reason) {
      // Isian dipertahankan agar admin dapat memperbaiki atau mencoba lagi.
      setSubmitError(
        reason instanceof Error
          ? reason.message
          : "Pengaturan tidak dapat disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  function fieldProps(name: keyof SettingsErrors) {
    return {
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `settings-${name}-error` : undefined,
    } as const;
  }
  function fieldError(name: keyof SettingsErrors) {
    return errors[name] ? (
      <small className="field-error" id={`settings-${name}-error`} role="alert">
        {errors[name]}
      </small>
    ) : null;
  }

  const requiredKinds = form.documentRequirements.requiredKinds;

  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow={useApi ? "Konfigurasi server" : "Konfigurasi lokal"}
        title="Pengaturan sekolah"
        description="Kelola identitas, kontak, syarat berkas, jadwal, dan status penerimaan siswa."
      />
      {useApi && state.status === "loading" && (
        <p className="settings-state" role="status">
          Memuat pengaturan dari server…
        </p>
      )}
      {useApi && state.status === "error" && (
        <div className="settings-state is-error" role="alert">
          <span>
            Pengaturan belum dapat dimuat dari server
            {state.error ? `: ${state.error}` : "."}
          </span>
          <button type="button" className="button" onClick={state.reload}>
            Coba lagi
          </button>
        </div>
      )}
      <section className="settings-layout">
        <form
          className="admin-form-card settings-form"
          onSubmit={submit}
          noValidate
        >
          <fieldset className="settings-group" disabled={!sourceReady || busy}>
            <legend className="admin-eyebrow">Profil sekolah</legend>
            <h2>Informasi utama</h2>
            <div className="admin-form-grid">
              <label>
                Nama sekolah
                <input
                  required
                  value={form.schoolName}
                  onChange={(event) => update("schoolName", event.target.value)}
                  {...fieldProps("schoolName")}
                />
                {fieldError("schoolName")}
              </label>
              <label>
                Tagline
                <input
                  required
                  value={form.tagline}
                  onChange={(event) => update("tagline", event.target.value)}
                  {...fieldProps("tagline")}
                />
                {fieldError("tagline")}
              </label>
              <label>
                Email utama
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  {...fieldProps("email")}
                />
                {fieldError("email")}
              </label>
              <label>
                Email PPDB
                <input
                  required
                  type="email"
                  value={form.ppdbEmail}
                  onChange={(event) => update("ppdbEmail", event.target.value)}
                  {...fieldProps("ppdbEmail")}
                />
                {fieldError("ppdbEmail")}
              </label>
              <label>
                Telepon
                <input
                  required
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  {...fieldProps("phone")}
                />
                {fieldError("phone")}
              </label>
              <label>
                WhatsApp
                <input
                  required
                  value={form.whatsapp}
                  onChange={(event) => update("whatsapp", event.target.value)}
                  {...fieldProps("whatsapp")}
                />
                {fieldError("whatsapp")}
              </label>
              <label>
                Tahun ajaran
                <input
                  required
                  inputMode="numeric"
                  placeholder="2026/2027"
                  value={form.academicYear}
                  onChange={(event) =>
                    update("academicYear", event.target.value)
                  }
                  {...fieldProps("academicYear")}
                />
                {fieldError("academicYear")}
              </label>
              <label className="span-2">
                Alamat
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  {...fieldProps("address")}
                />
                {fieldError("address")}
              </label>
            </div>
          </fieldset>

          <fieldset className="settings-group" disabled={!sourceReady || busy}>
            <legend className="admin-eyebrow">Penerimaan siswa baru</legend>
            <h2>Status dan jadwal PPDB</h2>
            <div className="admin-form-grid">
              <label className="toggle-label span-2">
                <input
                  type="checkbox"
                  checked={form.registrationOpen}
                  onChange={(event) =>
                    update("registrationOpen", event.target.checked)
                  }
                />
                <span />
                <b>PPDB sedang dibuka</b>
              </label>
              <p className="field-hint span-2">
                Toggle ini satu-satunya penentu buka/tutup pendaftaran. Tanggal
                di bawah hanya informasi untuk pengunjung dan tidak mengubah
                toggle secara otomatis.
              </p>
              <label>
                Informasi tanggal buka (opsional)
                <input
                  type="datetime-local"
                  value={form.opensLocal}
                  onChange={(event) => update("opensLocal", event.target.value)}
                  {...fieldProps("registrationOpensAt")}
                />
                {fieldError("registrationOpensAt")}
              </label>
              <label>
                Informasi tanggal tutup (opsional)
                <input
                  type="datetime-local"
                  value={form.closesLocal}
                  onChange={(event) => update("closesLocal", event.target.value)}
                  {...fieldProps("registrationClosesAt")}
                />
                {fieldError("registrationClosesAt")}
              </label>
            </div>
          </fieldset>

          <fieldset
            className="settings-group"
            disabled={!sourceReady || busy}
            aria-describedby="settings-requiredKinds-hint"
          >
            <legend className="admin-eyebrow">Syarat berkas</legend>
            <h2>Berkas yang wajib diunggah</h2>
            <div className="settings-checks">
              {REQUIRABLE_DOCUMENT_KINDS.map(({ kind, label }) => (
                <label className="check-label" key={kind}>
                  <input
                    type="checkbox"
                    checked={requiredKinds.includes(kind)}
                    onChange={(event) => toggleKind(kind, event.target.checked)}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <label className="check-label is-fixed">
                <input type="checkbox" checked={false} disabled readOnly />
                <span>PIP/KIP — selalu opsional</span>
              </label>
            </div>
            {fieldError("requiredKinds")}
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.documentRequirements.requireOneGraduationDocument}
                onChange={(event) =>
                  update("documentRequirements", {
                    ...form.documentRequirements,
                    requireOneGraduationDocument: event.target.checked,
                  })
                }
              />
              <span />
              <b>Minimal salah satu SKL atau ijazah</b>
            </label>
            <p className="field-hint" id="settings-requiredKinds-hint">
              Perubahan syarat hanya berlaku untuk pendaftaran baru;
              pendaftaran yang sudah masuk memakai syarat saat mereka
              mendaftar. Data disimpan tanpa penghapusan otomatis (
              <code>{form.dataRetention}</code>), tetap perlu backup.
            </p>
          </fieldset>

          {submitError && (
            <p className="admin-form-error" role="alert">
              {submitError}
            </p>
          )}
          <button
            className="button button-accent"
            type="submit"
            disabled={!sourceReady || busy}
          >
            {busy ? "Menyimpan…" : "Simpan pengaturan"}
          </button>
        </form>
        <aside className="settings-side">
          <article>
            <span>
              <Mail size={18} />
            </span>
            <div>
              <small>Subscriber newsletter</small>
              <strong>{newsletterCount}</strong>
              <p>Tersimpan pada browser lokal ini.</p>
            </div>
          </article>
          <article>
            <span>
              <BadgeCheck size={18} />
            </span>
            <div>
              <small>Status PPDB</small>
              <strong>{form.registrationOpen ? "Dibuka" : "Ditutup"}</strong>
              <p>Tahun ajaran {form.academicYear}</p>
            </div>
          </article>
          {!useApi && (
            <article className="danger-zone">
              <div>
                <small>Reset data demo</small>
                <strong>Kembalikan kondisi awal</strong>
                <p>
                  Menghapus artikel, pendaftar, agenda, pesan, subscriber, dan
                  pengaturan lokal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Reset seluruh data demo lokal?"))
                      onReset();
                  }}
                >
                  <RotateCcw size={14} /> Reset data lokal
                </button>
              </div>
            </article>
          )}
        </aside>
      </section>
    </div>
  );
}
