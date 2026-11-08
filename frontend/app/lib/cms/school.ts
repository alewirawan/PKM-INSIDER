import {
  seedSchoolDirectory,
  type SchoolDirectory,
} from "../../school-directory-data";
import { KEYS, readJson, writeJson } from "./storage";
import type { SchoolSettings } from "./types";

export const defaultSettings: SchoolSettings = {
  schoolName: "SMP Nurul Huda",
  tagline: "Lorem ipsum dolor sit amet",
  email: "lorem@ipsum.test",
  ppdbEmail: "ppdb@ipsum.test",
  phone: "081200000001",
  whatsapp: "081200000002",
  address: "Lorem ipsum dolor sit amet, consectetur adipiscing 00000",
  academicYear: "2026/2027",
  registrationOpen: true,
  documentRequirements: { requiredKinds: [], requireOneGraduationDocument: false },
  registrationOpensAt: null,
  registrationClosesAt: null,
  dataRetention: "indefinite",
};

export function getSchoolSettings() {
  // Data lama di browser belum memuat field kontrak v1.2.0; lengkapi dari default.
  const stored = {
    ...defaultSettings,
    ...readJson<Partial<SchoolSettings>>(KEYS.settings, defaultSettings),
  } as SchoolSettings;
  return {
    ...stored,
    documentRequirements: {
      ...defaultSettings.documentRequirements,
      ...(stored.documentRequirements ?? {}),
    },
    dataRetention: "indefinite" as const,
    schoolName:
      stored.schoolName === "SMA Arunika Nusantara"
        ? defaultSettings.schoolName
        : stored.schoolName,
    email:
      stored.email === "hallo@arunika.sch.id"
        ? defaultSettings.email
        : stored.email,
    ppdbEmail:
      stored.ppdbEmail === "ppdb@arunika.sch.id"
        ? defaultSettings.ppdbEmail
        : stored.ppdbEmail,
  };
}
export function saveSchoolSettings(value: SchoolSettings) {
  writeJson(KEYS.settings, value);
}

export function getSchoolDirectory(): SchoolDirectory {
  const stored = readJson<SchoolDirectory | null>(KEYS.directory, null);
  if (stored === null) return seedSchoolDirectory;
  return {
    leaders: (stored.leaders ?? []).map((leader, index) => ({
      ...leader,
      portraitIndex: leader.portraitIndex ?? index % 8,
    })),
    teachers: (stored.teachers ?? []).map((teacher, index) => ({
      ...teacher,
      portraitIndex: teacher.portraitIndex ?? index % 8,
    })),
  };
}

export function saveSchoolDirectory(value: SchoolDirectory) {
  writeJson(KEYS.directory, value);
}
