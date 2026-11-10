import { hasBackendApi, requestApi } from "../api-client";
import { getSchoolDirectory, saveSchoolDirectory } from "../cms/school";
import {
  getAchievements,
  saveAchievements,
  type Achievement,
} from "../cms/catalog";
import type { SchoolDirectory } from "../../school-directory-data";
import { announceContentUpdate } from "../use-content-list";

export async function loadDirectory(): Promise<SchoolDirectory> {
  return hasBackendApi() ? requestApi("/directory") : getSchoolDirectory();
}
export async function storeDirectory(
  value: SchoolDirectory,
): Promise<SchoolDirectory> {
  if (hasBackendApi()) {
    const saved = await requestApi<SchoolDirectory>("/directory", {
      method: "PUT",
      body: JSON.stringify(value),
    });
    announceContentUpdate();
    return saved;
  }
  saveSchoolDirectory(value);
  return value;
}
export async function listAchievements(admin = false): Promise<Achievement[]> {
  return hasBackendApi()
    ? requestApi(admin ? "/admin/achievements" : "/achievements")
    : getAchievements().filter((v) => admin || v.published);
}
export async function storeAchievement(
  value: Omit<Achievement, "id">,
  id?: string,
) {
  const { title, award, level, year, category, description, image, published } =
    value;
  const body = {
    title,
    award,
    level,
    year,
    category,
    description,
    image,
    published,
  };
  if (hasBackendApi())
    await requestApi(id ? `/achievements/${id}` : "/achievements", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(body),
    });
  else {
    const item = { ...body, id: id ?? crypto.randomUUID() };
    saveAchievements(
      id
        ? getAchievements().map((v) => (v.id === id ? item : v))
        : [item, ...getAchievements()],
    );
  }
  announceContentUpdate();
}
export async function removeAchievement(id: string) {
  if (hasBackendApi())
    await requestApi(`/achievements/${id}`, { method: "DELETE" });
  else saveAchievements(getAchievements().filter((v) => v.id !== id));
  announceContentUpdate();
}
