import { useRef, useEffect, useMemo } from 'react';
import type { RallyPoint } from '@/types/match';

interface RallyChartProps {
  rallyScores: RallyPoint[];
  player1Name: string;
  player2Name: string;
  replayMode?: boolean;
  replayClipType?: 'game_point' | 'match_point';
  triggerIndex?: number;
  currentStep?: number;
}

export default function RallyChart({
  rallyScores,
  player1Name,
  player2Name,
  replayMode = false,
  replayClipType,
  triggerIndex,
  currentStep,
}: RallyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRenderedStepRef = useRef(-1);
  const lastRenderedDataRef = useRef<string>('');

  const displayData = useMemo(() => {
    if (!replayMode || currentStep === undefined) return rallyScores;
    const step = Math.max(0, Math.min(currentStep, rallyScores.length - 1));
    return rallyScores.slice(0, step + 1);
  }, [rallyScores, replayMode, currentStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    let rect = setupCanvas();

    const pulsePhase = { value: 0 };

    const draw = (time?: number) => {
      if (time !== undefined) {
        pulsePhase.value = (Math.sin(time / 500) + 1) / 2;
      }

      rect = setupCanvas();
      const w = rect.width;
      const h = rect.height;
      const padding = { top: 20, right: 20, bottom: 28, left: 36 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      if (replayMode && replayClipType) {
        const alpha = replayClipType === 'match_point' ? 0.15 + pulsePhase.value * 0.15 : 0.08 + pulsePhase.value * 0.08;
        const color = replayClipType === 'match_point'
          ? `rgba(255, 45, 80, ${alpha})`
          : `rgba(255, 140, 50, ${alpha})`;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
      }

      if (rallyScores.length === 0) {
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Source Sans 3, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('等待比赛数据...', w / 2, h / 2);
        return;
      }

      const dataToRender = displayData;
      if (dataToRender.length === 0) return;

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

      if (replayMode && triggerIndex !== undefined) {
        const tx = toX(triggerIndex);
        const triggerColor = replayClipType === 'match_point' ? 'rgba(255, 45, 80, 0.35)' : 'rgba(255, 140, 50, 0.3)';
        ctx.fillStyle = triggerColor;
        ctx.fillRect(tx - 4, padding.top, 8, chartH);
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

      const drawLine = (data: number[], color: string, glowColor: string, maxIndex: number) => {
        const visibleCount = Math.min(data.length, maxIndex + 1);
        if (visibleCount < 2) return;

        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < visibleCount; i++) {
          const x = toX(i);
          const y = toY(data[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = color;
        for (let i = 0; i < visibleCount; i++) {
          const x = toX(i);
          const y = toY(data[i]);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const p1Data = rallyScores.map((r) => r.player1);
      const p2Data = rallyScores.map((r) => r.player2);
      const renderUpTo = replayMode && currentStep !== undefined
        ? currentStep
        : rallyScores.length - 1;

      drawLine(p1Data, '#00E5FF', 'rgba(0, 229, 255, 0.4)', renderUpTo);
      drawLine(p2Data, '#FF6B35', 'rgba(255, 107, 53, 0.4)', renderUpTo);

      if (replayMode && currentStep !== undefined && currentStep >= 0 && currentStep < rallyScores.length) {
        const hlX = toX(currentStep);
        const hlY1 = toY(p1Data[currentStep]);
        const hlY2 = toY(p2Data[currentStep]);

        ctx.save();
        const pulseSize = 8 + pulsePhase.value * 4;
        const ringColor = replayClipType === 'match_point'
          ? `rgba(255, 45, 80, ${0.5 + pulsePhase.value * 0.4})`
          : `rgba(255, 140, 50, ${0.5 + pulsePhase.value * 0.4})`;
        const dotColor = replayClipType === 'match_point' ? '#FF2D50' : '#FF8C32';

        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hlX, hlY1, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hlX, hlY2, pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(hlX, hlY1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hlX, hlY2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

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

      if (replayMode && replayClipType) {
        const badgeColor = replayClipType === 'match_point' ? '#FF2D50' : '#FF8C32';
        const badgeText = replayClipType === 'match_point' ? '赛点回放' : '局点回放';
        const badgeTextW = ctx.measureText(badgeText).width;
        const badgeW = badgeTextW + 16;
        const badgeX = w - badgeW - 10;
        const badgeY = 4;

        ctx.fillStyle = badgeColor;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, 16, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Source Sans 3, sans-serif';
        ctx.fillText(badgeText, badgeX + 8, badgeY + 11);
      }
    };

    const dataKey = `${JSON.stringify(rallyScores)}|${replayMode}|${replayClipType}|${triggerIndex}|${currentStep}`;

    if (replayMode) {
      const animate = (t: number) => {
        draw(t);
        rafRef.current = requestAnimationFrame(animate);
      };
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (lastRenderedDataRef.current !== dataKey || lastRenderedStepRef.current !== (currentStep ?? -1)) {
        draw();
        lastRenderedDataRef.current = dataKey;
        lastRenderedStepRef.current = currentStep ?? -1;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!replayMode) draw();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [rallyScores, displayData, replayMode, replayClipType, triggerIndex, currentStep]);

  const title = replayMode
    ? `关键球回放 - 共${rallyScores.length}回合`
    : '得分走势（近20回合）';

  return (
    <div className="bg-board-surface rounded-lg border border-board-border p-3">
      <h3 className="text-xs font-body font-semibold text-board-dim uppercase tracking-wider mb-2">
        {title}
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full h-[120px] lg:h-[220px] rounded"
      />
    </div>
  );
}
