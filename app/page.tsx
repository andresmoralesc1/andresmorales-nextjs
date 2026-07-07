import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { ServicesIcons } from '@/components/sections/services-icons';
import { Skills } from '@/components/sections/skills';
import { Cta } from '@/components/sections/cta';
import { Experience } from '@/components/sections/experience';
import { HomeContact } from '@/components/sections/home-contact';

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