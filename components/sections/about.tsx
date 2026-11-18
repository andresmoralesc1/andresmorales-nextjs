import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';
import { ShieldCheck, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

// "About me" — server component.
// Redesigned from a plain text wall into a modern Credential Bento:
// Left: Core mission & operating philosophy (Code vs Slides).
// Right: 3 key pillars (Sales-to-Code mindset, Zero Lock-in, Weekly functional cadence).
export async function About() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  return (
    <section className="section bg-theme-5 border-t border-theme-9/50">
      <Reveal className="container-page max-w-6xl">
        <div className="text-center md:text-left mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
            {dict.homeAbout.eyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl mb-3 text-secondary leading-tight">
            {dict.homeAbout.title}
          </h2>
          <p className="font-secondary italic text-base md:text-xl text-text leading-relaxed">
            {dict.homeAbout.subtitle}
          </p>
        </div>

        {/* Bento Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Story Card (Left 7 cols) */}
          <div className="lg:col-span-7 bg-primary rounded-3xl p-6 sm:p-8 md:p-10 border border-theme-9 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-1/15 border border-theme-1/30 text-xs font-mono font-bold text-secondary">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span>
                  {locale === 'en'
                    ? 'Code in production, not slide decks'
                    : locale === 'pt'
                    ? 'Código em produção, não apresentações'
                    : 'Código en producción, no diapositivas'}
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl font-heading text-secondary font-bold leading-snug">
                "{dict.homeAbout.p2}"
              </blockquote>

              <p className="text-sm sm:text-base text-text leading-relaxed">
                {dict.homeAbout.p1}
              </p>

              <p className="text-sm sm:text-base text-text leading-relaxed">
                {dict.homeAbout.p3}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-theme-9/60 flex flex-wrap items-center gap-4 text-xs font-mono text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {locale === 'en' ? 'B2B Sales Psychology' : locale === 'pt' ? 'Psicologia de Vendas B2B' : 'Psicología de Ventas B2B'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {locale === 'en' ? 'Full-Stack Architecture' : locale === 'pt' ? 'Arquitetura Full-Stack' : 'Arquitectura Full-Stack'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {locale === 'en' ? 'Autonomous AI Workflows' : locale === 'pt' ? 'Workflows Autônomos de IA' : 'Workflows Autónomos de IA'}
              </span>
            </div>
          </div>

          {/* 3 Value Pillars Stack (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            {/* Pillar 1 */}
            <div className="bg-primary rounded-2xl p-5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-secondary mb-1">
                  {locale === 'en' ? 'Fast ROI & Tangible Results' : locale === 'pt' ? 'ROI Rápido e Resultados Reais' : 'ROI Rápido y Resultados Medibles'}
                </h4>
                <p className="text-xs text-text leading-relaxed">
                  {locale === 'en'
                    ? 'Automations recover hours in days, eliminating repetitive manual bottlenecks and directly expanding margins.'
                    : locale === 'pt'
                    ? 'Automações recuperam horas em dias, eliminando gargalos manuais e expandindo margens de lucro.'
                    : 'Automatizaciones que recuperan tiempo en días, eliminando cuellos de botella manuales y aumentando tu margen operativo.'}
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-primary rounded-2xl p-5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-secondary mb-1">
                  {locale === 'en' ? 'Zero Vendor Lock-in' : locale === 'pt' ? 'Zero Lock-in de Fornecedor' : 'Cero Vendor Lock-in (100% Tuyo)'}
                </h4>
                <p className="text-xs text-text leading-relaxed">
                  {locale === 'en'
                    ? '100% intellectual property ownership. Code in your GitHub, PostgreSQL databases and Docker containers.'
                    : locale === 'pt'
                    ? 'Propriedade intelectual 100% sua. Código no seu GitHub, PostgreSQL e containers Docker próprios.'
                    : 'Eres dueño del 100% del código en GitHub, bases de datos PostgreSQL y despliegues en infraestructura propia.'}
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-primary rounded-2xl p-5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-secondary mb-1">
                  {locale === 'en' ? 'Weekly Functional Deliveries' : locale === 'pt' ? 'Entregas Funcionais Semanais' : 'Entregas Funcionales Semanales'}
                </h4>
                <p className="text-xs text-text leading-relaxed">
                  {locale === 'en'
                    ? 'Working demos every 7 days. Progress you can click, test and validate directly with real data.'
                    : locale === 'pt'
                    ? 'Demos funcionais a cada 7 dias. Progresso testável diretamente com dados reais da sua operação.'
                    : 'Demos en vivo cada 7 días. Avance que puedes tocar, probar y validar directamente con datos reales.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
