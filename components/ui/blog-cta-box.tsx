import { TrackLink } from '@/components/track';

interface BlogCtaBoxProps {
  lang: 'es' | 'en' | 'pt';
}

export function BlogCtaBox({ lang }: BlogCtaBoxProps) {
  const content = {
    es: {
      badge: 'CONSULTORÍA & ARQUITECTURA',
      title: '¿Quieres automatizar tu operación o acelerar tu producto digital?',
      desc: 'Diseño pipelines con IA, modernizo stacks en Next.js y blindo servidores con cero fricción técnica. Hablemos de números y arquitectura.',
      cta: 'Agendar llamada técnica de 30 min gratis',
      subCta: 'o escríbeme directamente por',
      roiBtn: 'Probar calculadora de ROI',
    },
    en: {
      badge: 'CONSULTING & ARCHITECTURE',
      title: 'Need to automate your business operations or ship high-velocity web products?',
      desc: 'I architect AI pipelines, modernize stacks with Next.js, and harden Linux infrastructure. Let’s talk architecture, scalability, and measurable ROI.',
      cta: 'Book a free 30-min architecture call',
      subCta: 'or reach out directly on',
      roiBtn: 'Test interactive ROI calculator',
    },
    pt: {
      badge: 'CONSULTORIA & ARQUITETURA',
      title: 'Quer automatizar seus fluxos de negócio ou acelerar sua plataforma digital?',
      desc: 'Desenvolvo pipelines de IA, modernizo arquiteturas em Next.js e protejo servidores Linux com zero atrito.',
      cta: 'Agendar reunião técnica de 30 min grátis',
      subCta: 'ou fale diretamente pelo',
      roiBtn: 'Testar calculadora de ROI',
    },
  }[lang];

  return (
    <section className="my-16 relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#181820] to-[#0f0f14] p-8 md:p-10 shadow-2xl">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {content.badge}
          </span>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
            {content.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {content.desc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[240px]">
          <TrackLink
            href={`/${lang}/contact`}
            event="cta_clicked"
            label="blog-cta-box-primary"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-theme-1 text-secondary shadow-[0_0_20px_rgba(249,110,3,0.3)] hover:shadow-[0_0_30px_rgba(249,110,3,0.5)] hover:scale-[1.02] transition-all text-center"
          >
            <span>{content.cta}</span>
            <span aria-hidden="true">→</span>
          </TrackLink>

          <a
            href="https://t.me/andresmorales"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-all text-center"
          >
            <span>{content.subCta} <strong>Telegram</strong></span>
          </a>
        </div>
      </div>
    </section>
  );
}
