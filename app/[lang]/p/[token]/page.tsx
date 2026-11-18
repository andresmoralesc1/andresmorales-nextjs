import { notFound } from 'next/navigation';
import { getProposalByToken } from '@/lib/crm-store';
import ProposalClient from './proposal-client';
import type { Metadata } from 'next';

export async function generateMetadata(props: {
  params: Promise<{ lang: string; token: string }>;
}): Promise<Metadata> {
  const { token } = await props.params;
  const proposal = getProposalByToken(token);
  if (!proposal) return { title: 'Propuesta no encontrada — Andrés Morales' };

  return {
    title: `${proposal.title} — Andrés Morales`,
    description: `Propuesta de proyecto para ${proposal.clientName} (${proposal.clientCompany || 'Servicios Profesionales'}).`,
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage(props: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { lang, token } = await props.params;
  const proposal = getProposalByToken(token);

  if (!proposal) {
    notFound();
  }

  return <ProposalClient initialProposal={proposal} lang={lang} />;
}
