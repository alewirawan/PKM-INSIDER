"use client";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import {
  addApplication,
  documentLabels,
  requiredDocumentsComplete,
  type Application,
} from "../lib/local-cms";
import { retainDemoFiles } from "../lib/registration-files";
import { useSchoolSettings } from "./SchoolSettingsProvider";
import {
  StudentFields,
  initialRegistration,
  type RegistrationValues,
} from "./registration/StudentFields";
import {
  DocumentFields,
  type SelectedFiles,
} from "./registration/DocumentFields";
import { RegistrationReview } from "./registration/RegistrationReview";
import { LiveRegistrationForm } from "./registration/LiveRegistrationForm";
import { hasBackendApi } from "../lib/api-client";

const steps = ["Data siswa", "Orang tua", "Berkas", "Periksa & kirim"];
export function RegistrationForm() {
  return hasBackendApi() ? <LiveRegistrationForm /> : <DemoRegistrationForm />;
}
function DemoRegistrationForm() {
  const settings = useSchoolSettings();
  const [form, setForm] = useState(initialRegistration);
  const [files, setFiles] = useState<SelectedFiles>({});
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  function update(key: keyof RegistrationValues, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function go(next: number) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      formRef.current
        ?.querySelector<HTMLElement>("fieldset input, h2")
        ?.focus();
    });
  }
  const documents = () =>
    documentLabels.map((doc) => ({
      ...doc,
      status: files[doc.key]
        ? ("Menunggu pemeriksaan" as const)
        : ("Belum ada" as const),
      ...(files[doc.key]
        ? {
            fileName: files[doc.key]!.name,
            size: files[doc.key]!.size,
            mimeType: files[doc.key]!.type,
          }
        : {}),
    }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) {
      if (step === 3 && !requiredDocumentsComplete(documents())) {
        setError(
          "Lengkapi KK, KTP orang tua/wali, akta kelahiran, dan salah satu SKL atau ijazah.",
        );
        return;
      }
      go(step + 1);
      return;
    }
    if (submitting.current) return;
    if (!requiredDocumentsComplete(documents())) {
      go(3);
      setError("Berkas wajib belum lengkap.");
      return;
    }
    if (!consent) {
      setError("Konfirmasi penggunaan data dummy terlebih dahulu.");
      return;
    }
    submitting.current = true;
    const id =
      "NH-" +
      new Date().getFullYear() +
      "-" +
      crypto.randomUUID().slice(0, 8).toUpperCase();
    try {
      const record: Application = {
        ...form,
        program: "",
        id,
        status: "Verifikasi",
        registrationSource: "Website",
        documents: documents(),
        submittedAt: new Date().toISOString(),
      };
      addApplication(record);
      retainDemoFiles(id, files);
      setSubmitted(id);
      setFiles({});
      setForm(initialRegistration);
      setConsent(false);
    } catch {
      setError(
        "Penyimpanan simulasi gagal. Data belum dihapus; coba kembali atau periksa penyimpanan browser.",
      );
    } finally {
      submitting.current = false;
    }
  }
  if (submitted)
    return (
      <div className="form-success" role="status">
        <span className="success-mark">✓</span>
        <p className="section-kicker">Simulasi berhasil</p>
        <h2>Pendaftaran sudah dicatat.</h2>
        <strong>{submitted}</strong>
        <p>
          Metadata tersimpan sementara pada tab ini. File hanya tersedia di
          memori sampai halaman dimuat ulang; tidak ada upload ke server.
        </p>
        <Link className="button button-dark" href="/admin">
          Lihat di admin pada tab ini
        </Link>
        <button
          className="button registration-back"
          onClick={() => {
            setSubmitted(null);
            setStep(1);
          }}
        >
          Isi pendaftaran lain
        </button>
      </div>
    );
  return (
    <form
      className="registration-form registration-wizard"
      onSubmit={submit}
      ref={formRef}
    >
      <div className="form-heading">
        <span>Formulir PPDB</span>
        <strong>{settings.academicYear}</strong>
      </div>
      <div className="demo-alert">
        <b>Simulasi frontend.</b> Gunakan data dan berkas dummy. Isian tetap ada
        saat berpindah langkah, tetapi hilang jika halaman dimuat ulang sebelum
        dikirim.
      </div>
      <ol
        className="wizard-progress"
        aria-label={"Langkah " + step + " dari 4"}
      >
        {steps.map((label, i) => (
          <li
            key={label}
            className={i + 1 <= step ? "active" : ""}
            aria-current={i + 1 === step ? "step" : undefined}
          >
            <b>{String(i + 1).padStart(2, "0")}</b>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      {step === 1 && <StudentFields form={form} update={update} />}
      {step === 2 && <StudentFields form={form} update={update} parent />}
      {step === 3 && <DocumentFields files={files} setFiles={setFiles} />}
      {step === 4 && (
        <>
          <RegistrationReview form={form} files={files} edit={go} />
          <label className="consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Saya menggunakan data dan berkas dummy serta memahami bahwa ini
            bukan pendaftaran resmi.
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
            className="button registration-back"
            onClick={() => go(step - 1)}
          >
            Kembali
          </button>
        )}
        <button className="button button-accent submit-button" type="submit">
          {step === 4 ? "Kirim pendaftaran demo" : "Lanjut: " + steps[step]}
        </button>
      </div>
    </form>
  );
}
