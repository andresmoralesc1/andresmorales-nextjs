import Link from 'next/link';
import Image from 'next/image';
import { wpImage } from '@/lib/theme';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { Reveal } from '@/components/reveal';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.metadata.servicesTitle,
    description: dict.metadata.servicesDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/services' : `/${safeLang}/services`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function ServicesPage() {
  const dict = await getCurrentDictionary();
  const s = dict.servicesHub;

  return (
    <>
      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-services" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
              {s.heroEyebrow}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-black">
              {s.heroTitle}
            </h1>
            <p className="text-black text-lg md:text-xl max-w-xl">{s.heroSubtitle}</p>
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 shadow-2xl relative">
            <Image
              src={wpImage('/wp-content/uploads/2025/06/IMG-20160129-WA0001.jpg')}
              alt={s.heroImageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Three Tracks */}
      <section className="section bg-background">
        <Reveal stagger className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {s.tracksEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">{s.tracksTitle}</h2>
            <p className="text-text">{s.tracksSubtitle}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            {[
              { href: '/services/ai-automation', eyebrow: s.track1Eyebrow, title: s.track1Title, summary: s.track1Summary, metric: s.track1Metric, caps: [s.track1Cap1, s.track1Cap2, s.track1Cap3, s.track1Cap4, s.track1Cap5] },
              { href: '/services/ui-ux-design',  eyebrow: s.track2Eyebrow, title: s.track2Title, summary: s.track2Summary, metric: s.track2Metric, caps: [s.track2Cap1, s.track2Cap2, s.track2Cap3, s.track2Cap4, s.track2Cap5] },
              { href: '/services/web-development', eyebrow: s.track3Eyebrow, title: s.track3Title, summary: s.track3Summary, metric: s.track3Metric, caps: [s.track3Cap1, s.track3Cap2, s.track3Cap3, s.track3Cap4, s.track3Cap5] },
            ].map((t) => (
              <Link
                key={t.title}
                href={t.href}
                className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-7 md:p-8">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold">{t.eyebrow}</span>
                    <span className="text-[10px] uppercase tracking-widest text-secondary/60 font-secondary font-bold">{t.metric}</span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl mb-3 text-secondary group-hover:text-accent transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-secondary leading-relaxed mb-5 text-sm md:text-base">{t.summary}</p>
                  <ul className="space-y-2 mb-6">
                    {t.caps.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-secondary">
                        <span aria-hidden className="text-accent mt-0.5 font-secondary font-bold">✓</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-theme-9">
                    <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider">
                      {s.trackSeeFull}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-secondary group-hover:text-accent opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      {s.trackOpen} →
                    </span>
                  </div>
                </div>
</Link>
          ))}
          </div>
        </Reveal>
      </section>

      {/* How I work — 3-step process */}
      <section className="section bg-primary">
        <Reveal className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {s.processEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">{s.processTitle}</h2>
            <p className="text-text">{s.processSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {[
              { n: '01', title: s.process1Title, desc: s.process1Desc },
              { n: '02', title: s.process2Title, desc: s.process2Desc },
              { n: '03', title: s.process3Title, desc: s.process3Desc },
            ].map((p, i, arr) => (
              <div key={p.n} className="relative">
                <div className="text-accent font-heading text-5xl md:text-6xl mb-3 leading-none">{p.n}</div>
                <h3 className="font-heading text-xl md:text-2xl mb-2">{p.title}</h3>
                <p className="text-text leading-relaxed text-sm md:text-base">{p.desc}</p>
                {i < arr.length - 1 && (
                  <div aria-hidden className="hidden md:block absolute top-8 -right-4 w-8 text-theme-9">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Why me — differentiators */}
      <section className="section bg-theme-5">
        <Reveal className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {s.diffEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">{s.diffTitle}</h2>
            <p className="text-text">{s.diffSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              { title: s.diff1Title, desc: s.diff1Desc },
              { title: s.diff2Title, desc: s.diff2Desc },
              { title: s.diff3Title, desc: s.diff3Desc },
              { title: s.diff4Title, desc: s.diff4Desc },
            ].map((d) => (
              <div key={d.title} className="p-6 rounded-xl bg-primary border border-theme-9">
                <h3 className="font-heading text-base md:text-lg mb-2 text-secondary">{d.title}</h3>
                <p className="text-text text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
