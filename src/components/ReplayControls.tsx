import { useEffect, useRef } from 'react';
import { useMatchStore } from '@/store/matchStore';
import type { ReplayClip } from '@/types/match';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const FRAME_INTERVAL_MS = 166;

interface ReplayControlsProps {
  tableId: number;
}

export default function ReplayControls({ tableId }: ReplayControlsProps) {
  const {
    replay,
    setReplayStep,
    toggleReplayPlay,
    exitReplayMode,
    setReplayClipByIndex,
  } = useMatchStore();

  const clips: ReplayClip[] = replay.clipsByTable[tableId] ?? [];
  const clip = replay.currentClip;
  const currentStep = replay.currentStep;
  const isPlaying = replay.isPlaying;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!clip) return;
    const maxStep = clip.rallyScores.length - 1;

    if (isPlaying && currentStep < maxStep) {
      timerRef.current = setInterval(() => {
        const state = useMatchStore.getState();
        const step = state.replay.currentStep;
        const clipData = state.replay.currentClip;
        if (!clipData) return;
        const max = clipData.rallyScores.length - 1;
        if (step >= max) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          useMatchStore.setState((s) => ({ replay: { ...s.replay, isPlaying: false } }));
          return;
        }
        setReplayStep(step + 1);
      }, FRAME_INTERVAL_MS);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentStep, clip, setReplayStep]);

  if (!clip) return null;

  const maxStep = clip.rallyScores.length - 1;
  const currentClipIndex = clips.findIndex((c) => c.id === clip.id);

  const clipBadgeColor = clip.type === 'match_point'
    ? 'bg-board-critical/20 text-board-critical border-board-critical/40'
    : 'bg-orange-500/15 text-orange-400 border-orange-400/40';
  const clipBadgeText = clip.type === 'match_point' ? '赛点' : '局点';
  const progressPct = maxStep > 0 ? (currentStep / maxStep) * 100 : 0;
  const triggerPct = clip.rallyScores.length > 1
    ? (clip.triggerIndex / maxStep) * 100
    : 100;

  return (
    <div className="bg-board-card rounded-lg border border-board-border p-2 lg:p-3 space-y-2 lg:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-display font-bold border ${clipBadgeColor}`}>
            {clipBadgeText}
          </span>
          <span className="text-[10px] lg:text-xs font-body text-board-dim">
            第 {clip.gameNumber} 局 · 第 {currentClipIndex + 1}/{clips.length} 条
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setReplayClipByIndex(tableId, Math.max(0, currentClipIndex - 1))}
            disabled={currentClipIndex <= 0}
            className="p-1 rounded text-board-dim hover:text-board-text hover:bg-board-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上一条"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setReplayClipByIndex(tableId, Math.min(clips.length - 1, currentClipIndex + 1))}
            disabled={currentClipIndex >= clips.length - 1}
            className="p-1 rounded text-board-dim hover:text-board-text hover:bg-board-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下一条"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={exitReplayMode}
            className="ml-1 p-1 rounded text-board-dim hover:text-board-critical hover:bg-board-critical/10 transition-colors"
            title="退出回放"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative h-2 bg-board-border/30 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-orange-400/30"
          style={{ width: `${triggerPct}%` }}
        />
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-board-accent to-orange-400 transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-board-critical/80"
          style={{ left: `${triggerPct}%` }}
          title="触发点"
        />
        <input
          type="range"
          min={0}
          max={maxStep}
          value={currentStep}
          onChange={(e) => setReplayStep(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-body text-board-muted tabular-nums">
          {currentStep + 1} / {maxStep + 1} 回合
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setReplayStep(0)}
            className="p-1.5 rounded text-board-dim hover:text-board-text hover:bg-board-surface transition-colors"
            title="回到开头"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setReplayStep(Math.max(0, currentStep - 1))}
            className="p-1.5 rounded text-board-dim hover:text-board-text hover:bg-board-surface transition-colors"
            title="上一回合"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleReplayPlay}
            className={`p-2 rounded-lg transition-all ${
              isPlaying
                ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_12px_rgba(255,140,50,0.4)]'
                : 'bg-board-accent/20 text-board-accent shadow-[0_0_12px_rgba(0,229,255,0.4)] hover:bg-board-accent/30'
            }`}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setReplayStep(Math.min(maxStep, currentStep + 1))}
            className="p-1.5 rounded text-board-dim hover:text-board-text hover:bg-board-surface transition-colors"
            title="下一回合"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setReplayStep(maxStep)}
            className="p-1.5 rounded text-board-dim hover:text-board-text hover:bg-board-surface transition-colors"
            title="跳到结尾"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[10px] font-body text-board-muted tabular-nums w-[60px] text-right">
          {Math.round(progressPct)}%
        </span>
      </div>
    </div>
  );
}
