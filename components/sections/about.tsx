import { getCurrentDictionary } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';

// "About me" — server component. Reads translations from the dictionary
// via the `x-locale` header set by middleware.
export async function About() {
  const dict = await getCurrentDictionary();
  return (
    <section className="section bg-theme-5">
      <Reveal className="container-page">
        <h2 className="text-sm uppercase tracking-widest text-black mb-2">
          {dict.homeAbout.eyebrow}
        </h2>
        <h3 className="font-heading text-2xl md:text-3xl mb-4 max-w-3xl">
          {dict.homeAbout.title}
        </h3>
        <p className="font-secondary italic text-lg md:text-xl text-text mb-6">
          {dict.homeAbout.subtitle}
        </p>
        <div className="max-w-3xl text-text leading-relaxed space-y-4 text-lg">
          <p>{dict.homeAbout.p1}</p>
          <p>{dict.homeAbout.p2}</p>
          <p>{dict.homeAbout.p3}</p>
          <p>{dict.homeAbout.p4}</p>
        </div>
      </Reveal>
    </section>
  );
}
