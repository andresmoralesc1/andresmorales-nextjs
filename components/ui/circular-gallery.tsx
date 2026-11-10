'use client';

import React, { useState, useEffect, useRef, useCallback, HTMLAttributes } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RotateCcw, ExternalLink, Lock } from 'lucide-react';

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial?: string;
  category?: string;
  tags?: string[];
  href?: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by?: string;
  };
}

// Define the props for the CircularGallery component
export interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Speed of auto-advance (0 = disabled, user-driven) */
  autoRotateSpeed?: number;
  /** Allow mouse drag or touch swipe to navigate 3D stage */
  interactiveDrag?: boolean;
  /** Show bottom navigation arrows and indicators */
  showControls?: boolean;
  /** Custom label for byline / metric */
  byLabel?: string;
  /** Custom label for "View case" */
  viewCaseLabel?: string;
  /** Tooltip for previous button */
  rotateLeftTitle?: string;
  /** Tooltip for next button */
  rotateRightTitle?: string;
  /** Tooltip for reset button */
  resetRotationTitle?: string;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      autoRotateSpeed = 0,
      interactiveDrag = true,
      showControls = true,
      byLabel = 'Métrica',
      viewCaseLabel = 'Ver caso',
      rotateLeftTitle = 'Proyecto anterior',
      rotateRightTitle = 'Proyecto siguiente',
      resetRotationTitle = 'Volver al inicio',
      ...props
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dimensions, setDimensions] = useState({
      cardWidth: 780,
      cardHeight: 480,
      stageHeight: 630,
      perspective: 1600,
    });

    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const hasMovedRef = useRef(false);
    const dragOffsetRef = useRef(0);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const total = items.length;

    // Reset index if items list changes significantly
    useEffect(() => {
      if (activeIndex >= total) {
        setActiveIndex(0);
      }
    }, [total, activeIndex]);

    // Responsive dimensions: "1 página al tiempo GRANDOTA"
    useEffect(() => {
      const updateDimensions = () => {
        const w = window.innerWidth;

        let cardW = 780;
        let cardH = 480;
        let stageH = 630;
        let perspective = 1600;

        if (w < 640) {
          // Mobile: expansive card filling ~92vw
          cardW = Math.min(w - 32, 380);
          cardH = Math.round(cardW * 0.68);
          stageH = cardH + 130;
          perspective = 1100;
        } else if (w < 1024) {
          // Tablet
          cardW = Math.min(w - 64, 620);
          cardH = Math.round(cardW * 0.64);
          stageH = cardH + 140;
          perspective = 1400;
        } else {
          // Desktop: grand format showcase card
          cardW = Math.min(w - 180, 820);
          cardH = Math.round(cardW * 0.62);
          stageH = cardH + 150;
          perspective = 1600;
        }

        setDimensions({
          cardWidth: cardW,
          cardHeight: cardH,
          stageHeight: stageH,
          perspective,
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const goToPrev = useCallback(() => {
      if (total <= 1) return;
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const goToNext = useCallback(() => {
      if (total <= 1) return;
      setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const resetToFirst = useCallback(() => {
      setActiveIndex(0);
    }, []);

    // Keyboard navigation (Left / Right arrow keys)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        if (e.key === 'ArrowLeft') {
          goToPrev();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrev, goToNext]);

    // Optional subtle auto-advance if configured
    useEffect(() => {
      if (!autoRotateSpeed || autoRotateSpeed <= 0 || isDragging || total <= 1) return;
      const interval = setInterval(() => {
        goToNext();
      }, 7000);
      return () => clearInterval(interval);
    }, [autoRotateSpeed, isDragging, total, goToNext]);

    // Pointer Drag Handlers for 3D swipe/drag
    const handlePointerDown = (e: React.PointerEvent) => {
      if (!interactiveDrag || total <= 1) return;
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.clientX;
      dragOffsetRef.current = 0;
      setIsDragging(true);
      setDragOffset(0);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const currentDelta = e.clientX - startXRef.current;
      if (Math.abs(currentDelta) > 6) {
        hasMovedRef.current = true;
      }
      dragOffsetRef.current = currentDelta;
      setDragOffset(currentDelta);
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      const threshold = dimensions.cardWidth * 0.15;
      const finalOffset = dragOffsetRef.current;

      if (finalOffset > threshold) {
        goToPrev();
      } else if (finalOffset < -threshold) {
        goToNext();
      }

      setDragOffset(0);
      dragOffsetRef.current = 0;
    };

    const { cardWidth, cardHeight, stageHeight, perspective } = dimensions;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="3D Portfolio Spotlight Showcase"
        className={cn(
          'relative w-full flex flex-col items-center justify-center select-none overflow-hidden',
          interactiveDrag ? 'cursor-grab active:cursor-grabbing' : '',
          className
        )}
        style={{
          height: `${stageHeight}px`,
          perspective: `${perspective}px`,
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        {...props}
      >
        {/* Soft Ambient Glow matching site warmth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249, 110, 3, 0.08), transparent 75%)',
          }}
        />

        {/* Soft Side Fade Vignettes using the site's cream background */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#F8F5F4] via-[#F8F5F4]/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#F8F5F4] via-[#F8F5F4]/80 to-transparent pointer-events-none z-20" />

        {/* 3D Stage Container */}
        <div
          className="relative w-full flex items-center justify-center pointer-events-none"
          style={{
            height: `${cardHeight}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {items.map((item, i) => {
            // Calculate shortest cyclic difference from activeIndex
            let diff = i - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            // Combine with fractional drag offset during gesture
            const dragRatio = isDragging && cardWidth > 0 ? dragOffset / cardWidth : 0;
            const d = diff + dragRatio;
            const absD = Math.abs(d);

            // Visibility filter: only active and immediate neighbors are drawn
            if (absD > 2.2) {
              return null;
            }

            const isCenter = absD < 0.25;
            const isNeighbor = !isCenter && absD <= 1.25;

            // 3D positioning:
            // Center is at X = 0, Z = 0, flat.
            // Neighbors are angled back in 3D (-30deg / +30deg), pushed back in Z (-180px),
            // and tucked neatly on the flanks without intersecting the center.
            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1.0;
            let opacity = 1.0;
            let zIndex = 30;

            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const flankSpacing = cardWidth * (isMobile ? 0.58 : 0.54) + (isMobile ? 18 : 42);
            const maxAngle = isMobile ? 24 : 32;

            if (d > 0) {
              translateX = Math.min(d, 2.2) * flankSpacing;
              translateZ = -Math.min(d, 2) * 190;
              rotateY = -Math.min(d, 1) * maxAngle;
              scale = Math.max(0.78, 1.0 - Math.min(d, 2) * 0.12);
              opacity = Math.max(0, 1.0 - Math.min(d, 2) * 0.52);
              zIndex = Math.round(30 - Math.min(d, 2) * 10);
            } else if (d < 0) {
              translateX = Math.max(d, -2.2) * flankSpacing;
              translateZ = -Math.min(-d, 2) * 190;
              rotateY = Math.min(-d, 1) * maxAngle;
              scale = Math.max(0.78, 1.0 - Math.min(-d, 2) * 0.12);
              opacity = Math.max(0, 1.0 - Math.min(-d, 2) * 0.52);
              zIndex = Math.round(30 - Math.min(-d, 2) * 10);
            }

            // Extract domain preview for the browser mockup URL bar
            const domainDisplay = item.href
              ? item.href.replace(/^https?:\/\//, '').replace(/\/$/, '')
              : `${item.common.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

            const cardInner = (
              <div
                className={cn(
                  'relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden flex flex-col bg-primary transition-all duration-300',
                  isCenter
                    ? 'border-2 border-[#f96e03] shadow-[0_25px_60px_-12px_rgba(249,110,3,0.28),0_10px_25px_-5px_rgba(30,24,16,0.12)] ring-2 ring-[#f96e03]/25'
                    : 'border border-theme-9 shadow-[0_15px_35px_-8px_rgba(30,24,16,0.12)] hover:border-theme-1'
                )}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Browser Top Window Bar (Clean Site Palette) */}
                <div className="bg-[#FAF7F2] border-b border-theme-9 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 shrink-0">
                  {/* macOS traffic dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/40" />
                  </div>

                  {/* Browser URL Bar Capsule */}
                  <div className="flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-white border border-theme-9 text-[10px] sm:text-[11px] font-mono text-secondary/75 shadow-xs max-w-[200px] sm:max-w-xs md:max-w-sm truncate">
                    <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{domainDisplay}</span>
                  </div>

                  {/* Category Badge & Link Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.category && (
                      <span className="text-[9px] uppercase tracking-wider font-secondary font-bold px-2 py-0.5 rounded-full bg-[#f96e03]/10 text-secondary border border-[#f96e03]/30">
                        {item.category}
                      </span>
                    )}
                    {item.href && isCenter && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-secondary font-bold px-3 py-1 rounded-full bg-[#f96e03] text-stone-950 hover:bg-[#ff5100] transition-colors shadow-xs">
                        <span>{viewCaseLabel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Big Website Screenshot */}
                <div className="relative w-full flex-1 overflow-hidden bg-stone-900 group">
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
                    loading="lazy"
                  />

                  {/* Bottom Info Bar Overlay (High-legibility Frosted Glass) */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-5 bg-gradient-to-t from-stone-950/95 via-stone-950/80 to-transparent text-white pt-8 sm:pt-12">
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base sm:text-xl md:text-2xl font-heading font-bold text-white truncate drop-shadow-sm">
                            {item.common}
                          </h3>
                          {item.photo.by && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f96e03]/25 border border-[#f96e03]/50 text-[10px] sm:text-xs text-[#f96e03] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f96e03] animate-pulse" />
                              <span className="truncate">{item.photo.by}</span>
                            </span>
                          )}
                        </div>

                        {item.binomial && (
                          <p className="text-xs sm:text-sm text-stone-300 line-clamp-1 mb-2">
                            {item.binomial}
                          </p>
                        )}

                        {/* Tech tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md bg-white/15 text-stone-200 border border-white/10 backdrop-blur-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mobile View Case CTA */}
                      {item.href && isCenter && (
                        <div className="sm:hidden shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] font-secondary font-bold px-3 py-1.5 rounded-full bg-[#f96e03] text-stone-950 shadow-md">
                            <span>{viewCaseLabel}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={item.photo.url + '-' + i}
                role="group"
                aria-label={item.common}
                className="absolute"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${cardHeight / 2}px`,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  pointerEvents: isCenter || isNeighbor ? 'auto' : 'none',
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease',
                }}
              >
                {/* Clicking neighbor card rotates it to center; clicking center card navigates */}
                {!isCenter ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className="w-full h-full text-left cursor-pointer focus:outline-none rounded-2xl"
                    aria-label={`Ver ${item.common}`}
                  >
                    {cardInner}
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f96e03] rounded-2xl md:rounded-3xl"
                    onClick={(e) => {
                      if (hasMovedRef.current) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {cardInner}
                  </Link>
                ) : (
                  cardInner
                )}
              </div>
            );
          })}
        </div>

        {/* Clean Floating Controls in Site Palette */}
        {showControls && total > 1 && (
          <div className="relative z-30 mt-6 sm:mt-8 flex items-center gap-3 bg-primary border border-theme-9 px-4 py-2 rounded-full shadow-sm">
            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="p-1.5 rounded-full hover:bg-theme-5 text-secondary hover:text-accent border border-transparent hover:border-theme-9 transition-all cursor-pointer"
              aria-label={rotateLeftTitle}
              title={rotateLeftTitle}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Counter */}
            <span className="text-xs sm:text-sm font-mono font-bold text-secondary px-2">
              <span className="text-[#f96e03] font-bold">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              {' / '}
              <span className="text-secondary/70">{String(total).padStart(2, '0')}</span>
            </span>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="p-1.5 rounded-full hover:bg-theme-5 text-secondary hover:text-accent border border-transparent hover:border-theme-9 transition-all cursor-pointer"
              aria-label={rotateRightTitle}
              title={rotateRightTitle}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="w-px h-4 bg-theme-9 mx-0.5" />

            {/* Reset / First Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetToFirst();
              }}
              className="p-1.5 rounded-full hover:bg-theme-5 text-secondary/60 hover:text-accent transition-all cursor-pointer"
              aria-label={resetRotationTitle}
              title={resetRotationTitle}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pagination Dots indicator */}
        {total > 1 && total <= 20 && (
          <div className="relative z-30 mt-3 flex items-center gap-1.5 flex-wrap justify-center px-4">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActiveIndex(dotIdx)}
                className={cn(
                  'transition-all duration-300 rounded-full cursor-pointer',
                  dotIdx === activeIndex
                    ? 'w-5 h-1.5 bg-[#f96e03]'
                    : 'w-1.5 h-1.5 bg-secondary/20 hover:bg-secondary/40'
                )}
                aria-label={`Ir al proyecto ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
