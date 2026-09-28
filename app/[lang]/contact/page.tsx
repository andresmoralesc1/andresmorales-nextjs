import { ContactForm } from '@/components/sections/contact-form';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { pageMetadata } from '@/lib/metadata';
import { Reveal } from '@/components/reveal';
import { JsonLd, faqSchema, breadcrumbSchema, localBusinessSchema } from '@/lib/json-ld';
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
    title: dict.metadata.contactTitle,
    description: dict.metadata.contactDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/contact' : `/${safeLang}/contact`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}



export default async function ContactPage() {
  const [dict, lang] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const trustStats = [
    { n: dict.contact.statsReply, label: dict.contact.statsReplyLabel },
    { n: dict.contact.statsCall, label: dict.contact.statsCallLabel },
    { n: dict.contact.statsTz, label: dict.contact.statsTzLabel },
  ];

  // ContactPage + FAQPage + BreadcrumbList structured data. The
  // ContactPage @type lets Google tie the email/booking CTAs to the
  // Person entity declared in the root layout (`@id: /#person`), which
  // strengthens the knowledge graph for branded searches.
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: dict.metadata.contactTitle,
    description: dict.metadata.contactDescription,
    url: `https://andresmorales.com.co${lang === 'en' ? '' : `/${lang}`}/contact`,
    inLanguage: lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
    publisher: { '@id': 'https://andresmorales.com.co/#person' },
    about: { '@id': 'https://andresmorales.com.co/#person' },
  };

  const faq = faqSchema(
    dict.contact.faqItems.map((item: { q: string; a: string }) => ({
      question: item.q,
      answer: item.a,
    })),
    lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
  );

  const breadcrumbs = breadcrumbSchema([
    {
      name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home',
      path: lang === 'en' ? '/' : `/${lang}`,
    },
    { name: dict.metadata.contactTitle, path: lang === 'en' ? '/contact' : `/${lang}/contact` },
  ]);

  // LocalBusiness NAP for SEO. Aligns with the Google Business Profile
  // the user already manages — keep them in sync. Address/geo omitted
  // here because the practice is fully remote; fill in when you add a
  // physical office location.
  const lbUrl = lang === 'en'
    ? 'https://andresmorales.com.co/contact'
    : 'https://andresmorales.com.co/' + lang + '/contact';
  const lb = localBusinessSchema({
    name: 'Andrés Morales',
    url: lbUrl,
    description: dict.metadata.homeDescription,
    email: 'info@andresmorales.com.co',
    addressLocality: 'Bogotá',
    addressRegion: 'Bogotá D.C.',
    addressCountry: 'CO',
    priceRange: '$$',
    openingHours: ['Mo-Fr 09:00-18:00'],
  });

  return (
    <>
      <JsonLd data={[contactSchema, faq, breadcrumbs, lb]} />
      {/* Hero — cream, eyebrow + bigger H1 + trust stats. */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-contact" variant="soft" />
        <div className="container-page relative z-10">
          <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-4">
            {dict.contact.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-secondary max-w-3xl">
            {dict.metadata.contactH1}
          </h1>
          <p className="text-secondary text-lg max-w-2xl mb-2">
            {dict.contact.subtitle}
          </p>
          <p className="text-secondary/70 text-sm max-w-2xl">
            {dict.contact.subtitle2}
          </p>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mt-8">
            {trustStats.map(({ n, label }) => (
              <div key={label}>
                <div className="font-heading text-2xl md:text-3xl text-secondary font-bold">
                  {n}
                </div>
                <p className="text-secondary/70 text-xs md:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + aside — 7/5 split */}
      <section className="section bg-theme-5">
        <Reveal className="container-page grid md:grid-cols-12 gap-8 md:gap-10">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <aside className="md:col-span-5 md:col-start-9 self-start">
            <div className="rounded-2xl bg-primary border border-theme-9 p-6 md:p-8 space-y-7">
              {/* Primary aside CTA — booking link */}
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                  {dict.contact.asideBookingKicker}
                </p>
                <h2 className="font-heading text-xl md:text-2xl text-secondary mb-3">
                  {dict.contact.asideBookingTitle}
                </h2>
                <p className="text-sm text-secondary/80 mb-5">
                  {dict.contact.asideBookingP}
                </p>
                <a
                  href={CALENDAR_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-theme w-full md:w-auto justify-center text-base px-6 py-3 inline-flex"
                >
                  {dict.contact.asideBookingCta}
                </a>
              </div>

              <hr className="border-theme-9" />

              {/* Email */}
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                  {dict.contact.asideEmailKicker}
                </p>
                <a
                  href="mailto:info@andresmorales.com.co"
                  className="text-base text-secondary hover:text-accent underline underline-offset-4 decoration-theme-1/40 hover:decoration-theme-1 break-all"
                >
                  info@andresmorales.com.co
                </a>
              </div>

              <hr className="border-theme-9" />

              {/* Working hours */}
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                  {dict.contact.asideHoursKicker}
                </p>
                <p className="text-base text-secondary">{dict.contact.asideHoursP}</p>
                <p className="text-sm text-secondary/70 mt-1">
                  {dict.contact.asideHoursHint}
                </p>
              </div>
            </div>
          </aside>
        </Reveal>
      </section>

      {/* FAQ — visible Q&A so the FAQPage schema in <head> has matching
          HTML. <details> accordion works without JS; crawlers see the
          text without expanding. */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-3xl">
          <Reveal as="div" stagger>
            <h2 className="font-heading text-2xl md:text-3xl mb-2">
              {dict.contact.faqTitle}
            </h2>
            <p className="text-secondary/80 mb-6">{dict.contact.faqSubtitle}</p>
            <div className="space-y-3">
              {dict.contact.faqItems.map((item: { q: string; a: string }, i: number) => (
                <details
                  key={i}
                  className="group rounded-xl border border-theme-9 bg-primary px-5 py-4 open:shadow-sm transition-shadow"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-secondary font-medium">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="text-accent text-xl leading-none select-none group-open:rotate-45 transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-secondary/80 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Cta />
    </>
  );
}
