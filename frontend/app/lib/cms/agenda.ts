import { KEYS, readJson, writeJson } from "./storage";
import type { Agenda } from "./types";

export const seedAgenda: Agenda[] = [
  {
    id: "agenda-1",
    title: "Rapat tim PPDB",
    date: "2026-09-19",
    time: "09:00",
    location: "Ruang Rapat 2",
    type: "Rapat",
    completed: false,
    visibility: "Internal",
  },
  {
    id: "agenda-2",
    title: "Open house sekolah",
    date: "2026-09-21",
    time: "08:00",
    location: "Aula Utama",
    type: "PPDB",
    completed: false,
    visibility: "Publik",
  },
  {
    id: "agenda-3",
    title: "Wawancara beasiswa",
    date: "2026-09-24",
    time: "10:00",
    location: "Ruang Konseling",
    type: "PPDB",
    completed: false,
    visibility: "Internal",
  },
];

export function getAgenda() {
  const stored = readJson<Agenda[] | null>(KEYS.agenda, null);
  return (stored !== null ? stored : seedAgenda)
    .map((item) => ({
      ...item,
      visibility:
        item.visibility === "Publik"
          ? ("Publik" as const)
          : ("Internal" as const),
    }))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}
export function saveAgenda(value: Agenda[]) {
  writeJson(KEYS.agenda, value);
}
