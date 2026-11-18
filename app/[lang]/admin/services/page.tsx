import React from 'react';
import { requireServerAdmin } from '@/lib/admin-auth-server';
import { AdminShell } from '@/components/admin/admin-shell';
import {
  BarChart3,
  Mail,
  Zap,
  MessageSquare,
  Globe,
  Palette,
  ExternalLink,
  ShieldCheck,
  Server,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicios & Cloud | Andrés Morales Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await requireServerAdmin(lang, `/${lang}/admin/services`);

  const cloudServices = [
    {
      title: 'Métricas Umami',
      desc: 'Plataforma privada y auto-hospedada de analíticas web para andresmorales.com.co sin cookies invasivas.',
      href: 'https://umami.andresmorales.com.co',
      domain: 'umami.andresmorales.com.co',
      badge: 'Auto-hospedado',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: BarChart3,
      iconBg: 'bg-blue-500/10 text-blue-600',
      status: '🟢 Activo (Docker)',
    },
    {
      title: 'Webmail Mailcow',
      desc: 'Servidor de correo corporativo seguro para info@andresmorales.com.co con panel SOGo y antispam.',
      href: 'https://mail.cleida.com.co',
      domain: 'mail.cleida.com.co',
      badge: 'Correo IMAP / SMTP',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Mail,
      iconBg: 'bg-amber-500/10 text-amber-600',
      status: '🟢 Activo (Mailcow)',
    },
    {
      title: 'Automatizaciones n8n',
      desc: 'Orquestador visual de flujos de trabajo, webhooks entrantes de leads, conexión con Telegram y agentes IA.',
      href: 'https://n8n.andresmorales.com.co',
      domain: 'n8n.andresmorales.com.co',
      badge: 'Workflows & IA',
      badgeColor: 'bg-orange-100 text-orange-800',
      icon: Zap,
      iconBg: 'bg-[#f96e03]/10 text-[#f96e03]',
      status: '🟢 Activo (n8n)',
    },
    {
      title: 'Evolution API (Manager)',
      desc: 'API de WhatsApp Baileys para la línea +57 316 148 2507 con webhooks hacia el CRM y Telegram.',
      href: 'https://evo.andresmorales.com.co/manager',
      domain: 'evo.andresmorales.com.co',
      badge: 'Instancia AM (+57 316 148 2507)',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: MessageSquare,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      status: '🟢 Activo (Evolution API v2)',
    },
  ];

  const publicPortals = [
    {
      title: 'Sitio Web Principal',
      desc: 'Portafolio comercial, casos de estudio, brief wizard y cotizador web.',
      href: 'https://andresmorales.com.co',
      domain: 'andresmorales.com.co',
      badge: 'Producción',
      badgeColor: 'bg-stone-100 text-stone-800',
      icon: Globe,
      iconBg: 'bg-stone-500/10 text-stone-700',
    },
    {
      title: 'Galería de Arte AmArt',
      desc: 'Galería 3D interactiva en Three.js con la colección de arte digital y bocetos.',
      href: 'https://amart.andresmorales.com.co',
      domain: 'amart.andresmorales.com.co',
      badge: 'Subdominio 3D',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Palette,
      iconBg: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <AdminShell
      username={session.username}
      locale={lang}
      title="Servicios & Cloud"
      subtitle="Hub centralizado de servidores, plataformas externas y servicios auto-hospedados"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section 1: Cloud & Infrastructure */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#f96e03]" />
            <h2 className="text-base font-bold text-[#1E1810]">
              Infraestructura & Plataformas Cloud
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cloudServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.href}
                  className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${svc.iconBg}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1E1810]">{svc.title}</h3>
                          <p className="text-xs font-mono text-stone-400">{svc.domain}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${svc.badgeColor}`}>
                        {svc.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#575250] leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">
                      {svc.status}
                    </span>
                    <a
                      href={svc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#1E1810] text-[#1E1810] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Abrir Panel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Public Portals */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-stone-600" />
            <h2 className="text-base font-bold text-[#1E1810]">
              Portales Web Públicos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicPortals.map((site) => {
              const Icon = site.icon;
              return (
                <div
                  key={site.href}
                  className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${site.iconBg}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1E1810]">{site.title}</h3>
                          <p className="text-xs font-mono text-stone-400">{site.domain}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${site.badgeColor}`}>
                        {site.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#575250] leading-relaxed">
                      {site.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end">
                    <a
                      href={site.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#1E1810] text-[#1E1810] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Visitar Sitio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
