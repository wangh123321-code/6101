import ScoreboardLayout from '@/components/ScoreboardLayout';
import ConnectionBanner from '@/components/ConnectionBanner';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  useWebSocket();

  return (
    <div className="h-full w-full bg-board-bg overflow-hidden">
      <ConnectionBanner />
      <ScoreboardLayout />
    </div>
  );
}
