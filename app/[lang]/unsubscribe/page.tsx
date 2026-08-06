// Email unsubscribe confirmation page (page id 1501)
import Link from 'next/link';
import { ParticlesBackground } from '@/components/particles-background';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Unsubscribed',
  description:
    'You are unsubscribed. No further emails will be sent to this address.',
  path: '/unsubscribe',
  noindex: true,
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function UnsubscribePage() {
  const dict = await getCurrentDictionary();
  return (
    <section className="section bg-primary relative overflow-hidden">
      <ParticlesBackground id="hero-particles-unsubscribe" variant="soft" />
      <div className="container-page max-w-2xl text-center relative z-10">
        <h1 className="font-heading text-3xl md:text-4xl mb-4">
          {dict.unsubscribe.title}
        </h1>
        <p className="text-text text-lg mb-8">{dict.unsubscribe.body}</p>
        <Link href="/" className="btn-outline">{dict.unsubscribe.cta}</Link>
      </div>
    </section>
  );
}