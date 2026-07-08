import Link from 'next/link';

// Custom 404 page. Renders inside the root layout (Header + Footer are
// inherited automatically by Next.js App Router — see layout.tsx).
// Kept tight: heading, supporting copy, two CTAs (home + brief).
export default function NotFound() {
  return (
    <section className="container-page py-24 sm:py-32">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-theme-1">
          404
        </p>
        <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-secondary">
          Page not found
        </h1>
        <p className="mt-6 text-lg text-secondary/80">
          The page you were looking for doesn’t exist — or moved. If you came
          here from a link on the site, that’s a bug on my end and I’d love to
          know about it.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-theme-1 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-theme-1/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-1"
          >
            Go home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-secondary/20 bg-white px-6 py-3 text-base font-semibold text-secondary hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-1"
          >
            Report this
          </Link>
        </div>
      </div>
    </section>
  );
}
