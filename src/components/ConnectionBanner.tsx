import { useMatchStore } from '@/store/matchStore';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionBanner() {
  const { wsState, setWsState } = useMatchStore();

  if (!wsState.showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600/95 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-3 text-white font-body text-sm shadow-lg shadow-red-900/30">
      <WifiOff className="w-4 h-4" />
      <span>连接已断开，正在尝试重连...</span>
      {wsState.reconnecting && <RefreshCw className="w-4 h-4 animate-spin" />}
      <button
        className="ml-2 px-3 py-0.5 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
        onClick={() => setWsState({ showBanner: false })}
      >
        关闭
      </button>
    </div>
  );
}
