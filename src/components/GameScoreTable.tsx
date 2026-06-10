import type { MatchData } from '@/types/match';
import { CircleDot } from 'lucide-react';

interface GameScoreTableProps {
  match: MatchData;
}

export default function GameScoreTable({ match }: GameScoreTableProps) {
  const games = match.games;
  const p1GameWins = match.gameWins1;
  const p2GameWins = match.gameWins2;

  return (
    <div className="bg-board-surface rounded-lg border border-board-border p-2 lg:p-3">
      <h3 className="text-[10px] lg:text-xs font-body font-semibold text-board-dim uppercase tracking-wider mb-1.5 lg:mb-2">
        局分
      </h3>

      <div className="grid grid-cols-[1fr_repeat(7,32px)_1fr] lg:grid-cols-[1fr_repeat(7,40px)_1fr] gap-0.5 lg:gap-1 items-center text-center">
        <div className="text-left text-xs font-body font-semibold text-board-text truncate pr-1">
          {match.player1.name}
        </div>
        {games.map((g, i) => (
          <div
            key={i}
            className={`text-sm font-display font-bold tabular-nums rounded px-1 py-0.5 ${
              i === match.currentGame - 1 && !match.isFinished
                ? 'bg-board-accent/15 text-board-accent'
                : g.player1Score > g.player2Score
                  ? 'text-board-text'
                  : 'text-board-dim'
            }`}
          >
            {g.player1Score}
          </div>
        ))}
        {Array.from({ length: 7 - games.length }).map((_, i) => (
          <div key={`empty-p1-${i}`} className="text-sm font-display text-board-border">
            -
          </div>
        ))}
        <div className="text-right text-sm font-display font-bold text-board-text">
          {p1GameWins}
        </div>

        <div className="text-left text-xs font-body text-board-dim pr-1">局</div>
        {games.map((_, i) => (
          <div key={`label-${i}`} className="text-[10px] font-body text-board-dim">
            {i + 1}
          </div>
        ))}
        {Array.from({ length: 7 - games.length }).map((_, i) => (
          <div key={`empty-label-${i}`} className="text-[10px] font-body text-board-border">
            {games.length + i + 1}
          </div>
        ))}
        <div className="text-right text-[10px] font-body text-board-dim">胜</div>

        <div className="text-left text-xs font-body font-semibold text-board-text truncate pr-1">
          {match.player2.name}
        </div>
        {games.map((g, i) => (
          <div
            key={i}
            className={`text-sm font-display font-bold tabular-nums rounded px-1 py-0.5 ${
              i === match.currentGame - 1 && !match.isFinished
                ? 'bg-board-accent/15 text-board-accent'
                : g.player2Score > g.player1Score
                  ? 'text-board-text'
                  : 'text-board-dim'
            }`}
          >
            {g.player2Score}
          </div>
        ))}
        {Array.from({ length: 7 - games.length }).map((_, i) => (
          <div key={`empty-p2-${i}`} className="text-sm font-display text-board-border">
            -
          </div>
        ))}
        <div className="text-right text-sm font-display font-bold text-board-text">
          {p2GameWins}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-board-border/50">
        <CircleDot className="w-3 h-3 text-board-accent" />
        <span className="text-[11px] font-body text-board-dim">
          发球方：{match.serving === 1 ? match.player1.name : match.player2.name}
        </span>
      </div>
    </div>
  );
}
