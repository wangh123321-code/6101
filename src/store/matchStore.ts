import { create } from 'zustand';
import type { MatchData, WSState, ReplayState, ReplayClip, ReplayClipType } from '@/types/match';

interface MatchStore {
  matches: Record<number, MatchData>;
  selectedTableIds: number[];
  splitMode: boolean;
  wsState: WSState;
  replay: ReplayState;
  lastGamePointFlags: Record<number, boolean>;
  lastMatchPointFlags: Record<number, boolean>;
  lastSequences: Record<number, number>;

  updateMatch: (data: MatchData, sequence?: number) => void;
  batchUpdate: (updates: MatchData[], sequences?: number[]) => void;
  selectTable: (tableId: number) => void;
  toggleSplitMode: () => void;
  setWsState: (state: Partial<WSState>) => void;
  initMatches: (matches: MatchData[]) => void;

  enterReplayMode: (tableId: number, clipId: string) => void;
  exitReplayMode: () => void;
  setReplayStep: (step: number) => void;
  toggleReplayPlay: () => void;
  setReplayClipByIndex: (tableId: number, index: number) => void;

  rebuildClipsFromHistory: (history: Array<{ sequence: number; match: MatchData }>) => void;
}

const initialWsState: WSState = {
  connected: false,
  lastSequence: 0,
  reconnecting: false,
  disconnectedAt: null,
  showBanner: false,
};

const initialReplayState: ReplayState = {
  isReplayMode: false,
  currentClip: null,
  currentStep: 0,
  isPlaying: false,
  clipsByTable: {},
  activeTableId: null,
};

function buildClip(
  tableId: number,
  type: ReplayClipType,
  rallyScores: Array<{ player1: number; player2: number }>,
  gameNumber: number,
  timestamp: number,
  sequence: number
): ReplayClip | null {
  if (rallyScores.length === 0) return null;
  const triggerIndex = rallyScores.length - 1;
  const windowSize = 5;
  const start = Math.max(0, triggerIndex - windowSize);
  const end = Math.min(rallyScores.length, triggerIndex + windowSize + 1);
  const sliced = rallyScores.slice(start, end);
  if (sliced.length === 0) return null;
  return {
    id: `${tableId}-${type}-${sequence}-${timestamp}`,
    tableId,
    type,
    rallyScores: sliced,
    triggerIndex: triggerIndex - start,
    gameNumber,
    timestamp,
    sequence,
  };
}

