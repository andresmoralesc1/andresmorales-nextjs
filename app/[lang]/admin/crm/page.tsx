import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getCrmData } from '@/lib/crm-store';
import { getEvolutionStatus } from '@/lib/evolution';
import CrmDashboardClient from './crm-dashboard-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard CRM & Clientes | Andrés Morales',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCrmPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{
    tab?: string;
    to?: string;
    name?: string;
    subject?: string;
    body?: string;
  }>;
}) {
  const { lang } = await params;
  const sParams = searchParams ? await searchParams : {};
  const session = await requireServerAdmin(lang, `/${lang}/admin/crm`);
  const [data, evoStatus] = await Promise.all([
    getCrmData(),
    getEvolutionStatus(),
  ]);

  const validTabs = ['pipeline', 'briefs', 'proposals', 'email', 'automations'] as const;
  const initialTab = validTabs.includes(sParams?.tab as any)
    ? (sParams.tab as typeof validTabs[number])
    : 'pipeline';

  const initialEmailDraft = {
    to: sParams?.to || '',
    name: sParams?.name || '',
    subject: sParams?.subject || '',
    body: sParams?.body || '',
  };

  return (
    <CrmDashboardClient
      initialLeads={data.leads}
      initialEmailLogs={data.emailLogs}
      initialProposals={data.proposals || []}
      initialAutomationSettings={data.automationSettings}
      initialEvoStatus={evoStatus}
      initialTab={initialTab}
      initialEmailDraft={initialEmailDraft}
      username={session.username}
      locale={lang}
    />
  );
}
