import { ContactForm } from '@/components/sections/contact-form';
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
    title: dict.metadata.contactTitle,
    description: dict.metadata.contactDescription,
    locale: safeLang,
    path: '/contact',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}



export default async function ContactPage() {
  const dict = await getCurrentDictionary();
  const trustStats = [
    { n: dict.contact.statsReply, label: dict.contact.statsReplyLabel },
    { n: dict.contact.statsCall, label: dict.contact.statsCallLabel },
    { n: dict.contact.statsTz, label: dict.contact.statsTzLabel },
  ];
  return (
    <>
      {/* Hero — cream, eyebrow + bigger H1 + trust stats. */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-contact" variant="soft" />
        <div className="container-page relative z-10">
          <p className="text-xs uppercase tracking-widest text-black font-secondary font-bold mb-4">
            {dict.contact.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-black max-w-3xl">
            {dict.metadata.contactH1}
          </h1>
          <p className="text-black text-lg max-w-2xl mb-2">
            {dict.contact.subtitle}
          </p>
          <p className="text-secondary/70 text-sm max-w-2xl">
            {dict.contact.subtitle2}
          </p>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mt-8">
            {trustStats.map(({ n, label }) => (
              <div key={label}>
                <div className="font-heading text-2xl md:text-3xl text-black font-bold">
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
                <h2 className="font-heading text-xl md:text-2xl text-black mb-3">
                  {dict.contact.asideBookingTitle}
                </h2>
                <p className="text-sm text-secondary/80 mb-5">
                  {dict.contact.asideBookingP}
                </p>
                <a
                  href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
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

      <Cta />
    </>
  );
}
