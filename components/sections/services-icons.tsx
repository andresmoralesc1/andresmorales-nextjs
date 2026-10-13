import { getCurrentDictionary } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';

// "What I do" — 3 icon boxes. Server component, reads from dictionary.
//
// 3 cards focus on the delivery: AI Automation / UI/UX / AI-Powered Web.
// Sales-era card removed 2026-10 — the practice is now AI-first, the
// "I came from sales" bio lives in the about page instead.
//
// Icons (strokeWidth 1.75 + round caps/joins for refined look at
// 32px): 4-point sparkle for AI, 3x3 grid for UI/UX, layered code
// bracket for web. Each chosen to read as the concept at a glance,
// not as generic "tech" clipart.
export async function ServicesIcons() {
  const dict = await getCurrentDictionary();
  const services = [
    {
      title: dict.homeServicesIcons.aiTitle,
      desc: dict.homeServicesIcons.aiDesc,
      icon: (
        // 4-point sparkle (one large + one small) — the canonical
        // "AI / generative" mark used by OpenAI, Notion AI, etc.
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
          aria-hidden="true"
        >
          <path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" />
          <path d="M19 4 L19.6 6 L21.6 6.6 L19.6 7.2 L19 9.2 L18.4 7.2 L16.4 6.6 L18.4 6 Z" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.uiTitle,
      desc: dict.homeServicesIcons.uiDesc,
      icon: (
        // 3x3 layout grid — clearly a "design surface" / "viewport".
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.webTitle,
      desc: dict.homeServicesIcons.webDesc,
      icon: (
        // Layered code brackets `</>` — the universal "code/web" mark.
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
          aria-hidden="true"
        >
          <path d="M8 7 L3 12 L8 17" />
          <path d="M16 7 L21 12 L16 17" />
          <path d="M14 5 L10 19" />
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