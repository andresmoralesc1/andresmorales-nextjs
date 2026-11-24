import CoreHero, { type HeroLocaleData } from '@/components/ui/syntra-hero';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';

// Section 1 of home — Syntra 3D Hero:
// Isometric 3D core with AM monogram logo, interactive level exploration,
// localized copy, former CTAs (Hablemos calendar booking & Auditoría anchor),
// contact badges, and authority metrics strip.
export async function Hero() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  const availableText =
    locale === 'en'
      ? 'Available for projects · Q1 2026'
      : locale === 'pt'
      ? 'Disponível para projetos · Q1 2026'
      : 'Disponible para proyectos · Q1 2026';

  const stages =
    locale === 'en'
      ? [
          { title: 'E-commerce & Stores', apps: ['Shopify', 'Next.js', 'Google'] },
          { title: 'Web Development & Edge', apps: ['Next.js', 'GitHub', 'Google'] },
          { title: 'Artificial Intelligence', apps: ['Claude', 'OpenAI', 'Gemini'] },
          { title: 'Automation & Workflows', apps: ['n8n', 'Zapier', 'WhatsApp'] },
          { title: 'Data & Outcomes', apps: ['Excel', 'Google', 'Shopify'] },
        ]
      : locale === 'pt'
      ? [
          { title: 'E-commerce & Lojas', apps: ['Shopify', 'Next.js', 'Google'] },
          { title: 'Desenvolvimento Web & Edge', apps: ['Next.js', 'GitHub', 'Google'] },
          { title: 'Inteligência Artificial', apps: ['Claude', 'OpenAI', 'Gemini'] },
          { title: 'Automação & Fluxos', apps: ['n8n', 'Zapier', 'WhatsApp'] },
          { title: 'Dados & Resultados', apps: ['Excel', 'Google', 'Shopify'] },
        ]
      : [
          { title: 'E-commerce & Tiendas', apps: ['Shopify', 'Next.js', 'Google'] },
          { title: 'Desarrollo Web & Edge', apps: ['Next.js', 'GitHub', 'Google'] },
          { title: 'Inteligencia Artificial', apps: ['Claude', 'OpenAI', 'Gemini'] },
          { title: 'Automatización & Flujos', apps: ['n8n', 'Zapier', 'WhatsApp'] },
          { title: 'Datos & Resultados', apps: ['Excel', 'Google', 'Shopify'] },
        ];

  const metrics = [
    {
      value: '+500 hrs/m',
      label:
        locale === 'en'
          ? 'Saved in manual tasks'
          : locale === 'pt'
          ? 'Economizadas / mês'
          : 'Ahorro en tareas',
    },
    {
      value: '17 Apps',
      label:
        locale === 'en'
          ? 'Live in production'
          : locale === 'pt'
          ? 'Em produção ativa'
          : 'En producción real',
    },
    {
      value: '100 / 100',
      label:
        locale === 'en'
          ? 'Google PageSpeed'
          : locale === 'pt'
          ? 'Pontuação PageSpeed'
          : 'Google PageSpeed',
    },
  ];

  const heroData: HeroLocaleData = {
    locale,
    name: dict.homeHero.name,
    role1: dict.homeHero.role1,
    role2: dict.homeHero.role2,
    cta: dict.homeHero.cta,
    auditCta: dict.homeHero.auditCta || (locale === 'en' ? 'Audit' : locale === 'pt' ? 'Auditoria' : 'Auditoría'),
    availableText,
    email: 'info@andresmorales.com.co',
    whatsapp: 'https://wa.me/573161482507',
    calendarUrl: CALENDAR_BOOKING_URL,
    levelsText: locale === 'en' ? 'Levels:' : locale === 'pt' ? 'Níveis:' : 'Niveles:',
    closeText: locale === 'en' ? 'Close' : locale === 'pt' ? 'Fechar' : 'Cerrar',
    hintHover:
      locale === 'en'
        ? 'Hover or select an architectural level'
        : locale === 'pt'
        ? 'Passe o cursor ou selecione um nível'
        : 'Pasa el cursor o selecciona un nivel',
    hintTap:
      locale === 'en'
        ? 'Tap to select an architectural level'
        : locale === 'pt'
        ? 'Toque para selecionar um nível'
        : 'Toca para seleccionar un nivel',
    activeBadge: locale === 'en' ? 'Active' : locale === 'pt' ? 'Ativo' : 'Activo',
    coreBadge: locale === 'en' ? 'AI Core' : 'Core IA',
    stages,
    metrics,
  };

  return <CoreHero withNavbar={false} heroData={heroData} />;
}
