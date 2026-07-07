import Link from 'next/link';
import { wpImage } from '@/lib/theme';

// "Connect" section del home — SIN formulario (solo info + CTAs)
// Reemplaza al HomeContact con form. Mantiene el CTA pero sin form embebido.
export function HomeContact() {
  return (
    <section className="section bg-background">
      <div className="container-page text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-theme-1 mb-3 font-secondary font-bold">
          Based in Colombia, working worldwide.
        </p>
        <h2 className="font-heading text-3xl md:text-4xl mb-4">
          Let’s connect
        </h2>
        <p className="text-text text-lg mb-8">
          Want to discover how AI can grow your business? Send me a message —
          I’ll personally get back to you.
        </p>
        <a
          href="mailto:info@andresmorales.com.co"
          className="inline-flex items-center gap-2 text-theme-1 hover:text-theme-2 text-lg mb-8"
        >
          ✉ info@andresmorales.com.co
        </a>
        <div>
          <Link
            href="/contact"
            className="btn-theme text-base px-8 py-4"
          >
            Send me a message
          </Link>
        </div>
      </div>
    </section>
  );
}