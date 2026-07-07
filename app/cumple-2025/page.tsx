export const metadata = {
  title: 'Cumple 2025',
  description:
    'Birthday-month automation package: limited slots, fixed scope, fast turnaround. Special campaign for October 2025.',
};

// Custom campaign landing page extracted from WP (page id 1020)
export default function CumplePage() {
  return (
    <section className="section bg-gradient-to-br from-theme-1 to-theme-2 text-primary">
      <div className="container-page text-center max-w-3xl">
        <p className="text-sm uppercase tracking-widest text-primary/80 mb-3">
          Special campaign
        </p>
        <h1 className="font-heading text-4xl md:text-6xl mb-6">Cumple 2025</h1>
        <p className="text-primary/90 text-lg mb-8">
          Birthday-month automation package: limited slots, fixed scope, fast
          turnaround.
        </p>
        <a
          href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
          target="_blank"
          rel="noreferrer"
          className="btn bg-primary text-theme-2 hover:bg-primary/90"
        >
          Reserve your slot
        </a>
      </div>
    </section>
  );
}
