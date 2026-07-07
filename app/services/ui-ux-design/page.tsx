import type { Metadata } from 'next';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';

export const metadata: Metadata = {
  title: 'UI/UX Design',
  description:
    'UX research, interface design and conversion-focused UI — built on a decade in sales and product thinking. Research, design, test, ship.',
};

const CAPABILITIES = [
  {
    title: 'UX Research',
    desc: 'User interviews, surveys, usability testing, and competitive analysis. I dig into real behavior so the design follows from evidence, not assumptions.',
  },
  {
    title: 'User Flows & Wireframes',
    desc: 'End-to-end flows that make the next step obvious. Wireframes that lock down structure before pixels take over.',
  },
  {
    title: 'Interface Design',
    desc: 'Production-ready UI in Figma with type, color, and spacing systems. Components that hold up at any screen size.',
  },
  {
    title: 'Conversion Optimization',
    desc: 'Every screen has a job. I iterate on copy, layout, and CTA hierarchy so the path to conversion is short and obvious.',
  },
  {
    title: 'Design Systems',
    desc: 'Tokens, components, and documentation so design and engineering speak the same language. Less drift, faster shipping.',
  },
  {
    title: 'Usability Testing',
    desc: 'Moderated and unmoderated sessions. Real users, real tasks, real metrics. I turn findings into a backlog your dev team can actually act on.',
  },
];

const APPROACH = [
  'I start by understanding the user and the business at the same time — neither one matters without the other. Empathy for the customer, sharp eye for the numbers.',
  'Once I’ve mapped the journey and locked the flow, I move fast on wireframes. Cheap to change, expensive to skip.',
  'Visual design comes after the structure is solid. I build a clear type and spacing system so screens feel consistent without being repetitive.',
  'Every interface gets tested. Five users catch 85% of usability problems, and the rest gets folded into the next sprint.',
  'Design doesn’t stop at hand-off. I sit with engineering, review every PR, and tune the live product when real-world data comes in.',
];

const TOOLS = [
  'Figma',
  'Maze',
  'Hotjar / Microsoft Clarity',
  'Notion / Confluence',
  'Google Analytics 4',
  'TypeScript & Tailwind (for design handoff and prototypes)',
];

export default function UiUxDesignPage() {
  return (
    <>
      {/* Hero */}
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-uiux" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl mb-4">UI/UX Design</h1>
            <p className="text-text text-lg">
              Interfaces that feel obvious and convert. Research, design and
              iterate — until the user doesn’t have to think twice.
            </p>
          </div>
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-theme-9">
            <img
              src={wpImage('/wp-content/uploads/2025/06/IMG-20160129-WA0001.jpg')}
              alt="Andrés at work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">
            What I bring to the table
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CAPABILITIES.map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-xl mb-3 text-theme-1">
                  {s.title}
                </h3>
                <p className="text-text leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section">
        <div className="container-page max-w-3xl space-y-6 text-text leading-relaxed">
          <h2 className="font-heading text-3xl md:text-4xl mb-2">
            How I work
          </h2>
          {APPROACH.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="pt-4">
            <a href="mailto:info@andresmorales.com.co" className="btn-theme">
              Have a project? Let’s talk UX.
            </a>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="section bg-theme-5">
        <div className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            Tools I work with
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-text">
            {TOOLS.map((t) => (
              <li
                key={t}
                className="px-4 py-2 rounded-lg bg-primary border border-theme-9"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta />
    </>
  );
}
