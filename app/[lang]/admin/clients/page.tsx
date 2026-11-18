import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getClients, getCompanies, getClientsAndCompaniesStats } from '@/lib/clients-companies-store';
import ClientsClient from './clients-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directorio de Clientes | Andrés Morales Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ company?: string; search?: string }>;
}) {
  const { lang } = await params;
  const sParams = searchParams ? await searchParams : {};
  const session = await requireServerAdmin(lang, `/${lang}/admin/clients`);

  const [clients, companies, stats] = await Promise.all([
    Promise.resolve(getClients()),
    Promise.resolve(getCompanies()),
    Promise.resolve(getClientsAndCompaniesStats()),
  ]);

  return (
    <ClientsClient
      initialClients={clients}
      initialCompanies={companies}
      initialStats={stats}
      initialCompanyFilter={sParams.company || ''}
      initialSearchQuery={sParams.search || ''}
      username={session.username}
      locale={lang}
    />
  );
}
