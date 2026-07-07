import { ContactForm } from '@/components/sections/contact-form';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    "Tell me what you want to automate. I usually reply in under 24 hours with a follow-up call or email.",
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-contact" variant="soft" />
        <div className="container-page relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl mb-4">Contact</h1>
          <p className="text-text text-lg max-w-2xl mb-2">
            Tell me what you’re trying to automate. I usually reply within 24h.
          </p>
        </div>
      </section>
      <section className="section bg-theme-5">
        <div className="container-page grid md:grid-cols-2 gap-12">
          <div>
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg mb-2">Email</h2>
              <a
                href="mailto:andresmortal1@gmail.com"
                className="text-theme-1 hover:underline"
              >
                andresmortal1@gmail.com
              </a>
            </div>
            <div>
              <h2 className="font-heading text-lg mb-2">Schedule a call</h2>
              <a
                href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
                target="_blank"
                rel="noreferrer"
                className="text-theme-1 hover:underline"
              >
                Free 30-min strategy call →
              </a>
            </div>
            <div>
              <h2 className="font-heading text-lg mb-2">Working hours</h2>
              <p className="text-text">Mon–Fri, 9:00–18:00 (GMT-5)</p>
            </div>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
