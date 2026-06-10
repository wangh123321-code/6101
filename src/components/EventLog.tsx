import type { MatchEvent } from '@/types/match';
import { Timer, AlertTriangle, Trophy, Target } from 'lucide-react';

interface EventLogProps {
  events: MatchEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  timeout: <Timer className="w-3 h-3 text-yellow-400" />,
  challenge: <AlertTriangle className="w-3 h-3 text-orange-400" />,
  game_win: <Trophy className="w-3 h-3 text-board-accent" />,
  match_win: <Trophy className="w-3 h-3 text-board-critical" />,
  point: <Target className="w-3 h-3 text-board-dim" />,
};

export default function EventLog({ events }: EventLogProps) {
  const recentEvents = events.slice(-15);

  if (recentEvents.length === 0) {
    return (
      <div className="bg-board-surface rounded-lg border border-board-border p-3">
        <h3 className="text-xs font-body font-semibold text-board-dim uppercase tracking-wider mb-2">
          事件记录
        </h3>
        <p className="text-xs text-board-dim text-center py-2">暂无事件</p>
      </div>
    );
  }

  return (
    <div className="bg-board-surface rounded-lg border border-board-border p-3">
      <h3 className="text-xs font-body font-semibold text-board-dim uppercase tracking-wider mb-2">
        事件记录
      </h3>
      <div className="space-y-1 max-h-[100px] lg:max-h-[140px] overflow-y-auto">
        {recentEvents.map((event, i) => {
          const time = new Date(event.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={i}
              className="flex items-center gap-2 py-1 px-2 rounded bg-board-card/50 text-xs"
            >
              <span className="shrink-0">{EVENT_ICONS[event.type]}</span>
              <span className="text-board-dim tabular-nums shrink-0">{time}</span>
              <span className="text-board-text font-body truncate">
                {event.detail ||
                  (event.type === 'point'
                    ? `得分`
                    : event.type === 'timeout'
                      ? '暂停'
                      : event.type === 'challenge'
                        ? '挑战'
                        : event.type)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
