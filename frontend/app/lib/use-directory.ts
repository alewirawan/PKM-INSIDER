"use client";
import { loadDirectory } from "./api/school";
import { useContentList } from "./use-content-list";
const load = async () => [await loadDirectory()];
const empty = { leaders: [], teachers: [] };
export function useDirectory() {
  const state = useContentList(load);
  return { ...state, directory: state.items[0] ?? empty };
}
