'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type Props = {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeTag?: string;
  afterTag?: string;
};

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Antes: 90 min manual',
  afterLabel = 'Después: 15 min con IA',
  beforeTag = 'Proceso Lento & Manual',
  afterTag = 'Flujo n8n & OpenAI',
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative aspect-video w-full rounded-2xl overflow-hidden border border-theme-9 select-none cursor-ew-resize shadow-md"
    >
      {/* After Image (Full background) */}
      <Image
        src={afterImage}
        alt={afterLabel}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute top-3 right-3 z-10 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-xs shadow-md">
        {afterTag} • {afterLabel}
      </div>

      {/* Before Image (Clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full min-w-full">
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="absolute top-3 left-3 z-10 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-secondary/90 text-primary backdrop-blur-xs shadow-md">
          {beforeTag} • {beforeLabel}
        </div>
      </div>

      {/* Slider Divider Line & Thumb */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] -ml-0.5"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-theme-1 border-2 border-white shadow-xl flex items-center justify-center text-secondary font-bold text-xs">
          ↔
        </div>
      </div>
    </div>
  );
}
