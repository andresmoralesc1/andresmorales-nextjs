import Link from 'next/link';

// Section 4 of home: "Unleash Potential Together" —
// CTA con imagen de fondo (replica el banner del WP)
export function Cta() {
  return (
    <section className="relative section overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="/cta-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Dark overlay for legibility — lowered so the handshake stays visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/55 to-theme-3/65" />
      </div>

      <div className="container-page relative z-10 text-center text-primary">
        <h2 className="font-heading text-3xl md:text-5xl mb-6 text-primary">
          Unleash Potential Together
        </h2>
        <p className="text-primary/85 max-w-2xl mx-auto mb-8 text-lg">
          Ready to stop doing manually what could be automated in seconds?
          Let’s map the first workflow.
        </p>
        <Link
          href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
          target="_blank"
          rel="noreferrer"
          className="btn-theme text-base px-8 py-4 shadow-lg"
        >
          Book a free strategy call
        </Link>
      </div>
    </section>
  );
}