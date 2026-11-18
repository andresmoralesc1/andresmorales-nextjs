import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getProspectData } from '@/lib/prospect-store';
import ProspectingClient from './prospecting-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hunter de Prospectos & Auditoría E-commerce | Andrés Morales',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProspectingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await requireServerAdmin(lang, `/${lang}/admin/prospecting`);
  const data = getProspectData();

  return (
    <ProspectingClient
      initialProspects={data.prospects || []}
      lastSearch={data.lastSearch}
      username={session.username}
      locale={lang}
    />
  );
}
