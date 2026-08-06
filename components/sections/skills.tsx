import { getCurrentDictionary } from '@/lib/dictionary';
import { SkillsClient } from '@/components/sections/skills.client';

// Server wrapper around the client `SkillsClient`. Reads the dictionary
// on the server (where the `x-locale` header is available), then passes
// the resolved strings down as props.
export async function Skills() {
  const dict = await getCurrentDictionary();
  return (
    <SkillsClient
      eyebrow={dict.homeSkills.eyebrow}
      title={dict.homeSkills.title}
      subtitle={dict.homeSkills.subtitle}
      liveBadge={dict.homeSkills.liveBadge}
      dict={{
        sales: dict.homeSkills.sales,
        webDesigner: dict.homeSkills.webDesigner,
        uxAnalyst: dict.homeSkills.uxAnalyst,
        wordpress: dict.homeSkills.wordpress,
        aiAgents: dict.homeSkills.aiAgents,
        aiAutomations: dict.homeSkills.aiAutomations,
        customerService: dict.homeSkills.customerService,
        prospecting: dict.homeSkills.prospecting,
        digitalMarketing: dict.homeSkills.digitalMarketing,
        photoshop: dict.homeSkills.photoshop,
      }}
    />
  );
}
