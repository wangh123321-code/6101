import { useRef, useEffect } from 'react';
import type { RallyPoint } from '@/types/match';

interface RallyChartProps {
  rallyScores: RallyPoint[];
  player1Name: string;
  player2Name: string;
}

export default function RallyChart({ rallyScores, player1Name, player2Name }: RallyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 28, left: 36 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    if (rallyScores.length === 0) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Source Sans 3, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('等待比赛数据...', w / 2, h / 2);
      return;
    }

    const maxScore = Math.max(
      ...rallyScores.flatMap((r) => [r.player1, r.player2]),
      11
    );
    const yMax = Math.ceil(maxScore / 2) * 2 + 2;
    const n = rallyScores.length;

    const toX = (i: number) => padding.left + (i / Math.max(n - 1, 1)) * chartW;
    const toY = (v: number) => padding.top + chartH - (v / yMax) * chartH;

    ctx.strokeStyle = '#1A2332';
    ctx.lineWidth = 1;
    for (let v = 0; v <= yMax; v += 2) {
      const y = toY(v);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const y11 = toY(11);
    ctx.beginPath();
    ctx.moveTo(padding.left, y11);
    ctx.lineTo(w - padding.right, y11);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawLine = (data: number[], color: string, glowColor: string) => {
      if (data.length < 2) return;

      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = toX(i);
        const y = toY(data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = color;
      for (let i = 0; i < data.length; i++) {
        const x = toX(i);
        const y = toY(data[i]);
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawLine(
      rallyScores.map((r) => r.player1),
      '#00E5FF',
      'rgba(0, 229, 255, 0.4)'
    );
    drawLine(
      rallyScores.map((r) => r.player2),
      '#FF6B35',
      'rgba(255, 107, 53, 0.4)'
    );

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Source Sans 3, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 10))) {
      ctx.fillText(`${i + 1}`, toX(i), h - padding.bottom + 14);
    }

    ctx.textAlign = 'right';
    for (let v = 0; v <= yMax; v += 4) {
      ctx.fillText(`${v}`, padding.left - 6, toY(v) + 3);
    }

    ctx.font = '10px Source Sans 3, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(padding.left, 6, 8, 2);
    ctx.fillText(player1Name, padding.left + 12, 10);

    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(padding.left + 80, 6, 8, 2);
    ctx.fillText(player2Name, padding.left + 92, 10);
  }, [rallyScores, player1Name, player2Name]);

  return (
    <div className="bg-board-surface rounded-lg border border-board-border p-3">
      <h3 className="text-xs font-body font-semibold text-board-dim uppercase tracking-wider mb-2">
        得分走势（近20回合）
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full h-[120px] lg:h-[220px] rounded"
      />
    </div>
  );
}
