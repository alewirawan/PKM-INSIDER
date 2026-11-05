"use client";
import { useEffect, useState } from "react";
import {
  getAchievements,
  getClubs,
  seedAchievements,
  seedClubs,
} from "./cms/catalog";
import { listenCmsUpdates } from "./cms/storage";

export function useCatalog() {
  const [achievements, setAchievements] = useState(seedAchievements);
  const [clubs, setClubs] = useState(seedClubs);
  useEffect(() => {
    const refresh = () => {
      setAchievements(getAchievements());
      setClubs(getClubs());
    };
    const timer = window.setTimeout(refresh, 0);
    const stop = listenCmsUpdates(refresh);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);
  return { achievements, clubs };
}
