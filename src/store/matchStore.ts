import { create } from 'zustand';
import type { MatchData, WSState } from '@/types/match';

interface MatchStore {
  matches: Record<number, MatchData>;
  selectedTableIds: number[];
  splitMode: boolean;
  wsState: WSState;

  updateMatch: (data: MatchData) => void;
  batchUpdate: (updates: MatchData[]) => void;
  selectTable: (tableId: number) => void;
  toggleSplitMode: () => void;
  setWsState: (state: Partial<WSState>) => void;
  initMatches: (matches: MatchData[]) => void;
}

const initialWsState: WSState = {
  connected: false,
  lastSequence: 0,
  reconnecting: false,
  disconnectedAt: null,
  showBanner: false,
};

export const useMatchStore = create<MatchStore>((set) => ({
  matches: {},
  selectedTableIds: [],
  splitMode: false,
  wsState: initialWsState,

  updateMatch: (data: MatchData) =>
    set((state) => ({
      matches: { ...state.matches, [data.tableId]: data },
    })),

  batchUpdate: (updates: MatchData[]) =>
    set((state) => {
      const newMatches = { ...state.matches };
      for (const match of updates) {
        newMatches[match.tableId] = match;
      }
      return { matches: newMatches };
    }),

  selectTable: (tableId: number) =>
    set((state) => {
      if (state.splitMode) {
        if (state.selectedTableIds.includes(tableId)) {
          const filtered = state.selectedTableIds.filter((id) => id !== tableId);
          if (filtered.length === 0) {
            return { selectedTableIds: [], splitMode: false };
          }
          if (filtered.length === 1) {
            return { selectedTableIds: filtered, splitMode: false };
          }
          return { selectedTableIds: filtered };
        }
        if (state.selectedTableIds.length < 2) {
          return {
            selectedTableIds: [...state.selectedTableIds, tableId],
          };
        }
        return {
          selectedTableIds: [state.selectedTableIds[1], tableId],
        };
      }
      if (state.selectedTableIds.includes(tableId)) {
        return { selectedTableIds: [], splitMode: false };
      }
      return { selectedTableIds: [tableId] };
    }),

  toggleSplitMode: () =>
    set((state) => {
      if (state.splitMode) {
        return {
          splitMode: false,
          selectedTableIds: state.selectedTableIds.slice(0, 1),
        };
      }
      if (state.selectedTableIds.length >= 2) {
        return { splitMode: true };
      }
      return { splitMode: true };
    }),

  setWsState: (partial: Partial<WSState>) =>
    set((state) => ({
      wsState: { ...state.wsState, ...partial },
    })),

  initMatches: (matches: MatchData[]) =>
    set(() => {
      const record: Record<number, MatchData> = {};
      for (const match of matches) {
        record[match.tableId] = match;
      }
      return { matches: record };
    }),
}));
