'use client';

import { useEffect, useRef, useState } from 'react';

// Skills section — client component (viewport animation). Labels come in
// from the parent (server) so the dictionary can be resolved on the
// server side via the `x-locale` header.
//
// Percentages are the order in the chart — the user re-ordered the
// list in 2026-10 to project an AI-first focus (n8n on top, 95%;
// WordPress / Sales / Photoshop removed). Don't add a percent column
// to the dict; the shape is fixed here so the math stays boring.
type SkillsDict = {
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section bg-theme-5 overflow-hidden">
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
        <div className="space-y-4">
          {SKILLS.map((s) => (
            <SkillBar
              key={s.key}
              label={dict[s.key]}
              percent={s.percent}
              animate={inView}
            />
          ))}
        </div>
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
        <span className="text-sm font-medium text-secondary group-hover:text-accent transition-colors">
          {label}
        </span>
        <span className="text-sm text-text tabular-nums">{percent}%</span>
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