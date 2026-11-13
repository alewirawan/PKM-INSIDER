import school from "../../contracts/school-profile.json";
export type SchoolLeader = {
  id: string;
  name: string;
  role: string;
  initials: string;
  focus: string;
  tone: string;
  level: "principal" | "leadership" | "support";
  portraitIndex: number;
  parentId?: string | null;
  coordination?: boolean;
};

export type Teacher = {
  id: string;
  name: string;
  initials: string;
  subject: string;
  cluster: "Sains" | "Bahasa" | "Sosial" | "Kreatif & Karakter" | null;
  years: number | null;
  note: string;
  tone: string;
  portraitIndex: number;
};

export type SchoolDirectory = {
  leaders: SchoolLeader[];
  teachers: Teacher[];
};

export const organizationLevels: SchoolLeader["level"][] = [
  "principal",
  "leadership",
  "support",
];

export function groupSchoolLeaders(leaders: SchoolLeader[]) {
  return organizationLevels
    .map((level) => ({
      level,
      people: leaders.filter((person) => person.level === level),
    }))
    .filter((group) => group.people.length > 0);
}

export function chunkDirectoryRows<T>(items: T[], requestedSize = 4) {
  const size = Math.max(1, Math.floor(requestedSize));
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size)
    rows.push(items.slice(index, index + size));
  return rows;
}

export function hasOtherPrincipal(leaders: SchoolLeader[], leaderId?: string) {
  return leaders.some(
    (person) => person.level === "principal" && person.id !== leaderId,
  );
}

const tones = ["sage", "clay", "sky", "sand", "moss", "rose", "ocean", "sun"];
export const teachers: Teacher[] = school.teachers.map((person, index) => ({
  ...person,
  subject: person.subject,
  cluster: null,
  years: null,
  note: "SMP Nurul Huda Cisoka",
  tone: tones[index % tones.length],
  portraitIndex: 0,
}));
export const seedSchoolDirectory: SchoolDirectory = {
  leaders: school.leaders as SchoolLeader[],
  teachers,
};

export function isDescendant(
  leaders: SchoolLeader[],
  candidateId: string,
  ancestorId: string,
): boolean {
  const visited = new Set<string>();
  let id: string | null | undefined = candidateId;
  while (id && !visited.has(id)) {
    if (id === ancestorId) return true;
    visited.add(id);
    id = leaders.find((person) => person.id === id)?.parentId;
  }
  return false;
}
