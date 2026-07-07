import Link from 'next/link';
import { wpImage } from '@/lib/theme';

// Portfolio preview on home — only 3 featured projects + "See all work" link
// (the 8+ projects are at /portfolio)
const PROJECTS = [
  {
    title: 'Cleida',
    image: wpImage('/wp-content/uploads/2024/01/hgtrfhgdfhg.jpg'),
    href: 'https://cleida.com.co/',
  },
  {
    title: 'Superllantas',
    image: wpImage('/wp-content/uploads/2023/04/2.png'),
    href: 'https://superllantas.co/',
  },
  {
    title: 'BarrioTech — GPS Street Sellers',
    image: wpImage('/wp-content/uploads/2023/04/5.png'),
    href: 'https://gps.andresmorales.com.co/',
  },
];

export function PortfolioPreview() {
  return (
    <section className="section bg-primary">
      <div className="container-page">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">Selected Work</h2>
          <p className="text-text">A glimpse of recent projects — see more in the full portfolio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECTS.map((p) => (
            <a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-theme-9 block"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 to-transparent flex items-end p-5">
                <span className="text-primary font-heading font-bold text-lg">
                  {p.title}
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/portfolio" className="btn-outline">
            See all work →
          </Link>
        </div>
      </div>
    </section>
  );
}