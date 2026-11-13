import { KEYS, readJson, writeJson } from "./storage";
import type { Agenda } from "./types";

export const seedAgenda: Agenda[] = [];

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
