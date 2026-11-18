import { redirect } from 'next/navigation';
import { requireServerAdmin } from '@/lib/admin-auth-server';

export default async function AdminRootPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await requireServerAdmin(lang, `/${lang}/admin/crm`);
  redirect(`/${lang}/admin/crm`);
}
