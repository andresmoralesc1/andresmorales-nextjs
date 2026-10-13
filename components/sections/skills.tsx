import { getCurrentDictionary } from '@/lib/dictionary';
import { SkillsClient } from '@/components/sections/skills.client';

// Server wrapper around the client `SkillsClient`. Reads the dictionary
// on the server (where the `x-locale` header is available), then passes
// the resolved strings down as props.
//
// Skill keys + percentages live in the client component (the chart
// shape is hardcoded there to keep the math simple). The dict only
// carries the human-readable labels.
export async function Skills() {
  const dict = await getCurrentDictionary();
  return (
    <SkillsClient
      eyebrow={dict.homeSkills.eyebrow}
      title={dict.homeSkills.title}
      subtitle={dict.homeSkills.subtitle}
      liveBadge={dict.homeSkills.liveBadge}
      dict={{
        n8n: dict.homeSkills.n8n,
        aiAgents: dict.homeSkills.aiAgents,
        llmApis: dict.homeSkills.llmApis,
        make: dict.homeSkills.make,
        nextReact: dict.homeSkills.nextReact,
        typescript: dict.homeSkills.typescript,
        vercelCloudflare: dict.homeSkills.vercelCloudflare,
        postgresPrisma: dict.homeSkills.postgresPrisma,
        python: dict.homeSkills.python,
        dockerInfra: dict.homeSkills.dockerInfra,
      }}
    />
  );
}