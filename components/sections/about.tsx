import Image from 'next/image';
import { wpImage } from '@/lib/theme';
import { LazyParticles } from '@/components/lazy-particles';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';
import { ShieldCheck, Zap, TrendingUp, CheckCircle2, Mail, Phone } from 'lucide-react';
import { SocialIcon } from '@/components/social-icon';

// "About me" — server component.
// Features Andrés Morales' portrait with dynamic particle aura & credentials bento:
// Left: Portrait, availability status & contact links.
// Middle: Core mission & operating philosophy (Code vs Slides).
// Right: 3 key pillars (Sales-to-Code mindset, Zero Lock-in, Weekly functional cadence).
export async function About({
  portrait = wpImage('/wp-content/uploads/2023/04/19.png'),
}: {
  portrait?: string;
}) {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  return (
    <section id="nosotros" className="section relative bg-theme-5 border-t border-theme-9/50 overflow-hidden">
      {/* Background Particles behind About section */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <LazyParticles id="about-particles-canvas" variant="cream" />
      </div>

      <Reveal className="container-page max-w-6xl relative z-10">
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

        {/* Bento Grid: Portrait + Story + Value Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Col 1: Portrait with Effect & Quick Info (4 cols) */}
          <div className="lg:col-span-4 bg-primary rounded-3xl p-6 sm:p-7 border border-theme-9 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group">
            {/* Subtle glow circle behind image */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

            <div className="w-full flex flex-col items-center">
              {/* Circular portrait with thick orange border */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-[5px] sm:border-[6px] border-theme-1 shadow-xl bg-theme-9 mb-5 transition-transform duration-300 group-hover:scale-[1.03]">
                <Image
                  src={portrait}
                  alt={dict.homeHero.portraitAlt}
                  width={600}
                  height={600}
                  sizes="(max-width: 768px) 208px, 260px"
                  quality={85}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Availability Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-1/10 border border-theme-1/30 text-[11px] font-mono text-secondary mb-3 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-1 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-1" />
                </span>
                <span className="font-semibold">
                  {locale === 'en'
                    ? 'Available · Q1 2026'
                    : locale === 'pt'
                    ? 'Disponível · Q1 2026'
                    : 'Disponible · Q1 2026'}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-secondary mb-1">
                {dict.homeHero.name}
              </h3>
              <p className="text-xs font-mono text-accent mb-4">
                {dict.homeHero.role2}
              </p>
            </div>

            {/* Direct Contact & Social Links */}
            <div className="w-full pt-4 border-t border-theme-9/60 flex flex-col gap-2">
              <a
                href="mailto:info@andresmorales.com.co"
                className="text-secondary hover:text-accent flex items-center justify-center gap-2 text-xs font-medium py-1.5 px-3 rounded-lg bg-theme-5 border border-theme-9/80 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>info@andresmorales.com.co</span>
              </a>
              <a
                href="https://wa.me/573161482507"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent flex items-center justify-center gap-2 text-xs font-medium py-1.5 px-3 rounded-lg bg-theme-5 border border-theme-9/80 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>+57 316 148 2507</span>
              </a>

              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href="https://www.linkedin.com/in/andresmoralesc1/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-theme-5 border border-theme-9/80 flex items-center justify-center text-secondary hover:text-accent transition-colors"
                >
                  <SocialIcon name="linkedin" size="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/andres_morales_automation/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-theme-5 border border-theme-9/80 flex items-center justify-center text-secondary hover:text-accent transition-colors"
                >
                  <SocialIcon name="instagram" size="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.facebook.com/andresmoralesautomation/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-theme-5 border border-theme-9/80 flex items-center justify-center text-secondary hover:text-accent transition-colors"
                >
                  <SocialIcon name="facebook" size="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Main Story Card (4 cols) */}
          <div className="lg:col-span-4 bg-primary rounded-3xl p-6 sm:p-7 border border-theme-9 shadow-sm flex flex-col justify-between">
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

              <blockquote className="text-base sm:text-lg font-heading text-secondary font-bold leading-snug">
                "{dict.homeAbout.p2}"
              </blockquote>

              <p className="text-xs sm:text-sm text-text leading-relaxed">
                {dict.homeAbout.p1}
              </p>

              <p className="text-xs sm:text-sm text-text leading-relaxed">
                {dict.homeAbout.p3}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-theme-9/60 flex flex-col gap-2 text-xs font-mono text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {locale === 'en' ? 'B2B Sales Psychology' : locale === 'pt' ? 'Psicologia de Vendas B2B' : 'Psicología de Ventas B2B'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {locale === 'en' ? 'Full-Stack Architecture' : locale === 'pt' ? 'Arquitetura Full-Stack' : 'Arquitectura Full-Stack'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {locale === 'en' ? 'Autonomous AI Workflows' : locale === 'pt' ? 'Workflows Autônomos de IA' : 'Workflows Autónomos de IA'}
              </span>
            </div>
          </div>

          {/* Col 3: 3 Value Pillars Stack (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 justify-between">
            {/* Pillar 1 */}
            <div className="bg-primary rounded-2xl p-4.5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-3.5 flex-1">
              <div className="w-9 h-9 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-secondary mb-1">
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
            <div className="bg-primary rounded-2xl p-4.5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-3.5 flex-1">
              <div className="w-9 h-9 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-secondary mb-1">
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
            <div className="bg-primary rounded-2xl p-4.5 border border-theme-9 shadow-xs hover:border-theme-1/50 transition-all flex items-start gap-3.5 flex-1">
              <div className="w-9 h-9 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center shrink-0 text-accent">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-secondary mb-1">
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
