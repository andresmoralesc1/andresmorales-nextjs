import Link from 'next/link';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Brief Received',
  description:
    'Thanks for submitting your project brief. I will reply within 24 hours with either a follow-up question or a proposed next step.',
  path: '/brief/thanks',
});

export default function BriefThanksPage() {
  return (
    <section className="section bg-primary">
      <div className="container-page max-w-2xl text-center">
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
          Brief received
        </h1>
        <p className="text-text text-lg mb-8">
          Thanks for taking the time to write all that down. I read every brief
          personally and reply within <strong>24 hours</strong> with either a
          follow-up question or a proposed next step.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/portfolio" className="btn-theme">
            See recent work
          </Link>
          <Link href="/" className="btn-outline">
            Back to home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-theme-9 text-left">
          <h2 className="font-heading text-xl mb-3 text-secondary">
            What happens next
          </h2>
          <ol className="space-y-3 text-text list-decimal list-inside">
            <li>
              I read your brief and skim your site (or the site you mentioned)
              to ground my reply.
            </li>
            <li>
              If it&apos;s a fit, I&apos;ll propose a 30-min call to align on
              scope and a fixed price.
            </li>
            <li>
              If it isn&apos;t a fit, I&apos;ll point you somewhere useful —
              no ghosting.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
