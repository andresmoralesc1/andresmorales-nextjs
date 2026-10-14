'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, Smartphone, MoveHorizontal } from 'lucide-react';

interface SneakerBeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  lang?: string;
}

export function SneakerBeforeAfterSlider({
  beforeImage = '/sneakers/ai-pipeline/1-raw-mobile-web.jpg',
  afterImage = '/sneakers/ai-pipeline/2-ai-studio-web.jpg',
  beforeLabel,
  afterLabel,
  lang = 'es',
}: SneakerBeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const resolvedBeforeLabel =
    beforeLabel ||
    (isEs
      ? 'Foto con Celular en Bodega'
      : isPt
        ? 'Foto no Celular'
        : 'Smartphone Photo in Warehouse');

  const resolvedAfterLabel =
    afterLabel ||
    (isEs
      ? 'Estudio Publicitario 4K (IA Nanobanana)'
      : isPt
        ? 'Estúdio Publicitário 4K (IA)'
        : '4K Commercial Studio (AI Nanobanana)');

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="rounded-3xl bg-white/5 border border-white/15 p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-theme-1 animate-pulse" />
            <h4 className="font-heading text-lg sm:text-xl font-bold text-primary">
              {isEs
                ? 'Comparador Interactivo Antes y Después'
                : isPt
                  ? 'Comparador Interativo Antes e Depois'
                  : 'Interactive Before & After Comparison'}
            </h4>
          </div>
          <p className="text-xs text-primary/70 mt-0.5">
            {isEs
              ? 'Arrastra el deslizador lateral para ver cómo la Inteligencia Artificial transforma la toma casera.'
              : isPt
                ? 'Arraste o controle para ver como a Inteligência Artificial transforma a foto caseira.'
                : 'Drag the slider to see how Generative AI transforms the smartphone photo into studio quality.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-mono text-primary/80 border border-white/15 shrink-0 self-start sm:self-auto">
          <MoveHorizontal className="w-3.5 h-3.5 text-theme-1" />
          <span>
            {isEs ? 'Desliza para comparar' : isPt ? 'Arraste para comparar' : 'Slide to compare'}
          </span>
        </div>
      </div>

      {/* Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-4/3 sm:aspect-16/10 md:aspect-16/9 w-full rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/15 shadow-xl bg-black"
      >
        {/* After Image (Background - Clean AI Studio) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={afterImage}
            alt={resolvedAfterLabel}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover pointer-events-none"
            priority
          />
          {/* Label Right (After) */}
          <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-theme-1 border border-theme-1/40 flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{resolvedAfterLabel}</span>
          </div>
        </div>

        {/* Before Image (Foreground - Raw Phone Photo) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeImage}
            alt={resolvedBeforeLabel}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          {/* Label Left (Before) */}
          <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-white/90 border border-white/20 flex items-center gap-1.5 shadow-md">
            <Smartphone className="w-3.5 h-3.5 text-theme-1" />
            <span>{resolvedBeforeLabel}</span>
          </div>
        </div>

        {/* Draggable Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-secondary border-2 border-theme-1 shadow-2xl flex items-center justify-center text-primary pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
            <MoveHorizontal className="w-5 h-5 text-theme-1" />
          </div>
        </div>

        {/* Accessible Range Input */}
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
          aria-label={
            isEs
              ? 'Deslizador de comparación de imagen antes y después'
              : isPt
                ? 'Controle de comparação de imagem antes e depois'
                : 'Before and after image comparison slider'
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-primary/60 px-1">
        <span>
          {isEs
            ? '⬅ Foto original casera'
            : isPt
              ? '⬅ Foto original no celular'
              : '⬅ Raw phone photo'}
        </span>
        <span className="text-theme-1 font-bold">
          ● {isEs ? 'Posición: ' : isPt ? 'Posição: ' : 'Position: '}
          {Math.round(sliderPosition)}%
        </span>
        <span>
          {isEs
            ? 'Render publicitario 4K ➡'
            : isPt
              ? 'Render publicitário 4K ➡'
              : '4K ad render ➡'}
        </span>
      </div>
    </div>
  );
}
