'use client';

import { useState } from 'react';

interface YoutubeEmbedProps {
  id: string; // YouTube video ID
  title: string;
  orientation?: 'landscape' | 'portrait';
  thumbnail?: string; // Optional override for the placeholder image
}

/**
 * Lazy YouTube embed with thumbnail placeholder.
 * - Uses youtube-nocookie.com (no tracking until user clicks play)
 * - Facade pattern: thumbnail + play button by default, full iframe on click
 * - Lighthouse-friendly: zero third-party scripts until interaction
 */
export function YoutubeEmbed({
  id,
  title,
  orientation = 'landscape',
}: YoutubeEmbedProps) {
  const [active, setActive] = useState(false);
  const aspect = orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video';

  // YouTube provides default thumbnails at these URLs.
  // hqdefault.jpg is the standard, mqdefault.jpg for smaller bandwith.
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  if (active) {
    return (
      <div className={`relative w-full ${aspect} rounded-xl overflow-hidden bg-black shadow-md`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className={`group relative w-full ${aspect} rounded-xl overflow-hidden bg-black shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-theme-1/40`}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={thumb}
        alt={`Thumbnail for ${title}`}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      {/* Subtle dark gradient overlay so the play button stands out */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-700 transition-all duration-300">
          <svg
            className="w-7 h-7 md:w-9 md:h-9 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {/* YouTube brand */}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-secondary font-bold uppercase tracking-wider">
        YouTube
      </div>
    </button>
  );
}
