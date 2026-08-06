import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Brief Received',
  description:
    'Thanks for submitting your project brief. I will reply within 24 hours with either a follow-up question or a proposed next step.',
  path: '/brief/thanks',
  noindex: true,
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function BriefThanksPage() {
  const dict = await getCurrentDictionary();
  return (
    <section className="section bg-primary">
      <Reveal as="div" className="container-page max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-1/10 mb-6">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f96e03"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl mb-4 text-secondary">
          {dict.briefThanks.title}
        </h1>
        <p className="text-text text-lg mb-8">{dict.briefThanks.body}</p>

        <div className="mt-6 p-4 rounded-xl bg-theme-5 border border-theme-9 mb-10 text-left">
          <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
            {dict.briefThanks.highlight}
          </p>
          <p className="text-secondary font-medium">{dict.briefThanks.nextTitle}</p>
          <ol className="mt-3 space-y-2 text-text text-sm list-decimal list-inside">
            <li>{dict.briefThanks.next1}</li>
            <li>{dict.briefThanks.next2}</li>
            <li>{dict.briefThanks.next3}</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/portfolio" className="btn-theme">
            {dict.briefThanks.ctaWork}
          </Link>
          <Link href="/" className="btn-outline">
            {dict.briefThanks.ctaHome}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