export const useMatchStore = create<MatchStore>((set) => ({
  matches: {},
  selectedTableIds: [],
  splitMode: false,
  wsState: initialWsState,
  replay: initialReplayState,
  lastGamePointFlags: {},
  lastMatchPointFlags: {},
  lastSequences: {},

  updateMatch: (data: MatchData, sequence?: number) =>
    set((state) => {
      const prevMatch = state.matches[data.tableId];
      const prevIsGamePoint = state.lastGamePointFlags[data.tableId] ?? false;
      const prevIsMatchPoint = state.lastMatchPointFlags[data.tableId] ?? false;

      const newMatches = { ...state.matches, [data.tableId]: data };
      const newFlags = {
        lastGamePointFlags: { ...state.lastGamePointFlags, [data.tableId]: data.isGamePoint },
        lastMatchPointFlags: { ...state.lastMatchPointFlags, [data.tableId]: data.isMatchPoint },
      };
      const newSequences = sequence !== undefined
        ? { ...state.lastSequences, [data.tableId]: sequence }
        : state.lastSequences;

      const newClipsByTable = { ...state.replay.clipsByTable };
      let clipsChanged = false;

      const triggerRally = data.rallyScores;
      const seq = sequence ?? state.lastSequences[data.tableId] ?? 0;
      const ts = Date.now();

      if (data.isMatchPoint && !prevIsMatchPoint && prevMatch) {
        const clip = buildClip(data.tableId, 'match_point', triggerRally, data.currentGame, ts, seq);
        if (clip) {
          const existing = newClipsByTable[data.tableId] ?? [];
          const lastClip = existing[existing.length - 1];
          if (!lastClip || lastClip.sequence !== clip.sequence) {
            newClipsByTable[data.tableId] = [...existing, clip];
            clipsChanged = true;
          }
        }
      }

      if (data.isGamePoint && !prevIsGamePoint && !data.isMatchPoint && prevMatch) {
        const clip = buildClip(data.tableId, 'game_point', triggerRally, data.currentGame, ts, seq);
        if (clip) {
          const existing = newClipsByTable[data.tableId] ?? [];
          const lastClip = existing[existing.length - 1];
          if (!lastClip || lastClip.sequence !== clip.sequence) {
            newClipsByTable[data.tableId] = [...existing, clip];
            clipsChanged = true;
          }
        }
      }

      const replay = clipsChanged
        ? { ...state.replay, clipsByTable: newClipsByTable }
        : state.replay;

      return {
        matches: newMatches,
        ...newFlags,
        lastSequences: newSequences,
        replay,
      };
    }),

  batchUpdate: (updates: MatchData[], sequences?: number[]) =>
    set((state) => {
      const newMatches = { ...state.matches };
      const newGameFlags = { ...state.lastGamePointFlags };
      const newMatchFlags = { ...state.lastMatchPointFlags };
      const newSequences = { ...state.lastSequences };
      const newClipsByTable = { ...state.replay.clipsByTable };
      let clipsChanged = false;

      for (let i = 0; i < updates.length; i++) {
        const data = updates[i];
        const prevMatch = state.matches[data.tableId];
        const prevIsGamePoint = state.lastGamePointFlags[data.tableId] ?? false;
        const prevIsMatchPoint = state.lastMatchPointFlags[data.tableId] ?? false;

        newMatches[data.tableId] = data;
        newGameFlags[data.tableId] = data.isGamePoint;
        newMatchFlags[data.tableId] = data.isMatchPoint;
        const seq = sequences?.[i] ?? state.lastSequences[data.tableId] ?? 0;
        newSequences[data.tableId] = seq;

        const triggerRally = data.rallyScores;
        const ts = Date.now();

        if (data.isMatchPoint && !prevIsMatchPoint && prevMatch) {
          const clip = buildClip(data.tableId, 'match_point', triggerRally, data.currentGame, ts, seq);
          if (clip) {
            const existing = newClipsByTable[data.tableId] ?? [];
            const lastClip = existing[existing.length - 1];
            if (!lastClip || lastClip.sequence !== clip.sequence) {
              newClipsByTable[data.tableId] = [...existing, clip];
              clipsChanged = true;
            }
          }
        }

        if (data.isGamePoint && !prevIsGamePoint && !data.isMatchPoint && prevMatch) {
          const clip = buildClip(data.tableId, 'game_point', triggerRally, data.currentGame, ts, seq);
          if (clip) {
            const existing = newClipsByTable[data.tableId] ?? [];
            const lastClip = existing[existing.length - 1];
            if (!lastClip || lastClip.sequence !== clip.sequence) {
              newClipsByTable[data.tableId] = [...existing, clip];
              clipsChanged = true;
            }
          }
        }
      }

      const replay = clipsChanged
        ? { ...state.replay, clipsByTable: newClipsByTable }
        : state.replay;

      return {
        matches: newMatches,
        lastGamePointFlags: newGameFlags,
        lastMatchPointFlags: newMatchFlags,
        lastSequences: newSequences,
        replay,
      };
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

  enterReplayMode: (tableId: number, clipId: string) =>
    set((state) => {
      const clips = state.replay.clipsByTable[tableId] ?? [];
      const clip = clips.find((c) => c.id === clipId) ?? clips[clips.length - 1] ?? null;
      if (!clip) return state;

      let newSelectedTableIds = state.selectedTableIds;
      let newSplitMode = state.splitMode;
      if (!state.selectedTableIds.includes(tableId)) {
        if (state.splitMode) {
          newSelectedTableIds = [state.selectedTableIds[0] ?? tableId, tableId].filter(Boolean) as number[];
          if (newSelectedTableIds.length < 2) newSplitMode = false;
        } else {
          newSelectedTableIds = [tableId];
        }
      }

      return {
        selectedTableIds: newSelectedTableIds,
        splitMode: newSplitMode,
        replay: {
          ...state.replay,
          isReplayMode: true,
          currentClip: clip,
          currentStep: 0,
          isPlaying: false,
          activeTableId: tableId,
        },
      };
    }),

  exitReplayMode: () =>
    set((state) => ({
      replay: {
        ...state.replay,
        isReplayMode: false,
        currentClip: null,
        currentStep: 0,
        isPlaying: false,
        activeTableId: null,
      },
    })),

  setReplayStep: (step: number) =>
    set((state) => {
      if (!state.replay.currentClip) return state;
      const maxStep = state.replay.currentClip.rallyScores.length - 1;
      const clamped = Math.max(0, Math.min(step, maxStep));
      return { replay: { ...state.replay, currentStep: clamped } };
    }),

  toggleReplayPlay: () =>
    set((state) => ({
      replay: { ...state.replay, isPlaying: !state.replay.isPlaying },
    })),

  setReplayClipByIndex: (tableId: number, index: number) =>
    set((state) => {
      const clips = state.replay.clipsByTable[tableId] ?? [];
      const clip = clips[Math.max(0, Math.min(index, clips.length - 1))] ?? null;
      if (!clip) return state;
      return {
        replay: {
          ...state.replay,
          isReplayMode: true,
          currentClip: clip,
          currentStep: 0,
          isPlaying: false,
          activeTableId: tableId,
        },
      };
    }),

  rebuildClipsFromHistory: (history: Array<{ sequence: number; match: MatchData }>) =>
    set((state) => {
      const sorted = [...history].sort((a, b) => a.sequence - b.sequence);
      const tableMatches: Record<number, Array<{ sequence: number; match: MatchData }>> = {};
      for (const h of sorted) {
        if (!tableMatches[h.match.tableId]) tableMatches[h.match.tableId] = [];
        tableMatches[h.match.tableId].push(h);
      }

      const newClipsByTable: Record<number, ReplayClip[]> = {
        ...state.replay.clipsByTable,
      };
      let changed = false;

      for (const tableIdStr of Object.keys(tableMatches)) {
        const tableId = Number(tableIdStr);
        const arr = tableMatches[tableId];
        const existingIds = new Set((newClipsByTable[tableId] ?? []).map((c) => c.id));
        const list: ReplayClip[] = [];

        let prevIsGamePoint = false;
        let prevIsMatchPoint = false;

        for (let i = 0; i < arr.length; i++) {
          const { match, sequence } = arr[i];
          const triggerRally = match.rallyScores;
          const ts = Date.now();

          if (match.isMatchPoint && !prevIsMatchPoint) {
            const clip = buildClip(
              tableId,
              'match_point',
              triggerRally,
              match.currentGame,
              ts,
              sequence
            );
            if (clip && !existingIds.has(clip.id)) {
              list.push(clip);
              changed = true;
            }
          }

          if (match.isGamePoint && !prevIsGamePoint && !match.isMatchPoint) {
            const clip = buildClip(
              tableId,
              'game_point',
              triggerRally,
              match.currentGame,
              ts,
              sequence
            );
            if (clip && !existingIds.has(clip.id)) {
              list.push(clip);
              changed = true;
            }
          }

          prevIsGamePoint = match.isGamePoint;
          prevIsMatchPoint = match.isMatchPoint;
        }

        if (list.length > 0) {
          newClipsByTable[tableId] = [...(newClipsByTable[tableId] ?? []), ...list].sort(
            (a, b) => a.sequence - b.sequence
          );
        }
      }

      if (!changed) return state;

      return {
        replay: {
          ...state.replay,
          clipsByTable: newClipsByTable,
        },
      };
    }),
}));
