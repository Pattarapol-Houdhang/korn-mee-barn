"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";

const MAX_COMPARE = 3;
const STORAGE_KEY = "kmb:compare";

type CompareContextValue = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  max: number;
};

const CompareContext = createContext<CompareContextValue>({
  ids: [],
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  has: () => false,
  max: MAX_COMPARE,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed.filter((x) => typeof x === "string").slice(0, MAX_COMPARE));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids, hydrated]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} listings`);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, has, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
