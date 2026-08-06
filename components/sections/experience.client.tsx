'use client';

import { useEffect, useRef, useState } from 'react';

type JobDict = {
  dates: string;
  role: string;
  company: string;
  desc: string;
};

type ExperienceDict = {
  eyebrow: string;
  subtitle: string;
  title: string;
  jobs: JobDict[]; // length 6 expected
};

function TimelineItem({
  job,
  index,
  isLeft,
}: {
  job: JobDict;
  index: number;
  isLeft: boolean;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Respecta prefers-reduced-motion: sin animación, items visibles desde el inicio
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setShouldAnimate(false);
      setIsVisible(true);
      return;
    }

    setShouldAnimate(true);
    setIsVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    // Safety net: si por algún motivo el observer no dispara (e.g. elemento ya
    // en viewport antes de montar), forzar visible tras 1.2s.
    const safety = window.setTimeout(() => setIsVisible(true), 1200);
    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <li
      ref={ref}
      className={`relative pl-8 md:pl-0 transition-all duration-700 ${
        shouldAnimate
          ? isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
          : 'opacity-100 translate-y-0'
      } ${
        isLeft
          ? 'md:pr-[calc(50%+1.5rem)] md:text-right'
          : 'md:pl-[calc(50%+1.5rem)]'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className="absolute left-0 md:left-1/2 top-2 -translate-x-1/2 z-10">
        <span className="block w-3 h-3 rounded-full bg-theme-1 ring-4 ring-theme-5" />
        <span className="absolute inset-0 w-3 h-3 rounded-full bg-theme-1 animate-ping opacity-75" />
      </span>

      <div
        className={`group relative bg-primary border border-theme-9 rounded-xl p-5 shadow-sm hover:shadow-xl hover:border-theme-1 hover:-translate-y-1 transition-all duration-300 ${
          isLeft ? 'md:hover:-translate-x-1' : 'md:hover:translate-x-1'
        }`}
      >
        <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
          <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-widest">
            {job.dates}
          </span>
          <span className="text-[10px] font-secondary font-bold text-text/80 uppercase tracking-wider">
            · #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="font-heading text-lg md:text-xl mb-1 text-secondary">{job.role}</h3>

        <div className={`text-sm font-secondary font-bold text-secondary mb-2 ${isLeft ? 'md:text-right' : ''}`}>
          {job.company}
        </div>

        {job.desc && (
          <p className="text-sm text-text leading-relaxed">{job.desc}</p>
        )}

        <span
          className={`absolute top-0 bottom-0 w-0.5 bg-theme-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isLeft ? 'right-0 md:-right-px' : 'left-0 md:-left-px'
          }`}
        />
      </div>
    </li>
  );
}

export function ExperienceClient({ dict }: { dict: ExperienceDict }) {
  return (
    <section className="section bg-theme-5">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
            {dict.eyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-3">{dict.title}</h2>
          <p className="text-text max-w-2xl mx-auto">{dict.subtitle}</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theme-9 to-transparent md:-translate-x-1/2" />

          <ul className="space-y-8 md:space-y-12">
            {dict.jobs.map((j, i) => (
              <TimelineItem key={i} job={j} index={i} isLeft={i % 2 === 0} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
