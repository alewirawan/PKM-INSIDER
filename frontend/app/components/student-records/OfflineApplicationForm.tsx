"use client";
import { useRef, useState, type FormEvent } from "react";
import { DialogPortal } from "../DialogPortal";
import {
  StudentFields,
  initialRegistration,
  type RegistrationValues,
} from "../registration/StudentFields";
import { ExtracurricularPicker } from "../ExtracurricularPicker";
import { documentLabels } from "../../lib/cms/student-documents";
import { submitOffline, updateApplication } from "../../lib/api/applications";
import type { Application } from "../../lib/cms/types";

export function OfflineApplicationForm({
  record,
  close,
  saved,
}: {
  record?: Application;
  close: () => void;
  saved: (id: string) => void;
}) {
  const [form, setForm] = useState<RegistrationValues>({
    ...initialRegistration,
    ...record,
    gender: record?.gender ?? "Laki-laki",
    nisn: record?.nisn ?? "",
    birthPlace: record?.birthPlace ?? "",
    birthDate: record?.birthDate ?? "",
    address: record?.address ?? "",
    parentName: record?.parentName ?? "",
    parentOccupation: record?.parentOccupation ?? "",
    phone: record?.phone ?? "",
    email: record?.email ?? "",
    extracurricular: "",
  });
  const [choices, setChoices] = useState<string[]>(
      record?.extracurriculars ?? [],
    ),
    [physical, setPhysical] = useState<string[]>([]),
    [notes, setNotes] = useState(record?.notes ?? "");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef("");
  function update(field: keyof RegistrationValues, value: string) {
    key.current = "";
    setForm((v) => ({ ...v, [field]: value }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
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
      const value = {
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
        notes,
      };
      const result = record
        ? await updateApplication(record.id, value)
        : await submitOffline(
            { ...value, receivedDocumentKinds: physical },
            key.current,
          );
      saved(result.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Penyimpanan gagal.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <DialogPortal
      className="live-modal-backdrop"
      dialogClassName="live-modal"
      labelledBy="offline-title"
      onClose={() => {
        if (!busy) close();
      }}
    >
      <header>
        <div>
          <p className="admin-eyebrow">Data pendaftar</p>
          <h2 id="offline-title">
            {record ? "Perbarui biodata" : "Pendaftaran lewat sekolah"}
          </h2>
        </div>
        <button type="button" disabled={busy} onClick={close}>
          Tutup
        </button>
      </header>
      <form onSubmit={submit} className="registration-form">
        <StudentFields form={form} update={update} hideActivities />
        <StudentFields form={form} update={update} parent />
        <ExtracurricularPicker
          value={choices}
          onChange={(v) => {
            key.current = "";
            setChoices(v);
          }}
          disabled={busy}
        />
        {!record && (
          <fieldset>
            <legend>Berkas fisik yang diterima</legend>
            <p>
              Menandai penerimaan fisik; belum berarti terverifikasi. Boleh
              disimpan sebelum lengkap.
            </p>
            <div className="offline-document-checks">
              {documentLabels.map((d) => (
                <label key={d.key}>
                  <input
                    type="checkbox"
                    checked={physical.includes(d.key)}
                    onChange={(e) => {
                      key.current = "";
                      setPhysical((v) =>
                        e.target.checked
                          ? [...v, d.key]
                          : v.filter((k) => k !== d.key),
                      );
                    }}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label>
          Catatan internal
          <textarea
            maxLength={1000}
            value={notes}
            onChange={(e) => {
              key.current = "";
              setNotes(e.target.value);
            }}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" disabled={busy} onClick={close}>
            Batal
          </button>
          <button
            className="button button-accent"
            disabled={busy}
            type="submit"
          >
            {busy ? "Menyimpan…" : "Simpan data"}
          </button>
        </footer>
      </form>
    </DialogPortal>
  );
}
