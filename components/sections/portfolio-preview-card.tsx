'use client';

import Image from 'next/image';
import { TrackLink } from '@/components/track';

// Portfolio preview cards — client component so we can fire
// `portfolio_project_clicked` events. Receives the projects array from the
// server component, renders them as a grid of outbound trackable links.
export function PortfolioPreviewClient({
  projects,
}: {
  projects: Array<{ title: string; image: string; href: string }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((p) => (
        <TrackLink
          key={p.title}
          href={p.href}
          event="portfolio_project_clicked"
          label={p.title.toLowerCase().replace(/\s+/g, '-')}
          className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-theme-9 block"
        >
          <Image
            src={p.image}
            alt={p.title}
            width={800}
            height={1000}
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={80}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 to-transparent flex items-end p-5">
            <span className="text-primary font-heading font-bold text-lg">
              {p.title}
            </span>
          </div>
        </TrackLink>
      ))}
    </div>
  );
}
