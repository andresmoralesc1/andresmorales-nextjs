// Section 3 of home: "What I do" with 3 icon-boxes — exact text from original WP
const SERVICES = [
  {
    title: 'Sales',
    desc: 'As a sales specialist, I acknowledge the pivotal role of revenue generation and fostering business expansion. I am committed to assisting businesses in attaining their sales objectives through my outstanding communication and relationship-building prowess.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    title: 'AI Automation',
    desc: 'I don’t just build automations — I design intelligent experiences that guide users, solve problems, and scale your business on autopilot. Work less, enjoy more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9h6v6H9z" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
      </svg>
    ),
  },
  {
    title: 'UI/UX Analyst',
    desc: 'As a proficient UI/UX designer, I comprehend the significance of crafting a compelling user interface and experience. My focus lies not only in capturing attention but also in effectively conveying the intended message.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export function ServicesIcons() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">What I do</h2>
          <p className="text-text max-w-2xl mx-auto">
            I analyze your business needs, identify automation opportunities, and
            design smart systems that help you scale efficiently — from idea to
            execution.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-xl border border-theme-9 hover:border-theme-1 hover:shadow-lg transition-all bg-primary"
            >
              <div className="w-14 h-14 rounded-lg bg-theme-1/10 text-theme-1 flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="font-heading text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-text leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}