"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSchoolSettingsState } from "../SchoolSettingsProvider";
import {
  StudentFields,
  initialRegistration,
  type RegistrationValues,
} from "./StudentFields";
import { DocumentFields, type SelectedFiles } from "./DocumentFields";
import { RegistrationReview } from "./RegistrationReview";
import { ExtracurricularPicker } from "../ExtracurricularPicker";
import { submitOnline, missingRequirements } from "../../lib/api/applications";

const steps = ["Data siswa", "Orang tua & akun", "Berkas", "Periksa & kirim"];
export function LiveRegistrationForm() {
  const state = useSchoolSettingsState(),
    [form, setForm] = useState(initialRegistration),
    [files, setFiles] = useState<SelectedFiles>({});
  const [choices, setChoices] = useState<string[]>([]),
    [step, setStep] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [consent, setConsent] = useState(false),
    [receipt, setReceipt] = useState<string | null>(null);
  const key = useRef(""),
    lock = useRef(false),
    formRef = useRef<HTMLFormElement>(null),
    stepHeadingRef = useRef<HTMLHeadingElement>(null);
  function update(field: keyof RegistrationValues, value: string) {
    key.current = "";
    setForm((v) => ({ ...v, [field]: value }));
  }
  function go(next: number) {
    setStep(next);
    setError("");
    requestAnimationFrame(() => {
      stepHeadingRef.current?.focus({ preventScroll: true });
      formRef.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    if (step === 2 && password !== confirmation) {
      setError("Konfirmasi password belum sama.");
      return;
    }
    if (
      step >= 3 &&
      missingRequirements(
        state.settings.documentRequirements,
        Object.keys(files),
      )
    ) {
      setError("Lengkapi berkas wajib sesuai persyaratan yang ditandai.");
      return;
    }
    if (step < 4) {
      go(step + 1);
      return;
    }
    if (!consent) {
      setError("Setujui penggunaan data untuk pendaftaran.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    key.current ||= crypto.randomUUID();
    try {
      const {
        studentName,
        nisn,
        originSchool,
        birthPlace,
        birthDate,
        gender,
        address,
        parentName,
        parentOccupation,
        phone,
        email,
      } = form;
      const result = await submitOnline(
        {
          studentName,
          nisn,
          originSchool,
          birthPlace,
          birthDate,
          gender,
          address,
          parentName,
          parentOccupation,
          phone,
          email,
          extracurriculars: choices,
          password,
          consent,
        },
        files,
        key.current,
      );
      setReceipt(result.id);
      setPassword("");
      setConfirmation("");
      setFiles({});
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Pendaftaran gagal. Isian tetap tersimpan di halaman ini; coba lagi.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="form-success" role="status">
        <span className="success-mark">✓</span>
        <p className="section-kicker">Pendaftaran diterima</p>
        <h2>Simpan nomor pendaftaranmu.</h2>
        <strong>{receipt}</strong>
        <p>
          Data dan berkas tersimpan. Masuk menggunakan nomor ini dan password
          yang dibuat untuk melihat hasil pemeriksaan serta memperbaiki berkas.
        </p>
        <Link className="button button-dark" href="/pendaftar">
          Buka portal pendaftar
        </Link>
        <button
          className="button registration-back"
          onClick={() => window.print()}
        >
          Cetak bukti
        </button>
      </div>
    );
  if (state.status === "loading")
    return (
      <div className="registration-form" role="status">
        Memuat informasi pendaftaran…
      </div>
    );
  if (state.status === "error")
    return (
      <div className="registration-form" role="alert">
        <p>{state.error}</p>
        <button onClick={state.reload}>Coba lagi</button>
      </div>
    );
  if (!state.settings.registrationOpen)
    return (
      <div className="registration-form">
        <p className="section-kicker">PPDB {state.settings.academicYear}</p>
        <h2>Pendaftaran belum dibuka.</h2>
        <p>
          Silakan hubungi sekolah untuk informasi jadwal. Pendaftar yang sudah
          memiliki nomor tetap dapat mengakses portal.
        </p>
        <Link className="button button-dark" href="/pendaftar">
          Masuk portal pendaftar
        </Link>
      </div>
    );
  return (
    <form
      className="registration-form registration-wizard"
      onSubmit={submit}
      ref={formRef}
      aria-busy={busy}
    >
      <div className="form-heading">
        <span>Formulir PPDB</span>
        <strong>{state.settings.academicYear}</strong>
      </div>
      <ol className="wizard-progress" aria-label={`Langkah ${step} dari 4`}>
        {steps.map((label, i) => (
          <li
            key={label}
            className={i + 1 <= step ? "active" : ""}
            aria-current={i + 1 === step ? "step" : undefined}
          >
            <b>0{i + 1}</b>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <h2 className="wizard-step-title" ref={stepHeadingRef} tabIndex={-1}>
        {steps[step - 1]} <small>Langkah {step} dari 4</small>
      </h2>
      <p className="wizard-step-hint">
        {step === 1
          ? "Isi data sesuai dokumen calon siswa. Semua isian wajib, kecuali pilihan ekstrakurikuler."
          : step === 2
            ? "Gunakan kontak yang aktif. Pekerjaan orang tua boleh dikosongkan."
            : step === 3
              ? "Unggah berkas yang ditandai wajib. Kamu bisa melihat pratinjau sebelum mengirim."
              : "Periksa kembali data dan berkas. Pendaftaran dikirim setelah kamu menyetujuinya."}
      </p>
      {step === 1 && (
        <>
          <StudentFields form={form} update={update} hideActivities />
          <ExtracurricularPicker
            value={choices}
            onChange={(v) => {
              key.current = "";
              setChoices(v);
            }}
          />
        </>
      )}
      {step === 2 && (
        <>
          <StudentFields form={form} update={update} parent />
          <fieldset>
            <legend>Akses portal pendaftar</legend>
            <p>
              Gunakan password ini bersama nomor pendaftaran untuk memeriksa
              status.
            </p>
            <div className="form-grid">
              <label>
                Password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    key.current = "";
                    setPassword(e.target.value);
                  }}
                />
                <small>Minimal 12 karakter.</small>
              </label>
              <label>
                Ulangi password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
            </div>
          </fieldset>
        </>
      )}
      {step === 3 && (
        <DocumentFields
          files={files}
          setFiles={(v) => {
            key.current = "";
            setFiles(v);
          }}
          requirements={state.settings.documentRequirements}
        />
      )}
      {step === 4 && (
        <>
          <RegistrationReview
            form={{
              ...form,
              extracurricular: choices.join(", ") || "Belum memilih",
            }}
            files={files}
            edit={go}
          />
          <label className="consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Saya menyatakan data sesuai dan menyetujui penggunaannya untuk
            proses penerimaan siswa.
          </label>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="registration-form-actions">
        {step > 1 && (
          <button
            type="button"
            disabled={busy}
            className="button registration-back"
            onClick={() => go(step - 1)}
          >
            Kembali
          </button>
        )}
        <button
          disabled={busy}
          className="button button-accent submit-button"
          type="submit"
        >
          {busy
            ? "Mengirim data dan berkas…"
            : step === 4
              ? "Kirim pendaftaran"
              : "Lanjut: " + steps[step]}
        </button>
      </div>
      <p className="form-help">
        Sudah mendaftar? <Link href="/pendaftar">Masuk portal pendaftar</Link>.
        Isian yang belum dikirim hilang saat halaman dimuat ulang.
      </p>
    </form>
  );
}
