import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getCrmData } from '@/lib/crm-store';
import { getEvolutionStatus } from '@/lib/evolution';
import CrmDashboardClient from '../crm/crm-dashboard-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automatizaciones & Agente IA | Andrés Morales',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAutomationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await requireServerAdmin(lang, `/${lang}/admin/automations`);
  const [data, evoStatus] = await Promise.all([
    getCrmData(),
    getEvolutionStatus(),
  ]);

  return (
    <CrmDashboardClient
      initialLeads={data.leads}
      initialEmailLogs={data.emailLogs}
      initialProposals={data.proposals || []}
      initialAutomationSettings={data.automationSettings}
      initialEvoStatus={evoStatus}
      initialTab="automations"
      username={session.username}
      locale={lang}
    />
  );
}
