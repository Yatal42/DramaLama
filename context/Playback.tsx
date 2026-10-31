import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const progressKey = 'dramashorts.continue';
const savedKey = 'dramashorts.saved';
const likedKey = 'dramashorts.liked';

export type Progress = {
  seriesId: string;
  episodeId: string;
  positionSec: number;
  updatedAt: number;
};

type PlaybackContextValue = {
  ready: boolean;
  entries: Progress[];
  saved: string[];
  getProgress: (seriesId: string) => Progress | undefined;
  markProgress: (seriesId: string, episodeId: string, positionSec: number) => void;
  isSaved: (seriesId: string) => boolean;
  toggleSaved: (seriesId: string) => void;
  isLiked: (episodeId: string) => boolean;
  toggleLiked: (episodeId: string) => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

function readList<T>(raw: string | null): T[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : undefined;
  } catch {
    return undefined;
  }
}

function toggleIn(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [value, ...list];
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Progress[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const entriesRef = useRef(entries);
  const savedRef = useRef(saved);
  const likedRef = useRef(liked);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([progressKey, savedKey, likedKey])
      .then(([[, rawProgress], [, rawSaved], [, rawLiked]]) => {
        if (cancelled) return;
        const progress = readList<Progress>(rawProgress);
        const savedList = readList<string>(rawSaved);
        const likedList = readList<string>(rawLiked);
        if (progress) {
          entriesRef.current = progress;
          setEntries(progress);
        }
        if (savedList) {
          savedRef.current = savedList;
          setSaved(savedList);
        }
        if (likedList) {
          likedRef.current = likedList;
          setLiked(likedList);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markProgress = useCallback(
    (seriesId: string, episodeId: string, positionSec: number) => {
      const next: Progress[] = [
        {
          seriesId,
          episodeId,
          positionSec: Math.max(0, positionSec),
          updatedAt: Date.now(),
        },
        ...entriesRef.current.filter((item) => item.seriesId !== seriesId),
      ];
      entriesRef.current = next;
      setEntries(next);
      AsyncStorage.setItem(progressKey, JSON.stringify(next)).catch(() => {});
    },
    [],
  );

  const toggleSaved = useCallback((seriesId: string) => {
    const next = toggleIn(savedRef.current, seriesId);
    savedRef.current = next;
    setSaved(next);
    AsyncStorage.setItem(savedKey, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggleLiked = useCallback((episodeId: string) => {
    const next = toggleIn(likedRef.current, episodeId);
    likedRef.current = next;
    setLiked(next);
    AsyncStorage.setItem(likedKey, JSON.stringify(next)).catch(() => {});
  }, []);

  const getProgress = useCallback(
    (seriesId: string) => entries.find((item) => item.seriesId === seriesId),
    [entries],
  );

  const isSaved = useCallback((seriesId: string) => saved.includes(seriesId), [saved]);

  const isLiked = useCallback((episodeId: string) => liked.includes(episodeId), [liked]);

  const value = useMemo(
    () => ({
      ready,
      entries,
      saved,
      getProgress,
      markProgress,
      isSaved,
      toggleSaved,
      isLiked,
      toggleLiked,
    }),
    [ready, entries, saved, getProgress, markProgress, isSaved, toggleSaved, isLiked, toggleLiked],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const value = useContext(PlaybackContext);
  if (!value) {
    throw new Error('usePlayback must be used within PlaybackProvider');
  }
  return value;
}
