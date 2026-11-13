import school from "../../../../contracts/school-profile.json";
import { KEYS, readJson, writeJson } from "./storage";

export type Achievement = {
  id: string;
  title: string;
  award: string;
  level: string;
  year: string;
  category: string;
  description: string;
  image: string;
  published: boolean;
};
export type Club = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
export const seedAchievements: Achievement[] = [];
export const seedClubs: Club[] = school.clubs.map((club) => ({
  ...club,
  active: true,
}));
export const getAchievements = () =>
  readJson<Achievement[]>(KEYS.achievements, seedAchievements);
export const saveAchievements = (items: Achievement[]) =>
  writeJson(KEYS.achievements, items);
export const getClubs = () => readJson<Club[]>(KEYS.clubs, seedClubs);
export const saveClubs = (items: Club[]) => writeJson(KEYS.clubs, items);
