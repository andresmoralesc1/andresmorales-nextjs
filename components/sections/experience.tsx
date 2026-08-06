import { getCurrentDictionary } from '@/lib/dictionary';
import { ExperienceClient } from '@/components/sections/experience.client';

// Server wrapper around the client `ExperienceClient`. Reads dictionary
// on the server (where the `x-locale` header is available), then passes
// the resolved strings down as props.
export async function Experience() {
  const d = await getCurrentDictionary();
  const jobs = [
    {
      dates: d.homeExperience.job1Dates,
      role: d.homeExperience.job1Role,
      company: d.homeExperience.job1Company,
      desc: d.homeExperience.job1Desc,
    },
    {
      dates: d.homeExperience.job2Dates,
      role: d.homeExperience.job2Role,
      company: d.homeExperience.job2Company,
      desc: d.homeExperience.job2Desc,
    },
    {
      dates: d.homeExperience.job3Dates,
      role: d.homeExperience.job3Role,
      company: d.homeExperience.job3Company,
      desc: d.homeExperience.job3Desc,
    },
    {
      dates: d.homeExperience.job4Dates,
      role: d.homeExperience.job4Role,
      company: d.homeExperience.job4Company,
      desc: d.homeExperience.job4Desc,
    },
    {
      dates: d.homeExperience.job5Dates,
      role: d.homeExperience.job5Role,
      company: d.homeExperience.job5Company,
      desc: d.homeExperience.job5Desc,
    },
    {
      dates: d.homeExperience.job6Dates,
      role: d.homeExperience.job6Role,
      company: d.homeExperience.job6Company,
      desc: d.homeExperience.job6Desc,
    },
  ];
  return (
    <ExperienceClient
      dict={{
        eyebrow: d.homeExperience.eyebrow,
        title: d.homeExperience.title,
        subtitle: d.homeExperience.subtitle,
        jobs,
      }}
    />
  );
}
