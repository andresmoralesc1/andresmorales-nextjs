// Email unsubscribe confirmation page (page id 1501)
import { ParticlesBackground } from '@/components/particles-background';

export const metadata = {
  title: 'Unsubscribed',
  description:
    'You are unsubscribed. No further emails will be sent to this address.',
};

export default function UnsubscribePage() {
  return (
    <section className="section bg-primary relative overflow-hidden">
      <ParticlesBackground id="hero-particles-unsubscribe" variant="soft" />
      <div className="container-page max-w-2xl text-center relative z-10">
        <h1 className="font-heading text-3xl md:text-4xl mb-4">
          You’re unsubscribed
        </h1>
        <p className="text-text text-lg mb-8">
          No further emails will be sent to this address. If this was a
          mistake, you can re-subscribe from any of our email footers.
        </p>
        <a href="/" className="btn-outline">
          Back to home
        </a>
      </div>
    </section>
  );
}
