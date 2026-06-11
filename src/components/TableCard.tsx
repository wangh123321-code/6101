import type { MatchData } from '@/types/match';
import { useMatchStore } from '@/store/matchStore';
import { Radio, PlayCircle } from 'lucide-react';

interface TableCardProps {
  match: MatchData;
}

export default function TableCard({ match }: TableCardProps) {
  const { selectedTableIds, selectTable, replay, enterReplayMode } = useMatchStore();
  const isSelected = selectedTableIds.includes(match.tableId);
  const clips = replay.clipsByTable[match.tableId] ?? [];
  const hasClips = clips.length > 0;

  const criticalClass =
    match.isMatchPoint
      ? 'animate-pulse_match border-board-critical'
      : match.isGamePoint
        ? 'animate-pulse_critical border-board-critical/70'
        : 'border-board-border';

  const selectedClass = isSelected ? 'ring-2 ring-board-accent' : '';

  return (
    <button
      className={`w-full p-2 lg:p-3 bg-board-card rounded-lg border-2 ${criticalClass} ${selectedClass} 
        hover:bg-board-surface transition-all duration-200 text-left group`}
      onClick={() => selectTable(match.tableId)}
    >
      <div className="flex items-center gap-1 lg:gap-1.5 mb-1 lg:mb-2">
        <Radio className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-board-accent" />
        <span className="text-[10px] lg:text-xs font-body font-semibold text-board-accent tracking-wide uppercase">
          {match.tableName}
        </span>
        {match.isMatchPoint && (
          <span className="ml-auto text-[10px] font-display font-bold text-board-critical bg-board-critical/20 px-1.5 py-0.5 rounded">
            赛点
          </span>
        )}
        {match.isGamePoint && !match.isMatchPoint && (
          <span className="ml-auto text-[10px] font-display font-bold text-board-critical bg-board-critical/10 px-1.5 py-0.5 rounded">
            局点
          </span>
        )}
        {match.isFinished && (
          <span className="ml-auto text-[10px] font-display font-bold text-board-dim bg-board-border/50 px-1.5 py-0.5 rounded">
            已结束
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-1 lg:mb-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] lg:text-xs font-body text-board-text truncate group-hover:text-board-accent transition-colors">
            {match.player1.name}
          </p>
          <span className="text-[9px] lg:text-[10px] text-board-dim">{match.player1.country}</span>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2 mx-1 lg:mx-2">
          <span className="text-xl lg:text-3xl font-display font-bold text-board-text tabular-nums">
            {match.player1.score}
          </span>
          <span className="text-[10px] lg:text-xs font-body text-board-muted">:</span>
          <span className="text-xl lg:text-3xl font-display font-bold text-board-text tabular-nums">
            {match.player2.score}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-[10px] lg:text-xs font-body text-board-text truncate group-hover:text-board-accent transition-colors">
            {match.player2.name}
          </p>
          <span className="text-[9px] lg:text-[10px] text-board-dim">{match.player2.country}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 text-[10px] text-board-dim font-body">
        {match.games.map((g, i) => (
          <span key={i} className="tabular-nums">
            {g.player1Score}-{g.player2Score}
            {i < match.games.length - 1 && <span className="mx-0.5">·</span>}
          </span>
        ))}
      </div>

      <div className="mt-1.5 lg:mt-2 flex items-center justify-between">
        <span className="text-[9px] text-board-muted font-body">
          {hasClips ? `${clips.length} 条关键球` : ''}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasClips) {
              enterReplayMode(match.tableId, clips[clips.length - 1].id);
            }
          }}
          disabled={!hasClips}
          className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-[9px] font-display font-semibold transition-all
            ${hasClips
              ? 'bg-board-accent/15 text-board-accent hover:bg-board-accent/25 hover:shadow-[0_0_8px_rgba(0,229,255,0.3)]'
              : 'bg-board-border/30 text-board-border/50 cursor-not-allowed'
            }`}
          title={hasClips ? '回放关键球' : '暂无关键球'}
        >
          <PlayCircle className="w-3 h-3" />
          回放
        </button>
      </div>
    </button>
  );
}
