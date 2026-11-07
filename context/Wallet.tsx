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

const walletKey = 'dramalama.wallet';

export const welcomeCoins = 50;
export const checkInPoints = 10;
export const streakBonusPoints = 50;
export const commentPoints = 5;
export const dailyCommentCap = 3;

type WalletState = {
  customerId: string;
  coins: number;
  points: number;
  streak: number;
  lastCheckIn?: string;
  commentDay?: string;
  commentsToday: number;
};

type WalletContextValue = WalletState & {
  ready: boolean;
  checkedInToday: boolean;
  checkIn: () => number;
  rewardComment: () => number;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayKey(date);
}

function newCustomerId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'DL-';
  for (let index = 0; index < 6; index += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

function initialState(): WalletState {
  return {
    customerId: newCustomerId(),
    coins: welcomeCoins,
    points: 0,
    streak: 0,
    commentsToday: 0,
  };
}

function readState(raw: string | null): WalletState | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.customerId === 'string' ? (parsed as WalletState) : undefined;
  } catch {
    return undefined;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);

  const commit = useCallback((next: WalletState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(walletKey, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(walletKey)
      .then((raw) => {
        if (cancelled) return;
        const parsed = readState(raw);
        if (parsed) {
          stateRef.current = parsed;
          setState(parsed);
        } else {
          commit(stateRef.current);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const today = dayKey(new Date());
  const checkedInToday = state.lastCheckIn === today;

  const checkIn = useCallback(() => {
    const current = stateRef.current;
    const now = dayKey(new Date());
    if (current.lastCheckIn === now) return 0;
    const streak = current.lastCheckIn === yesterdayKey() ? current.streak + 1 : 1;
    const earned = checkInPoints + (streak % 7 === 0 ? streakBonusPoints : 0);
    commit({ ...current, streak, lastCheckIn: now, points: current.points + earned });
    return earned;
  }, [commit]);

  const rewardComment = useCallback(() => {
    const current = stateRef.current;
    const now = dayKey(new Date());
    const count = current.commentDay === now ? current.commentsToday : 0;
    if (count >= dailyCommentCap) {
      commit({ ...current, commentDay: now, commentsToday: count + 1 });
      return 0;
    }
    commit({
      ...current,
      commentDay: now,
      commentsToday: count + 1,
      points: current.points + commentPoints,
    });
    return commentPoints;
  }, [commit]);

  const value = useMemo(
    () => ({
      ...state,
      commentsToday: state.commentDay === today ? state.commentsToday : 0,
      streak: checkedInToday || state.lastCheckIn === yesterdayKey() ? state.streak : 0,
      ready,
      checkedInToday,
      checkIn,
      rewardComment,
    }),
    [state, today, ready, checkedInToday, checkIn, rewardComment],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return value;
}
