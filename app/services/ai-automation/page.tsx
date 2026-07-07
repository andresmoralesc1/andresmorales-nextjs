import type { Metadata } from 'next';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'AI Automation',
  description:
    'AI-powered automations, chatbots and digital agents that save hours every week. Built on real workflow analysis, not hype.',
  path: '/services/ai-automation',
});

const CAPABILITIES = [
  {
    title: 'Workflow Audit',
    desc: 'I sit with your team and map every repetitive step — from inbox triage to onboarding to fulfillment. The audit ends with a prioritized backlog of automations ranked by ROI.',
  },
  {
    title: 'AI Agents & Chatbots',
    desc: 'Conversational agents that answer customer questions, qualify leads, and route work to the right human. Built on OpenAI, Anthropic, or open-source models via streaming APIs.',
  },
  {
    title: 'n8n & Make Automations',
    desc: 'No-code and low-code flows that connect your CRM, email, calendar, sheets, and SaaS tools. Trigger to action, end to end, with logging and retry handling.',
  },
  {
    title: 'E-commerce Automation',
    desc: 'Bulk product uploads, AI-generated descriptions and images from phone snapshots, multi-platform publishing. The 90→15 minute case study you saw in the portfolio — engineered for real stores.',
  },
  {
    title: 'Lead Generation & Nurture',
    desc: 'AI-driven scraping, enrichment, and personalized cold outreach that reads like a 1:1 message. Warm leads land in your CRM, ready for your sales team to close.',
  },
  {
    title: 'Custom Integrations',
    desc: 'Webhooks, REST and GraphQL APIs, OAuth flows, background jobs. When the SaaS you need doesn’t exist, I build the bridge that does the job.',
  },
];

const APPROACH = [
  'Every project starts with the workflow, not the tool. I dig into how your team actually works today, where time is leaking, and which automations pay for themselves in weeks — not quarters.',
  'Once the backlog is locked, I ship in small, observable pieces. Every flow has a dashboard, every error has an alert, every retry has a story.',
  'I treat prompts like code: version-controlled, evaluated against golden datasets, and rolled back when they drift. No black boxes on my watch.',
  'Your data stays where it belongs. Self-hosted models when privacy or cost demands it, third-party APIs when speed to ship matters more.',
  'After launch, I monitor what real traffic teaches and iterate. The first version is the start of the conversation, not the end of the project.',
];

const STACK = [
  'OpenAI / Anthropic / Ollama / vLLM',
  'n8n / Make / Zapier',
  'Telegram / Slack / WhatsApp Business APIs',
  'Airtable / Notion / Google Sheets',
  'HubSpot / Pipedrive / Close / Brevo / Mailchimp',
  'WooCommerce / Shopify / Stripe webhooks',
  'PostgreSQL + Prisma / Drizzle',
  'Docker / self-hosted VPS',
];

export default function AiAutomationPage() {
  return (
    <>
      {/* Hero */}
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-ai" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl mb-4">AI Automation</h1>
            <p className="text-text text-lg">
              Repetitive work, off the team’s plate. AI agents, no-code
              flows, and custom integrations that pay for themselves —
              measured in hours, not hype.
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
            What I build
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
              Have a workflow to automate? Let’s talk.
            </a>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="section bg-theme-5">
        <div className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            My stack
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-text">
            {STACK.map((t) => (
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
