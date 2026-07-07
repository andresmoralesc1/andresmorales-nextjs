'use client';

import { useEffect, useRef, useState } from 'react';

// "My Experience" timeline — interactive with viewport-entry animation
const JOBS = [
  {
    dates: '2022 - Present',
    role: 'AI Automation Consultant',
    company: 'HubIAgency',
    href: undefined as string | undefined,
    desc: 'AI Automation Consultant – Business-Driven, Systems-Minded. Founded and managed a successful side project focused on building e-commerce websites and implementing AI-powered solutions to enhance brand presence and business efficiency. Over time, I transitioned from design to automation — learning and applying AI tools to streamline processes, improve customer experience, and increase operational impact. I now focus on automating workflows, integrating AI agents, and continuously exploring emerging technologies to deliver smarter, scalable solutions. I manage projects end-to-end, collaborating closely with clients to understand their goals and translate them into high-impact digital systems.',
  },
  {
    dates: '2022 - 2024',
    role: 'Executive Search Consultant',
    company: 'Tortorici & Partners',
    href: 'https://tortorici-partners.com/',
    desc: 'Innovative leadership in executive search across diverse sectors—Agricultural & Soft Commodities, Biofuels, Commodity Trade Finance, Fertilizers, Metals & Mining, Oil & Energy, and Shipping. Instrumental in establishing Tortorici & Partners as a premier Executive-Search Company, fostering growth through strategic initiatives. Cultivated enduring relationships with key clients, solidifying our leadership position in the market. My role spans successful placements, contributing to the establishment of 25 executive roles in the last year and maintaining connections with over 50 key clients, affirming our status as leaders in executive search.',
  },
  {
    dates: '2020 - 2024',
    role: 'UX Analyst',
    company: 'Telus International',
    href: undefined,
    desc: 'NDA — (non-disclosure agreements)',
  },
  {
    dates: '2018 - 2021',
    role: 'Sales Associate',
    company: 'Andean Traders Internacional S.A.S',
    href: 'https://andeantraders.com/',
    desc: 'Elevated Acoa’s digital presence as E-commerce web creator, crafting compelling content and visuals for heightened brand appeal, resulting in increased engagement and sales. Orchestrated online strategies, propelling Acoa to new heights. Led online platform management, contributing substantially to brand augmentation, resulting in noteworthy sales growth.',
  },
  {
    dates: '2017 - 2021',
    role: 'Marketing Graphic Designer',
    company: 'AcoA Design',
    href: 'https://acoadesign.com/',
    desc: 'High-performing B2B Sales Representative excelling in client engagement and decision-driving conversations. Adept at identifying client needs, articulating product benefits, and steering pivotal purchase decisions. Proven track record of spearheading strategic sales initiatives, resulting in a remarkable 22% boost in annual sales revenue. Exceptional skills in client relations, communication, and business growth. Bilingual proficiency in Spanish enhances versatility in diverse business environments.',
  },
  {
    dates: '2014 - 2018',
    role: 'Co-founder — Customer support & Sales',
    company: 'Home Squad',
    href: undefined,
    desc: 'Strategically orchestrated cleaning personnel deployment across diverse South American cities, ensuring top-tier service excellence. Pioneered meticulous recruitment initiatives, selecting qualified cleaning staff. Exceeded expectations for Tier 1 clients through strategic team deployment and recruitment, achieving exceptional customer satisfaction. Managed seamless coordination of cleaning personnel, upholding stringent service standards, and demonstrated unwavering commitment to excellence in customer support.',
  },
];

function TimelineItem({ job, index, isLeft }: { job: typeof JOBS[0]; index: number; isLeft: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className={`relative pl-8 md:pl-0 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${
        isLeft
          ? 'md:pr-[calc(50%+1.5rem)] md:text-right'
          : 'md:pl-[calc(50%+1.5rem)]'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Dot con pulse */}
      <span className="absolute left-0 md:left-1/2 top-2 -translate-x-1/2 z-10">
        <span className="block w-3 h-3 rounded-full bg-theme-1 ring-4 ring-theme-5" />
        <span className="absolute inset-0 w-3 h-3 rounded-full bg-theme-1 animate-ping opacity-75" />
      </span>

      <div
        className={`group relative bg-primary border border-theme-9 rounded-xl p-5 shadow-sm hover:shadow-xl hover:border-theme-1 hover:-translate-y-1 transition-all duration-300 ${
          isLeft ? 'md:hover:-translate-x-1' : 'md:hover:translate-x-1'
        }`}
      >
        {/* Badge with number */}
        <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
          <span className="text-xs font-secondary font-bold text-theme-1 uppercase tracking-widest">
            {job.dates}
          </span>
          <span className="text-[10px] font-secondary font-bold text-text/60 uppercase tracking-wider">
            · #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="font-heading text-lg md:text-xl mb-1 text-secondary">
          {job.href ? (
            <a
              href={job.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-theme-1 transition-colors inline-flex items-center gap-1"
            >
              {job.role}
              <span className="text-theme-1 opacity-0 group-hover:opacity-100 transition-opacity text-sm">↗</span>
            </a>
          ) : (
            job.role
          )}
        </h3>

        <div className={`text-sm font-secondary font-bold text-theme-1 mb-2 ${isLeft ? 'md:text-right' : ''}`}>
          {job.company}
        </div>

        {job.desc && (
          <p className="text-sm text-text leading-relaxed">{job.desc}</p>
        )}

        {/* Decorative side line on hover */}
        <span className={`absolute top-0 bottom-0 w-0.5 bg-theme-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isLeft ? 'right-0 md:-right-px' : 'left-0 md:-left-px'
        }`} />
      </div>
    </li>
  );
}

export function Experience() {
  return (
    <section className="section bg-theme-5">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
            My Experience
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-3">
            A decade of building, learning, and shipping
          </h2>
          <p className="text-text max-w-2xl mx-auto">
            From sales floors to AI automation — every role taught me something
            I still use today.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical timeline line with gradient */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theme-9 to-transparent md:-translate-x-1/2" />

          <ul className="space-y-8 md:space-y-12">
            {JOBS.map((j, i) => (
              <TimelineItem
                key={i}
                job={j}
                index={i}
                isLeft={i % 2 === 0}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}