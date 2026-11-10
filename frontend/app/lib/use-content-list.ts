"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { listenCmsUpdates, CMS_EVENT } from "./cms/storage";

export function announceContentUpdate() {
  window.dispatchEvent(new CustomEvent(CMS_EVENT));
}

export function useContentList<T>(
  load: (admin: boolean) => Promise<T[]>,
  admin = false,
  enabled = true,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++sequence.current;
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const result = await load(admin);
      if (version === sequence.current) setItems(result);
    } catch (error) {
      if (version === sequence.current) {
        setItems([]);
        setError(error instanceof Error ? error.message : "Data gagal dimuat.");
      }
    } finally {
      if (version === sequence.current) setLoading(false);
    }
  }, [load, admin, enabled]);
  useEffect(() => {
    const invalidate = () => {
      sequence.current++;
    };
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const stop = listenCmsUpdates(() => {
      void refresh();
    });
    return () => {
      window.clearTimeout(timer);
      stop();
      invalidate();
    };
  }, [refresh]);
  return {
    setItems,
    items: enabled ? items : [],
    loading: enabled && loading,
    error: enabled ? error : "",
    refresh,
  };
}
