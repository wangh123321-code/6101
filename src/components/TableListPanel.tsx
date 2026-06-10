import { useMatchStore } from '@/store/matchStore';
import TableCard from './TableCard';
import { Columns2 } from 'lucide-react';

export default function TableListPanel() {
  const { matches, splitMode, toggleSplitMode } = useMatchStore();
  const matchList = Object.values(matches).sort((a, b) => a.tableId - b.tableId);

  return (
    <div className="w-[220px] lg:w-[320px] h-full bg-board-surface border-r border-board-border flex flex-col shrink-0">
      <div className="p-2 lg:p-3 border-b border-board-border flex items-center justify-between">
        <h1 className="font-display text-sm lg:text-lg font-semibold text-board-text tracking-wide">
          世乒赛赛况
        </h1>
        <button
          className={`p-1.5 rounded-md transition-colors ${
            splitMode
              ? 'bg-board-accent/20 text-board-accent'
              : 'text-board-dim hover:text-board-text hover:bg-board-card'
          }`}
          onClick={toggleSplitMode}
          title={splitMode ? '退出分屏' : '分屏模式'}
        >
          <Columns2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 lg:p-2 space-y-1.5 lg:space-y-2">
        {matchList.map((match) => (
          <TableCard key={match.tableId} match={match} />
        ))}
      </div>

      <div className="p-1.5 lg:p-2 border-t border-board-border">
        <div className="flex items-center justify-between text-[9px] lg:text-[10px] text-board-dim font-body px-1">
          <span>分屏模式: {splitMode ? '开' : '关'}</span>
          <span>选择球台查看详情</span>
        </div>
      </div>
    </div>
  );
}
