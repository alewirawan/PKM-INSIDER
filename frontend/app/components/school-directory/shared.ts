import type { SchoolLeader, Teacher } from "../../school-directory-data";

export type Tab = "structure" | "teachers";
export type Editor =
  | { kind: "leader"; value: SchoolLeader; isNew: boolean }
  | { kind: "teacher"; value: Teacher; isNew: boolean }
  | null;

export const tones = [
  "sun",
  "sage",
  "clay",
  "sky",
  "sand",
  "moss",
  "rose",
  "ocean",
];
export const levels: Array<{ value: SchoolLeader["level"]; label: string }> = [
  { value: "principal", label: "Kepala sekolah" },
  { value: "leadership", label: "Wakil kepala & bidang" },
  { value: "support", label: "Yayasan, komite & pendukung" },
];
export const clusters: NonNullable<Teacher["cluster"]>[] = [
  "Sains",
  "Bahasa",
  "Sosial",
  "Kreatif & Karakter",
];
export const portraitPositions = [
  "0% 0%",
  "33.333% 0%",
  "66.667% 0%",
  "100% 0%",
  "0% 100%",
  "33.333% 100%",
  "66.667% 100%",
  "100% 100%",
];

export function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "NH"
  );
}
