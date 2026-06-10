import type { MatchData } from '@/types/match';
import { CircleDot } from 'lucide-react';

interface MatchHeaderProps {
  match: MatchData;
}

export default function MatchHeader({ match }: MatchHeaderProps) {
  return (
    <div className="bg-board-surface rounded-lg border border-board-border p-2 lg:p-4">
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <h2 className="font-display text-xs lg:text-base font-semibold text-board-accent tracking-wide uppercase">
          {match.tableName}
        </h2>
        <div className="flex items-center gap-2">
          {match.isMatchPoint && (
            <span className="text-[11px] font-display font-bold text-board-critical bg-board-critical/20 px-2 py-0.5 rounded animate-pulse">
              赛点
            </span>
          )}
          {match.isGamePoint && !match.isMatchPoint && (
            <span className="text-[11px] font-display font-bold text-board-critical bg-board-critical/10 px-2 py-0.5 rounded">
              局点
            </span>
          )}
          {match.isFinished && (
            <span className="text-[11px] font-display font-bold text-board-dim bg-board-border/50 px-2 py-0.5 rounded">
              比赛结束
            </span>
          )}
          <span className="text-[11px] text-board-dim font-body">
            第{match.currentGame}局
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-xs lg:text-base font-body font-semibold text-board-text mb-0.5">
            {match.player1.name}
          </p>
          <span className="text-[10px] lg:text-[11px] text-board-dim">{match.player1.country}</span>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 mx-2 lg:mx-6">
          <span className="text-3xl lg:text-5xl font-display font-bold text-board-text tabular-nums">
            {match.player1.score}
          </span>
          <div className="flex flex-col items-center">
            <span className="text-sm lg:text-lg text-board-muted font-body">:</span>
            <div className="flex items-center gap-0.5 mt-1">
              <CircleDot
                className={`w-3 h-3 ${
                  match.serving === 1 ? 'text-board-accent' : 'text-board-border'
                }`}
              />
              <CircleDot
                className={`w-3 h-3 ${
                  match.serving === 2 ? 'text-board-accent' : 'text-board-border'
                }`}
              />
            </div>
          </div>
          <span className="text-3xl lg:text-5xl font-display font-bold text-board-text tabular-nums">
            {match.player2.score}
          </span>
        </div>

        <div className="flex-1 text-center">
          <p className="text-xs lg:text-base font-body font-semibold text-board-text mb-0.5">
            {match.player2.name}
          </p>
          <span className="text-[10px] lg:text-[11px] text-board-dim">{match.player2.country}</span>
        </div>
      </div>
    </div>
  );
}
