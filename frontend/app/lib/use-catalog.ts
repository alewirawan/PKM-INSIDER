"use client";
import { listAchievements } from "./api/school";
import { useContentList } from "./use-content-list";
import { useClubs } from "./use-clubs";

export function useCatalog(admin = false) {
  const {
    items: achievements,
    loading: achievementsLoading,
    error: achievementsError,
    refresh,
  } = useContentList(listAchievements, admin);
  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();
  return {
    achievements,
    achievementsLoading,
    achievementsError,
    refresh,
    clubs,
    clubsLoading,
    clubsError,
  };
}
