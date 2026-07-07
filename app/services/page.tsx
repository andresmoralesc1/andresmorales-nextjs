import { wpImage } from '@/lib/theme';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import type { Metadata } from 'next';

const ICON_BOXES = [
  {
    title: 'AI Automation Consultant',
    desc: 'An effective automation strategy saves time, reduces friction, and scales impact across the whole operation.',
  },
  {
    title: 'UI/UX analyst',
    desc: 'An effective UI/UX is what captures attention and spreads a clear message. I make flows feel obvious.',
  },
  {
    title: 'Sales',
    desc: 'Highly effective salesperson with strong prospecting and empathic skills. Identifies pain points and converts them into partnerships.',
  },
  {
    title: 'Entrepreneur',
    desc: 'Entrepreneur with extensive problem-solving, leadership, and creative thinking applied to real business problems.',
  },
];

const INTRO = [
  'I do everything between these lines, from understanding your requirements to building a plan to delivering the finished product.',
  'In my role as an AI Automation Consultant, I analyze business processes and digital interactions to identify repetitive work and ship reliable automations.',
  'In my role as a UX analyst, I focus on analyzing user behavior to enhance digital products and services.',
  'As a sales professional, your adept prospecting skills and empathic approach contribute to your high effectiveness in reaching targets.',
  'As an entrepreneur, I bring a wealth of skills and experience to any business. My capacity to work independently, take initiative, and adapt to changing environments is a hallmark of my professional profile.',
];

export const metadata: Metadata = {
  title: 'My Work',
  description:
    'Three service tracks: AI automations that save hours every week, UI/UX design that improves how people use your product, and web development that ships fast — for clients who want measurable outcomes.',
};

export default function ServicesPage() {
  return (
    <>
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-services" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl mb-4">My Work</h1>
            <p className="text-text text-lg">
              What I do — and how I think about it.
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

      <section className="section bg-theme-5">
        <div className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">What I do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ICON_BOXES.map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-xl mb-3 text-theme-1">{s.title}</h3>
                <p className="text-text leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl space-y-6 text-text leading-relaxed">
          {INTRO.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="pt-4">
            <a
              href="mailto:info@andresmorales.com.co"
              className="btn-theme"
            >
              Free up your time. Let’s automate it.
            </a>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}