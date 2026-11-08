"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { hasBackendApi } from "../lib/api-client";
import { getSettings } from "../lib/api/settings";
import {
  defaultSettings,
  getSchoolSettings,
  listenCmsUpdates,
  type SchoolSettings,
} from "../lib/local-cms";

export type SettingsStatus = "loading" | "ready" | "error";

type SettingsState = {
  /**
   * Pada mode API, selama status bukan "ready" nilai ini hanya placeholder
   * tampilan (defaultSettings) dan BUKAN jawaban server. Jangan dipakai untuk
   * keputusan seperti PPDB buka/tutup; periksa `status` terlebih dahulu.
   */
  settings: SchoolSettings;
  status: SettingsStatus;
  source: "api" | "demo";
  error: string | null;
  reload: () => void;
  /** Perbarui state setelah PUT /settings berhasil (respons server). */
  applySaved: (value: SchoolSettings) => void;
};

const SchoolSettingsContext = createContext<SettingsState>({
  settings: defaultSettings,
  status: "ready",
  source: "demo",
  error: null,
  reload: () => undefined,
  applySaved: () => undefined,
});

export function SchoolSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const useApi = hasBackendApi();
  const [settings, setSettings] = useState(defaultSettings);
  const [status, setStatus] = useState<SettingsStatus>(
    useApi ? "loading" : "ready",
  );
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Mode demo: baca adapter lokal dan ikuti perubahan dari dashboard demo.
  useEffect(() => {
    if (useApi) return;
    const load = () => setSettings(getSchoolSettings());
    load();
    return listenCmsUpdates(load);
  }, [useApi]);

  // Mode API: muat GET /settings sekali (diulang hanya lewat reload()).
  useEffect(() => {
    if (!useApi) return;
    const controller = new AbortController();
    let active = true;
    getSettings({ signal: controller.signal })
      .then((value) => {
        if (!active) return;
        setSettings(value);
        setError(null);
        setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Pengaturan sekolah tidak dapat dimuat.",
        );
        setStatus("error");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [useApi, attempt]);

  const reload = useCallback(() => {
    if (!useApi) return;
    setStatus("loading");
    setError(null);
    setAttempt((value) => value + 1);
  }, [useApi]);

  const applySaved = useCallback((value: SchoolSettings) => {
    setSettings(value);
    setError(null);
    setStatus("ready");
  }, []);

  const value = useMemo<SettingsState>(
    () => ({
      settings,
      status,
      source: useApi ? "api" : "demo",
      error,
      reload,
      applySaved,
    }),
    [settings, status, useApi, error, reload, applySaved],
  );

  return (
    <SchoolSettingsContext.Provider value={value}>
      {children}
    </SchoolSettingsContext.Provider>
  );
}

/** Kompatibel dengan pemakai lama (header, footer, form pendaftaran). */
export function useSchoolSettings() {
  return useContext(SchoolSettingsContext).settings;
}

/** Untuk komponen yang perlu menampilkan loading/gagal atau menyimpan. */
export function useSchoolSettingsState() {
  return useContext(SchoolSettingsContext);
}

/** Apakah PPDB boleh dinyatakan buka/tutup kepada pengunjung saat ini. */
export function describeRegistration(state: SettingsState):
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "open" | "closed"; academicYear: string } {
  if (state.status === "loading") return { kind: "loading" };
  if (state.status === "error") return { kind: "error" };
  return {
    kind: state.settings.registrationOpen ? "open" : "closed",
    academicYear: state.settings.academicYear,
  };
}
