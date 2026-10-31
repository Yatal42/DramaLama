import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const storageKey = 'dramashorts.recentSearches';
const limit = 8;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecent(parsed.filter((item) => typeof item === 'string'));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    setRecent(next);
    AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
  }, []);

  const addRecent = useCallback(
    (query: string) => {
      const value = query.trim();
      if (!value) return;
      setRecent((current) => {
        const next = [value, ...current.filter((item) => item !== value)].slice(0, limit);
        AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const removeRecent = useCallback(
    (query: string) => persist(recent.filter((item) => item !== query)),
    [persist, recent],
  );

  const clearRecent = useCallback(() => persist([]), [persist]);

  return { recent, addRecent, removeRecent, clearRecent };
}
