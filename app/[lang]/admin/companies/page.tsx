import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getClients, getCompanies, getClientsAndCompaniesStats } from '@/lib/clients-companies-store';
import CompaniesClient from './companies-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directorio de Empresas B2B | Andrés Morales Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCompaniesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ search?: string; industry?: string }>;
}) {
  const { lang } = await params;
  const sParams = searchParams ? await searchParams : {};
  const session = await requireServerAdmin(lang, `/${lang}/admin/companies`);

  const [clients, companies, stats] = await Promise.all([
    Promise.resolve(getClients()),
    Promise.resolve(getCompanies()),
    Promise.resolve(getClientsAndCompaniesStats()),
  ]);

  return (
    <CompaniesClient
      initialCompanies={companies}
      initialClients={clients}
      initialStats={stats}
      initialIndustryFilter={sParams.industry || ''}
      initialSearchQuery={sParams.search || ''}
      username={session.username}
      locale={lang}
    />
  );
}
