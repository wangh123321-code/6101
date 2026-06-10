import type { MatchData } from '@/types/match';
import MatchHeader from './MatchHeader';
import GameScoreTable from './GameScoreTable';
import EventLog from './EventLog';
import RallyChart from './RallyChart';

interface SingleDetailViewProps {
  match: MatchData;
}

export default function SingleDetailView({ match }: SingleDetailViewProps) {
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
