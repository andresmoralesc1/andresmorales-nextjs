'use client';

import { useEffect, useRef, useState } from 'react';

// Skills section — client component (viewport animation). Labels come in
// from the parent (server) so the dictionary can be resolved on the
// server side via the `x-locale` header.
export type SkillsDict = {
  n8n: string;
  aiAgents: string;
  llmApis: string;
  make: string;
  nextReact: string;
  typescript: string;
  vercelCloudflare: string;
  postgresPrisma: string;
  python: string;
  dockerInfra: string;
};

export function SkillsBars({
  dict,
}: {
  dict: SkillsDict;
}) {
  const SKILLS: Array<{ key: keyof SkillsDict; percent: number }> = [
    { key: 'n8n', percent: 95 },
    { key: 'aiAgents', percent: 92 },
    { key: 'llmApis', percent: 90 },
    { key: 'make', percent: 85 },
    { key: 'nextReact', percent: 88 },
    { key: 'typescript', percent: 86 },
    { key: 'vercelCloudflare', percent: 82 },
    { key: 'postgresPrisma', percent: 80 },
    { key: 'python', percent: 78 },
    { key: 'dockerInfra', percent: 76 },
  ];

  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-3.5">
      {SKILLS.map((s) => (
        <SkillBar
          key={s.key}
          label={dict[s.key]}
          percent={s.percent}
          animate={inView}
        />
      ))}
    </div>
  );
}

export function SkillsClient({
  dict,
  eyebrow,
  title,
  subtitle,
  liveBadge,
}: {
  dict: SkillsDict;
  eyebrow: string;
  title: string;
  subtitle: string;
  liveBadge: string;
}) {
  return (
    <section className="section bg-theme-5 overflow-hidden">
      <div className="container-page grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
            {eyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-4">{title}</h2>
          <p className="text-text text-lg mb-6">{subtitle}</p>
          <div className="inline-flex items-center gap-2 text-sm text-text">
            <span className="w-3 h-3 rounded-full bg-theme-1 animate-pulse" />
            <span>{liveBadge}</span>
          </div>
        </div>
        <SkillsBars dict={dict} />
      </div>
    </section>
  );
}

function SkillBar({ label, percent, animate }: { label: string; percent: number; animate: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(t);
  }, [animate, percent]);
  return (
    <div className="group">
      <div className="flex justify-between mb-1">
        <span className="text-xs sm:text-sm font-medium text-secondary group-hover:text-accent transition-colors">
          {label}
        </span>
        <span className="text-xs sm:text-sm text-text tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-theme-9 overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-theme-2 to-theme-1 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${width}%` }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
