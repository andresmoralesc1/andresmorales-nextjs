import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProspectBySlug, recordProspectView, notifyAuditView } from '@/lib/prospect-store';
import { generateDefaultAiAutomationProposal, detectLanguageFromCountry } from '@/lib/prospect-auditor';
import AuditClient from './audit-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const prospect = getProspectBySlug(slug);

  if (!prospect) {
    return {
      title: 'Auditoría no encontrada — Andrés Morales',
      robots: { index: false, follow: false },
    };
  }

  // The brief is created in the client's native language
  const clientLang = (prospect.lang as 'es' | 'en' | 'pt') || detectLanguageFromCountry(prospect.country);
  const effectiveLang: 'es' | 'en' | 'pt' = clientLang || 'es';

  const titleText =
    effectiveLang === 'en'
      ? `Technical Diagnostic & Web Performance: ${prospect.name} — Andrés Morales`
      : effectiveLang === 'pt'
      ? `Diagnóstico Técnico & Performance: ${prospect.name} — Andrés Morales`
      : `Diagnóstico & Rendimiento Web: ${prospect.name} — Andrés Morales`;

  const descText =
    effectiveLang === 'en'
      ? `Confidential technical audit, mobile speed, and AI automation proposal for ${prospect.name}.`
      : effectiveLang === 'pt'
      ? `Auditoria técnica confidencial, performance mobile e proposta de automação para ${prospect.name}.`
      : `Auditoría técnica confidencial de velocidad móvil, conversión y arquitectura para ${prospect.name}.`;

  return {
    title: titleText,
    description: descText,
    robots: { index: false, follow: false },
    openGraph: {
      title: titleText,
      description: descText,
      images: prospect.screenshotUrl
        ? [{ url: prospect.screenshotUrl, width: 390, height: 844, alt: `Auditoría ${prospect.name}` }]
        : [{ url: 'https://andresmorales.com.co/logo-wp.png', width: 196, height: 94, alt: 'Andrés Morales' }],
    },
  };
}

export default async function AuditPage(props: Props) {
  const { lang, slug } = await props.params;
  const sParams = props.searchParams ? await props.searchParams : {};
  const prospect = getProspectBySlug(slug);

  if (!prospect) {
    notFound();
  }

  // Increment view telemetry and send Telegram alert
  const updatedProspect = recordProspectView(slug) || prospect;
  notifyAuditView(updatedProspect).catch((err) => {
    console.error('[AuditPage] Telemetry alert failed:', err);
  });

  // The brief is personal to this client: it is created in their native language
  const clientLang = (updatedProspect.lang as 'es' | 'en' | 'pt') || detectLanguageFromCountry(updatedProspect.country);
  const queryLang = sParams.lang && ['es', 'en', 'pt'].includes(sParams.lang) ? (sParams.lang as 'es' | 'en' | 'pt') : null;
  const effectiveLang: 'es' | 'en' | 'pt' = queryLang || clientLang || 'es';

  const defaultCurrency: 'COP' | 'USD' =
    effectiveLang === 'es' && (updatedProspect.country || '').toLowerCase().includes('colombia')
      ? 'COP'
      : 'USD';

  // Use the client's proposal; fallback if not stored
  const aiProposal =
    updatedProspect.audit?.aiAutomationProposal ||
    generateDefaultAiAutomationProposal({
      businessName: updatedProspect.name,
      category: updatedProspect.category,
      platform: updatedProspect.audit?.platform || 'Servicios / Negocio',
      hasWhatsApp: updatedProspect.audit?.hasWhatsAppFloating,
      lang: effectiveLang,
    });

  return (
    <AuditClient
      prospect={updatedProspect}
      lang={effectiveLang}
      defaultCurrency={defaultCurrency}
      isAnglophone={effectiveLang === 'en'}
      aiProposal={aiProposal}
    />
  );
}
