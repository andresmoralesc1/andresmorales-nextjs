import Image from 'next/image';
import { getCurrentDictionary } from '@/lib/dictionary';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { Reveal } from '@/components/reveal';

// "Unleash Potential Together" — middle CTA banner.
// Server component, reads from dictionary.
export async function Cta() {
  const dict = await getCurrentDictionary();
  return (
    <section className="relative section overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/cta-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/55 to-theme-3/65" />
      </div>

      <Reveal className="container-page relative z-10 text-center text-primary">
        <h2 className="font-heading text-3xl md:text-5xl mb-6 text-primary">
          {dict.homeCta.title}
        </h2>
        <p className="text-primary/85 max-w-2xl mx-auto mb-8 text-lg">
          {dict.homeCta.subtitle}
        </p>
        <a
          href={CALENDAR_BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-theme text-base px-8 py-4"
        >
          {dict.homeCta.cta}
        </a>
      </Reveal>
    </section>
  );
}
