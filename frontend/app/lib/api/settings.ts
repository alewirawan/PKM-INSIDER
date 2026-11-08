import { ApiError, requestApi } from "../api-client";
import type {
  RequirableDocumentKind,
  SchoolSettings,
} from "../cms/types";

/**
 * Client Pengaturan sekolah (anggota 1). Backend GET/PUT /settings milik anggota 9.
 * Kontrak: contracts/openapi.yaml -> SchoolSettings (v1.2.0).
 * Path tanpa prefix /api/v1; prefix ada pada NEXT_PUBLIC_API_BASE_URL.
 */

export const REQUIRABLE_DOCUMENT_KINDS: ReadonlyArray<{
  kind: RequirableDocumentKind;
  label: string;
}> = [
  { kind: "skl", label: "SKL" },
  { kind: "ijazah", label: "Ijazah" },
  { kind: "kk", label: "Kartu Keluarga" },
  { kind: "ktp", label: "KTP orang tua/wali" },
  { kind: "akta", label: "Akta kelahiran" },
];

export type SettingsErrors = Partial<
  Record<
    | "schoolName"
    | "tagline"
    | "email"
    | "ppdbEmail"
    | "phone"
    | "whatsapp"
    | "address"
    | "academicYear"
    | "requiredKinds"
    | "registrationOpensAt"
    | "registrationClosesAt",
    string
  >
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YEAR_PATTERN = /^[0-9]{4}\/[0-9]{4}$/;
const ALLOWED_KINDS = new Set<string>(
  REQUIRABLE_DOCUMENT_KINDS.map((item) => item.kind),
);

function lengthError(value: string, min: number, max: number, label: string) {
  const length = value.trim().length;
  if (length < min || length > max)
    return `${label} harus ${min}-${max} karakter.`;
  return undefined;
}

/**
 * Pemeriksaan awal di tampilan agar pesan muncul sebelum kirim.
 * Bukan pengganti validasi server (settings.schema.ts milik anggota 9).
 */
export function validateSettings(value: SchoolSettings): SettingsErrors {
  const errors: SettingsErrors = {};
  errors.schoolName = lengthError(value.schoolName, 2, 120, "Nama sekolah");
  errors.tagline = lengthError(value.tagline, 2, 160, "Tagline");
  errors.phone = lengthError(value.phone, 8, 30, "Telepon");
  errors.whatsapp = lengthError(value.whatsapp, 8, 30, "WhatsApp");
  errors.address = lengthError(value.address, 10, 500, "Alamat");
  if (!EMAIL_PATTERN.test(value.email.trim()))
    errors.email = "Format email tidak valid.";
  if (!EMAIL_PATTERN.test(value.ppdbEmail.trim()))
    errors.ppdbEmail = "Format email tidak valid.";
  if (!YEAR_PATTERN.test(value.academicYear))
    errors.academicYear = "Gunakan format YYYY/YYYY, contoh 2026/2027.";

  const kinds = value.documentRequirements.requiredKinds as string[];
  if (kinds.some((kind) => !ALLOWED_KINDS.has(kind)))
    errors.requiredKinds = "PIP/KIP dan pas foto tidak boleh diwajibkan.";
  else if (new Set(kinds).size !== kinds.length)
    errors.requiredKinds = "Jenis berkas tidak boleh duplikat.";

  const { registrationOpensAt: opens, registrationClosesAt: closes } = value;
  if (opens && Number.isNaN(Date.parse(opens)))
    errors.registrationOpensAt = "Tanggal buka tidak valid.";
  if (closes && Number.isNaN(Date.parse(closes)))
    errors.registrationClosesAt = "Tanggal tutup tidak valid.";
  if (
    opens &&
    closes &&
    !errors.registrationOpensAt &&
    !errors.registrationClosesAt &&
    Date.parse(closes) <= Date.parse(opens)
  )
    errors.registrationClosesAt = "Tanggal tutup harus sesudah tanggal buka.";

  for (const key of Object.keys(errors) as Array<keyof SettingsErrors>)
    if (!errors[key]) delete errors[key];
  return errors;
}

/** ISO date-time dari server -> nilai input datetime-local (waktu setempat). */
export function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Nilai input datetime-local -> ISO date-time, atau null jika kosong. */
export function fromLocalDateTimeInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Bagian kunci wajib kontrak; respons tanpa ini dianggap tidak valid. */
function assertSettingsShape(value: unknown): asserts value is SchoolSettings {
  const candidate = value as Partial<SchoolSettings> | null;
  if (
    !candidate ||
    typeof candidate.schoolName !== "string" ||
    typeof candidate.registrationOpen !== "boolean" ||
    !candidate.documentRequirements ||
    !Array.isArray(candidate.documentRequirements.requiredKinds) ||
    !("registrationOpensAt" in candidate) ||
    !("registrationClosesAt" in candidate)
  ) {
    throw new ApiError(
      0,
      "Respons pengaturan dari server tidak sesuai kontrak.",
    );
  }
}

export async function getSettings(
  init: { signal?: AbortSignal } = {},
): Promise<SchoolSettings> {
  const result = await requestApi<unknown>("/settings", {
    method: "GET",
    signal: init.signal,
  });
  assertSettingsShape(result);
  return result;
}

/** PUT mengirim seluruh SchoolSettings, bukan hanya field yang berubah. */
export async function saveSettings(
  input: SchoolSettings,
): Promise<SchoolSettings> {
  const result = await requestApi<unknown>("/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  assertSettingsShape(result);
  return result;
}
