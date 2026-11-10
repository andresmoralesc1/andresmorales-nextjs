'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  lang: string;
  items: FaqItem[];
  title?: string;
  subtitle?: string;
};

export function PortfolioFaq({ lang, items, title, subtitle }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="section bg-theme-5 scroll-mt-20 border-t border-theme-9/60">
      <div className="container-page max-w-4xl">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-1/15 border border-theme-1/30 text-xs font-secondary font-bold text-secondary mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>
              {lang === 'en'
                ? 'Frequently Asked Questions'
                : lang === 'pt'
                ? 'Perguntas Frequentes'
                : 'Preguntas Frecuentes'}
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl mb-3 text-secondary">
            {title || (lang === 'en'
              ? 'Everything you need to know about working together'
              : lang === 'pt'
              ? 'Tudo o que você precisa saber sobre o processo'
              : 'Todo lo que necesitas saber antes de empezar')}
          </h2>
          <p className="text-text text-sm md:text-base leading-relaxed">
            {subtitle || (lang === 'en'
              ? 'Clarity upfront on timelines, ROI, integration with your stack, and intellectual property.'
              : lang === 'pt'
              ? 'Clareza total sobre prazos, ROI, integração com suas ferramentas e código 100% seu.'
              : 'Claridad total sobre tiempos, ROI, integración con tus herramientas y código 100% tuyo.')}
          </p>
        </div>

        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-primary border border-theme-9 rounded-2xl overflow-hidden shadow-xs hover:border-theme-1/50 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1"
                >
                  <span className="font-heading text-base sm:text-lg text-secondary font-bold">
                    {item.question}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full bg-theme-5 flex items-center justify-center shrink-0 text-secondary transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-theme-1 text-secondary' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-text leading-relaxed border-t border-theme-9/40 animate-in fade-in duration-200">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
