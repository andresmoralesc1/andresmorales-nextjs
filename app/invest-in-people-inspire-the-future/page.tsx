import { Cta } from '@/components/sections/cta';

export const metadata = {
  title: 'Invest in People, Inspire the Future',
  description:
    'A program to bring practical AI automation training to small business owners and operators across LATAM.',
};

// Custom campaign landing page (page id 1058) — refines "Invest in People, Inspire the Future"
export default function InvestPage() {
  return (
    <>
      <section className="section bg-background text-primary">
        <div className="container-page text-center max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-theme-1 mb-3">
            Initiative
          </p>
          <h1 className="font-heading text-4xl md:text-6xl mb-6">
            Invest in People,<br />Inspire the Future
          </h1>
          <p className="text-primary/80 text-lg mb-8">
            A program to bring practical AI automation training to small
            business owners and operators across LATAM.
          </p>
        </div>
      </section>
      <section className="section bg-primary">
        <div className="container-page grid md:grid-cols-3 gap-6">
          {[
            { n: '1', t: 'Diagnose', d: 'Map the manual work that eats the most time per week.' },
            { n: '2', t: 'Train', d: 'Hands-on sessions to build the first automation with the team.' },
            { n: '3', t: 'Scale', d: 'Templates and playbooks so the team can keep building.' },
          ].map((s) => (
            <div key={s.n} className="p-6 rounded-xl border border-theme-9">
              <div className="text-theme-1 font-heading text-2xl mb-2">{s.n}</div>
              <h3 className="font-heading text-xl mb-2">{s.t}</h3>
              <p className="text-text">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}
