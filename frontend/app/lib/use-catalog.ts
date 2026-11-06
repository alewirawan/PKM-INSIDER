"use client";
import { useEffect, useState } from "react";
import { getAchievements, seedAchievements } from "./cms/catalog";
import { listenCmsUpdates } from "./cms/storage";
import { useClubs } from "./use-clubs";

export function useCatalog() {
  const [achievements, setAchievements] = useState(seedAchievements);
  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();
  useEffect(() => {
    const refresh = () => {
      setAchievements(getAchievements());
    };
    const timer = window.setTimeout(refresh, 0);
    const stop = listenCmsUpdates(refresh);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);
  return { achievements, clubs, clubsLoading, clubsError };
}
