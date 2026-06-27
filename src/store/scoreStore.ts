import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NyayScoreResult } from '@/types';

interface ScoreStore {
  currentScore: NyayScoreResult | null;
  scoreId: string | null;
  isScanning: boolean;
  scanProgress: number;
  setScore: (score: NyayScoreResult, id: string) => void;
  setScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  clearScore: () => void;
}

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set) => ({
      currentScore: null,
      scoreId: null,
      isScanning: false,
      scanProgress: 0,
      setScore: (score, id) => set({ currentScore: score, scoreId: id }),
      setScanning: (scanning) => set({ isScanning: scanning }),
      setScanProgress: (progress) => set({ scanProgress: progress }),
      clearScore: () => set({ currentScore: null, scoreId: null }),
    }),
    { name: 'nyay-score-store' }
  )
);
