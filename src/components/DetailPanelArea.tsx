import { useMatchStore } from '@/store/matchStore';
import SingleDetailView from './SingleDetailView';
import { MonitorUp, X } from 'lucide-react';

export default function DetailPanelArea() {
  const { matches, selectedTableIds, splitMode, selectTable } = useMatchStore();

  if (selectedTableIds.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-board-bg">
        <MonitorUp className="w-12 h-12 text-board-border mb-3" />
        <p className="text-board-dim font-body text-sm">点击左侧球台查看比赛详情</p>
        <p className="text-board-border font-body text-xs mt-1">
          开启分屏模式可同时追踪两场比赛
        </p>
      </div>
    );
  }

  if (splitMode && selectedTableIds.length >= 2) {
    const [id1, id2] = selectedTableIds;
    const match1 = matches[id1];
    const match2 = matches[id2];

    return (
      <div className="flex-1 flex flex-col bg-board-bg">
        <div className="h-1/2 border-b border-board-border overflow-hidden relative">
          <div className="absolute top-1 left-2 z-10 flex items-center gap-1.5">
            <span className="text-[9px] font-display font-semibold text-board-accent bg-board-accent/10 px-1.5 py-0.5 rounded">
              A
            </span>
            <span className="text-[9px] text-board-dim font-body">
              {match1?.tableName || ''}
            </span>
          </div>
          <button
            className="absolute top-1 right-2 z-10 p-0.5 rounded text-board-dim hover:text-board-text hover:bg-board-card transition-colors"
            onClick={() => selectTable(id1)}
            title="关闭此面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {match1 ? (
            <SingleDetailView match={match1} />
          ) : (
            <div className="flex items-center justify-center h-full text-board-dim text-sm font-body">
              选择第二张球台
            </div>
          )}
        </div>
        <div className="h-1/2 overflow-hidden relative">
          <div className="absolute top-1 left-2 z-10 flex items-center gap-1.5">
            <span className="text-[9px] font-display font-semibold text-board-critical bg-board-critical/10 px-1.5 py-0.5 rounded">
              B
            </span>
            <span className="text-[9px] text-board-dim font-body">
              {match2?.tableName || ''}
            </span>
          </div>
          <button
            className="absolute top-1 right-2 z-10 p-0.5 rounded text-board-dim hover:text-board-text hover:bg-board-card transition-colors"
            onClick={() => selectTable(id2)}
            title="关闭此面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {match2 ? (
            <SingleDetailView match={match2} />
          ) : (
            <div className="flex items-center justify-center h-full text-board-dim text-sm font-body">
              选择第二张球台
            </div>
          )}
        </div>
      </div>
    );
  }

  const matchId = selectedTableIds[0];
  const match = matches[matchId];

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center bg-board-bg">
        <p className="text-board-dim font-body text-sm">比赛数据加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-board-bg overflow-hidden">
      <SingleDetailView match={match} />
    </div>
  );
}
