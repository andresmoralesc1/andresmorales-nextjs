import { requireServerAdmin } from '@/lib/admin-auth-server';
import AnalyticsDashboardClient from './analytics-client';

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await requireServerAdmin(lang, `/${lang}/admin/analytics`);

  return <AnalyticsDashboardClient username={session.username} locale={lang} />;
}
