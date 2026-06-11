import type { MatchData } from '@/types/match';
import { useMatchStore } from '@/store/matchStore';
import MatchHeader from './MatchHeader';
import GameScoreTable from './GameScoreTable';
import EventLog from './EventLog';
import RallyChart from './RallyChart';
import ReplayControls from './ReplayControls';
import { ArrowLeftRight } from 'lucide-react';

interface SingleDetailViewProps {
  match: MatchData;
}

export default function SingleDetailView({ match }: SingleDetailViewProps) {
  const { replay } = useMatchStore();
  const isReplayMode = replay.isReplayMode && replay.activeTableId === match.tableId;

  if (isReplayMode && replay.currentClip) {
    const clip = replay.currentClip;
    return (
      <div className="h-full overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3">
        <MatchHeader match={match} />

        <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-gradient-to-r from-board-surface via-board-card to-board-surface border border-board-border">
          <ArrowLeftRight className="w-4 h-4 text-board-accent animate-pulse" />
          <span className="text-xs font-display font-bold text-board-text">
            回放模式
          </span>
          <span className="text-[10px] font-body text-board-muted">
            · 第{clip.gameNumber}局关键球
          </span>
          <span className={`ml-auto text-[10px] font-display font-bold px-2 py-0.5 rounded ${
            clip.type === 'match_point'
              ? 'bg-board-critical/20 text-board-critical'
              : 'bg-orange-500/15 text-orange-400'
          }`}>
            {clip.type === 'match_point' ? '赛点回放' : '局点回放'}
          </span>
        </div>

        <RallyChart
          rallyScores={clip.rallyScores}
          player1Name={match.player1.name}
          player2Name={match.player2.name}
          replayMode={true}
          replayClipType={clip.type}
          triggerIndex={clip.triggerIndex}
          currentStep={replay.currentStep}
        />

        <ReplayControls tableId={match.tableId} />

        <GameScoreTable match={match} />
        <EventLog events={match.events} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3">
      <MatchHeader match={match} />
      <GameScoreTable match={match} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <EventLog events={match.events} />
        <RallyChart
          rallyScores={match.rallyScores}
          player1Name={match.player1.name}
          player2Name={match.player2.name}
        />
      </div>
    </div>
  );
}
