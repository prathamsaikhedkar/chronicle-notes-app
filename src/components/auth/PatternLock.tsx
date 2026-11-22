import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface PatternLockProps {
  onComplete: (patternStr: string) => void;
  title?: string;
  subtitle?: string;
  error?: string;
  isSettingUp?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const PatternLock: React.FC<PatternLockProps> = ({
  onComplete,
  title = 'Gesture Pattern',
  subtitle = 'Connect 4 or more nodes in sequence',
  error,
  isSettingUp = false,
}) => {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentCoord, setCurrentCoord] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dotCoords: Point[] = [
    { x: 16.6, y: 16.6 }, { x: 50, y: 16.6 }, { x: 83.3, y: 16.6 },
    { x: 16.6, y: 50 },   { x: 50, y: 50 },   { x: 83.3, y: 50 },
    { x: 16.6, y: 83.3 }, { x: 50, y: 83.3 }, { x: 83.3, y: 83.3 },
  ];

  const getDotFromEvent = (e: MouseEvent | TouchEvent): number | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const xPercent = ((clientX - rect.left) / rect.width) * 100;
    const yPercent = ((clientY - rect.top) / rect.height) * 100;

    for (let i = 0; i < dotCoords.length; i++) {
      const dx = dotCoords[i].x - xPercent;
      const dy = dotCoords[i].y - yPercent;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 13) {
        return i;
      }
    }
    return null;
  };

  const handlePointerDown = (index: number) => {
    setIsDrawing(true);
    setSelectedDots([index]);
  };

  const finishGesture = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentCoord(null);
    if (selectedDots.length >= 4) {
      onComplete(selectedDots.join('-'));
    }
  }, [isDrawing, selectedDots, onComplete]);

  const resetPattern = () => {
    setSelectedDots([]);
    setIsDrawing(false);
    setCurrentCoord(null);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setCurrentCoord({ x, y });

      const hitDot = getDotFromEvent(e);
      if (hitDot !== null && !selectedDots.includes(hitDot)) {
        setSelectedDots((prev) => [...prev, hitDot]);
      }
    };

    const handleUp = () => {
      finishGesture();
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDrawing, selectedDots, finishGesture]);

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-xs mx-auto select-none">
      <div className="text-center mb-5">
        <h3 className="font-editorial text-xl font-light text-stone-100 tracking-wide">{title}</h3>
        <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-1.5 mb-4 text-center">
          {error}
        </div>
      )}

      {/* Grid Canvas */}
      <div
        ref={containerRef}
        className="relative w-64 h-64 bg-stone-900/90 border border-stone-800 rounded-3xl p-3 shadow-inner touch-none overflow-hidden"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {selectedDots.map((dotIdx, idx) => {
            if (idx === 0) return null;
            const prevDot = dotCoords[selectedDots[idx - 1]];
            const currDot = dotCoords[dotIdx];
            return (
              <line
                key={`line-${idx}`}
                x1={`${prevDot.x}%`}
                y1={`${prevDot.y}%`}
                x2={`${currDot.x}%`}
                y2={`${currDot.y}%`}
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />
            );
          })}

          {isDrawing && currentCoord && selectedDots.length > 0 && (
            <line
              x1={`${dotCoords[selectedDots[selectedDots.length - 1]].x}%`}
              y1={`${dotCoords[selectedDots[selectedDots.length - 1]].y}%`}
              x2={`${currentCoord.x}%`}
              y2={`${currentCoord.y}%`}
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}
        </svg>

        {dotCoords.map((coord, idx) => {
          const isSelected = selectedDots.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onMouseDown={() => handlePointerDown(idx)}
              onTouchStart={() => handlePointerDown(idx)}
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-transform"
              aria-label={`Node ${idx + 1}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-400 scale-125 shadow-[0_0_12px_rgba(251,191,36,0.8)] ring-4 ring-amber-500/20'
                    : 'bg-stone-700 hover:bg-stone-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between w-full mt-4 px-2">
        <button
          type="button"
          onClick={resetPattern}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset gesture</span>
        </button>

        <span className="text-xs font-mono-code text-stone-500">
          {selectedDots.length}/9 nodes
        </span>
      </div>

      {isSettingUp && (
        <button
          type="button"
          disabled={selectedDots.length < 4}
          onClick={finishGesture}
          className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:pointer-events-none text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
        >
          Save Gesture Pattern
        </button>
      )}
    </div>
  );
};
