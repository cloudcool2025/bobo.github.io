import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Player {
  id: number;
  name: string;
  score: number;
  color: string;
}

interface ScoreHistoryItem {
  id: string;
  timestamp: number;
  playerId: number;
  change: number;
  previousScore: number;
  newScore: number;
}

interface GameState {
  players: Player[];
  targetScore: number;
  history: ScoreHistoryItem[];
  winner: Player | null;
  showHistory: boolean;
  showSettings: boolean;
  updatePlayerName: (id: number, name: string) => void;
  updateScore: (playerId: number, change: number) => void;
  undo: () => void;
  resetGame: () => void;
  setTargetScore: (score: number) => void;
  setShowHistory: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

const initialPlayers: Player[] = [
  { id: 1, name: '玩家 1', score: 0, color: '#FF6B6B' },
  { id: 2, name: '玩家 2', score: 0, color: '#4ECDC4' },
  { id: 3, name: '玩家 3', score: 0, color: '#FFE66D' },
  { id: 4, name: '玩家 4', score: 0, color: '#95E1D3' },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: initialPlayers,
      targetScore: 100,
      history: [],
      winner: null,
      showHistory: false,
      showSettings: false,

      updatePlayerName: (id: number, name: string) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      updateScore: (playerId: number, change: number) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          if (!player) return state;

          const previousScore = player.score;
          const newScore = Math.max(0, previousScore + change);

          const updatedPlayers = state.players.map((p) =>
            p.id === playerId ? { ...p, score: newScore } : p
          );

          const winner = updatedPlayers.find((p) => p.score >= state.targetScore) || null;

          const historyItem: ScoreHistoryItem = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            playerId,
            change,
            previousScore,
            newScore,
          };

          return {
            players: updatedPlayers,
            winner,
            history: [historyItem, ...state.history],
          };
        }),

      undo: () =>
        set((state) => {
          if (state.history.length === 0) return state;

          const [lastAction, ...remainingHistory] = state.history;
          const updatedPlayers = state.players.map((p) =>
            p.id === lastAction.playerId
              ? { ...p, score: lastAction.previousScore }
              : p
          );

          return {
            players: updatedPlayers,
            winner: null,
            history: remainingHistory,
          };
        }),

      resetGame: () =>
        set(() => ({
          players: initialPlayers.map((p) => ({ ...p, score: 0 })),
          history: [],
          winner: null,
        })),

      setTargetScore: (score: number) => set(() => ({ targetScore: score })),
      setShowHistory: (show: boolean) => set(() => ({ showHistory: show })),
      setShowSettings: (show: boolean) => set(() => ({ showSettings: show })),
    }),
    {
      name: 'pool-score-storage',
    }
  )
);
