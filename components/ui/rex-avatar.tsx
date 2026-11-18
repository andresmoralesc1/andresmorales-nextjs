'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export type RexEmotion = 'idle' | 'thinking' | 'question' | 'surprised';

interface RexAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  className?: string;
  animate?: boolean;
  isTalking?: boolean;
  emotion?: RexEmotion;
  variant?: 'v1' | 'v2' | 'anthracite';
}

const SIZE_MAP = {
  sm: {
    container: 'w-8 h-8 min-w-8 min-h-8',
    image: 40,
    emotionBadge: 'text-[9px] -top-1 -right-1 w-3.5 h-3.5',
  },
  md: {
    container: 'w-12 h-12 min-w-12 min-h-12',
    image: 56,
    emotionBadge: 'text-[11px] -top-1.5 -right-1.5 w-4.5 h-4.5',
  },
  lg: {
    container: 'w-16 h-16 min-w-16 min-h-16',
    image: 76,
    emotionBadge: 'text-xs -top-2 -right-2 w-5 h-5',
  },
  xl: {
    container: 'w-20 h-20 min-w-20 min-h-20',
    image: 96,
    emotionBadge: 'text-sm -top-2 -right-2 w-6 h-6',
  },
  '2xl': {
    container: 'w-24 h-24 min-w-24 min-h-24 sm:w-28 sm:h-28 sm:min-w-28 sm:min-h-28',
    image: 128,
    emotionBadge: 'text-base -top-2 -right-1 w-7 h-7',
  },
};

export function RexAvatar({
  size = 'md',
  showStatus = false,
  className = '',
  animate = true,
  isTalking = false,
  emotion = 'idle',
  variant = 'anthracite',
}: RexAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const dims = SIZE_MAP[size] || SIZE_MAP.md;

  // Selected mascot: Anthracite transparent PNG with emotional poses
  let imageSrc = '/rex-mascot-transparent.png';
  if (variant === 'anthracite') {
    switch (emotion) {
      case 'thinking':
        imageSrc = '/rex-pose-thinking.png';
        break;
      case 'question':
        imageSrc = '/rex-pose-question.png';
        break;
      case 'surprised':
        imageSrc = '/rex-pose-surprised.png';
        break;
      case 'idle':
      default:
        imageSrc = '/rex-mascot-transparent.png';
        break;
    }
  } else if (variant === 'v2') {
    imageSrc = '/rex-anime-v2-avatar.png';
  } else {
    imageSrc = '/rex-anime-v1-avatar.png';
  }

  // Determine current active animation class
  const getAnimationClass = () => {
    if (!animate) return '';
    if (isTalking) return 'rex-talking';
    switch (emotion) {
      case 'thinking':
        return 'rex-thinking';
      case 'question':
        return 'rex-question';
      case 'surprised':
        return 'rex-surprised';
      case 'idle':
      default:
        return 'rex-floating';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center group ${className}`}
    >
      {/* ── CSS Keyframes for Anime Living & Emotion Animations ── */}
      <style jsx>{`
        @keyframes rexAnimeFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1.5deg);
          }
        }
        @keyframes rexAnimeTalk {
          0%, 100% {
            transform: translateY(0px) scale(1.05);
          }
          25% {
            transform: translateY(-2px) scale(1.08) rotate(-1.5deg);
          }
          75% {
            transform: translateY(1px) scale(1.03) rotate(1.5deg);
          }
        }
        @keyframes rexAnimeThinking {
          0%, 100% {
            transform: translateY(0px) rotate(-5deg);
          }
          50% {
            transform: translateY(-3px) rotate(3deg) scale(1.04);
          }
        }
        @keyframes rexAnimeQuestion {
          0%, 100% {
            transform: rotate(10deg) translateY(0px);
          }
          50% {
            transform: rotate(14deg) translateY(-3px) scale(1.05);
          }
        }
        @keyframes rexAnimeSurprised {
          0%, 100% {
            transform: scale(1.1) translateY(-2px);
          }
          50% {
            transform: scale(1.18) translateY(-5px);
          }
        }
        @keyframes popInBadge {
          0% {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.2) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .rex-floating {
          animation: rexAnimeFloat 3.2s ease-in-out infinite;
        }
        .rex-talking {
          animation: rexAnimeTalk 0.45s ease-in-out infinite;
        }
        .rex-thinking {
          animation: rexAnimeThinking 2.2s ease-in-out infinite;
        }
        .rex-question {
          animation: rexAnimeQuestion 1.8s ease-in-out infinite;
        }
        .rex-surprised {
          animation: rexAnimeSurprised 0.6s ease-in-out infinite;
        }
        .rex-badge-pop {
          animation: popInBadge 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Mascot Container (Frameless & Transparent - No background box or green borders) */}
      <div
        className={`${dims.container} relative flex items-center justify-center transition-transform duration-300`}
      >
        {!hasError ? (
          <div
            className={`w-full h-full flex items-center justify-center select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] drop-shadow-[0_2px_8px_rgba(249,110,3,0.2)] ${getAnimationClass()}`}
          >
            <Image
              src={imageSrc}
              alt="Rex - Asistente IA Andrés Morales"
              width={dims.image}
              height={dims.image}
              className="w-full h-full object-contain object-center"
              onError={() => setHasError(true)}
              priority={size === 'lg' || size === 'xl' || size === '2xl'}
            />
          </div>
        ) : (
          /* SVG Dinosaur Fallback with Orange Tie */
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-black leading-none">🦖</span>
            <div className="w-2 h-2.5 bg-[#f96e03] rounded-xs -mt-0.5 shadow-sm" />
          </div>
        )}
      </div>

      {/* Dynamic Emotion Badge (Popping anime icon for thinking, question, surprised) */}
      {emotion !== 'idle' && (
        <span
          className={`absolute ${dims.emotionBadge} z-20 rounded-full flex items-center justify-center font-bold shadow-lg rex-badge-pop border ${
            emotion === 'thinking'
              ? 'bg-cyan-500 text-white border-cyan-300'
              : emotion === 'question'
              ? 'bg-[#f96e03] text-white border-amber-300'
              : 'bg-amber-400 text-zinc-900 border-white'
          }`}
        >
          {emotion === 'thinking' && '💭'}
          {emotion === 'question' && '?'}
          {emotion === 'surprised' && '✨'}
        </span>
      )}
    </div>
  );
}
