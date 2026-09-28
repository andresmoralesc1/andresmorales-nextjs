import { ParticlesBackground } from '@/components/particles-background';
import { Reveal } from '@/components/reveal';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Invest in People, Inspire the Future',
  description:
    'A program to bring practical AI automation training to small business owners and independent professionals in Latin America.',
  path: '/invest-in-people-inspire-the-future',
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Custom campaign landing page (page id 1058) — refines "Invest in People, Inspire the Future"
export default async function InvestPage() {
  const dict = await getCurrentDictionary();
  return (
    <>
      <section className="section bg-background text-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-invest" variant="soft" />
        <div className="container-page text-center max-w-3xl relative z-10">
          <p className="text-sm uppercase tracking-widest text-secondary mb-3">
            {dict.invest.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-6xl mb-6">
            {dict.invest.title}
            <br />
            {dict.invest.title2}
          </h1>
          <p className="text-primary/80 text-lg mb-8">{dict.invest.body}</p>
        </div>
      </section>
      <section className="section bg-primary">
        <Reveal as="div" stagger className="container-page grid md:grid-cols-3 gap-6">
          {[
            { n: '1', t: dict.invest.step1Title, d: dict.invest.step1Desc },
            { n: '2', t: dict.invest.step2Title, d: dict.invest.step2Desc },
            { n: '3', t: dict.invest.step3Title, d: dict.invest.step3Desc },
          ].map((s) => (
            <div key={s.n} className="p-6 rounded-xl border border-theme-9">
              <div className="text-secondary font-heading text-2xl mb-2 font-bold">{s.n}</div>
              <h3 className="font-heading text-xl mb-2">{s.t}</h3>
              <p className="text-text">{s.d}</p>
            </div>
          ))}
        </Reveal>
      </section>
      {/* Warm-tone closing — replaces the global B2B <Cta /> for this
          personal/campaign page. Reads from dict.invest.* (3 locales). */}
      <section className="section bg-background">
        <Reveal as="div" className="container-page max-w-2xl text-center">
          <h2 className="font-heading text-2xl md:text-3xl mb-4 text-primary">
            {dict.invest.closingTitle}
          </h2>
          <p className="text-primary/80 mb-8">{dict.invest.closingBody}</p>
          <a
            href="mailto:info@andresmorales.com.co"
            className="btn bg-primary text-theme-2 hover:bg-primary/90"
          >
            {dict.invest.closingCta}
          </a>
        </Reveal>
      </section>
    </>
  );
}