import { getCurrentDictionary } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';

// "What I do" — 3 icon boxes. Server component, reads from dictionary.
export async function ServicesIcons() {
  const dict = await getCurrentDictionary();
  const services = [
    {
      title: dict.homeServicesIcons.salesTitle,
      desc: dict.homeServicesIcons.salesDesc,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 4 4 5-5" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.aiTitle,
      desc: dict.homeServicesIcons.aiDesc,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 9h6v6H9z" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.uiTitle,
      desc: dict.homeServicesIcons.uiDesc,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];
  return (
    <section className="section">
      <Reveal className="container-page">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">
            {dict.homeServicesIcons.title}
          </h2>
          <p className="text-text max-w-2xl mx-auto">
            {dict.homeServicesIcons.subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-xl border border-theme-9 hover:border-theme-1 hover:shadow-lg transition-all bg-primary"
            >
              <div className="w-14 h-14 rounded-lg bg-theme-1/10 text-accent flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="font-heading text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-text leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}