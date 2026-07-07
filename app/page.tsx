import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { ServicesIcons } from '@/components/sections/services-icons';
import { Skills } from '@/components/sections/skills';
import { Cta } from '@/components/sections/cta';
import { Experience } from '@/components/sections/experience';
import { HomeContact } from '@/components/sections/home-contact';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Andrés Morales — AI Automation Consultant',
  description:
    'AI consultant specialized in automation, chatbots, and digital transformation. Building automation flows that work — so you don’t have to.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ServicesIcons />
      <Skills />
      <Cta />
      <Experience />
      <HomeContact />
    </>
  );
}