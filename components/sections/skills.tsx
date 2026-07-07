'use client';

import { useEffect, useRef, useState } from 'react';

// Home page skills section — barras que se ANIMAN cuando entran en viewport
const SKILLS = [
  { label: 'Sales', percent: 90 },
  { label: 'Web designer', percent: 85 },
  { label: 'UX Analyst', percent: 84 },
  { label: 'Wordpress', percent: 83 },
  { label: 'AI Agents', percent: 82 },
  { label: 'AI Automations', percent: 80 },
  { label: 'Customer Service', percent: 80 },
  { label: 'Prospecting', percent: 75 },
  { label: 'Digital Marketing', percent: 70 },
  { label: 'Photoshop', percent: 85 },
];

function SkillBar({ label, percent, animate }: { label: string; percent: number; animate: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    // Small staggered delay based on order — cascading effect
    const t = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(t);
  }, [animate, percent]);

  return (
    <div className="group">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-secondary group-hover:text-theme-1 transition-colors">
          {label}
        </span>
        <span className="text-sm text-text tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-theme-9 overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-theme-2 to-theme-1 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${width}%` }}
        >
          {/* Brillo en hover */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export function Skills() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // una sola vez
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
          <p className="text-xs uppercase tracking-widest text-theme-1 mb-3 font-secondary font-bold">
            Skills
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-4">
            Where my time has gone
          </h2>
          <p className="text-text text-lg mb-6">
            Over the last decade — and where I’m investing next. Each bar shows
            relative proficiency across the stack I use day to day.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-text">
            <span className="w-3 h-3 rounded-full bg-theme-1 animate-pulse" />
            <span>Live data — last updated this week</span>
          </div>
        </div>
        <div className="space-y-4">
          {SKILLS.map((s) => (
            <SkillBar
              key={s.label}
              label={s.label}
              percent={s.percent}
              animate={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}