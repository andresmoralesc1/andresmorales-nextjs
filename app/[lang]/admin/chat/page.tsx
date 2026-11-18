import { requireServerAdmin } from '@/lib/admin-auth-server';
import { getCrmData } from '@/lib/crm-store';
import { getEvolutionStatus, getEvolutionChats } from '@/lib/evolution';
import ChatInboxClient from './chat-inbox-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Chat & Mensajería | Andrés Morales Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await requireServerAdmin(lang, `/${lang}/admin/chat`);

  const [status, rawChats, crmData] = await Promise.all([
    getEvolutionStatus(),
    getEvolutionChats(),
    Promise.resolve(getCrmData()),
  ]);

  const leads = crmData?.leads || [];

  const initialChats = rawChats.map((chat) => {
    const chatDigits = chat.phone.replace(/\D/g, '');
    const matchedLead = leads.find((l) => {
      if (!l.phone) return false;
      const leadDigits = l.phone.replace(/\D/g, '');
      if (!leadDigits || !chatDigits) return false;
      return (
        chatDigits === leadDigits ||
        chatDigits.endsWith(leadDigits) ||
        leadDigits.endsWith(chatDigits)
      );
    });

    return {
      ...chat,
      lead: matchedLead
        ? {
            id: matchedLead.id,
            name: matchedLead.name,
            status: matchedLead.status,
            score: matchedLead.score,
            service: matchedLead.service,
          }
        : null,
    };
  });

  return (
    <ChatInboxClient
      initialChats={initialChats}
      initialStatus={status}
      initialSettings={crmData?.automationSettings || {}}
      username={session.username}
      locale={lang}
    />
  );
}
