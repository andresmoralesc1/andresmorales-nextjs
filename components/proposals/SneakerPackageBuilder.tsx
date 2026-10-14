'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import {
  Check,
  Sliders,
  ArrowRight,
} from 'lucide-react';

interface SneakerPackageBuilderProps {
  lang?: string;
}

interface MonthlyTier {
  id: string;
  name: string;
  priceCop: number;
  label: string;
}

interface Addon {
  id: string;
  name: string;
  priceCop: number;
  desc: string;
  icon: string;
}

export function SneakerPackageBuilder({ lang = 'es' }: SneakerPackageBuilderProps) {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const monthlyTiers: MonthlyTier[] = [
    {
      id: 'none',
      name: isEs
        ? 'Sin Acompañamiento Mensual'
        : isPt
          ? 'Sem Acompanhamento Mensal'
          : 'No Monthly Add-on',
      priceCop: 0,
      label: isEs ? '$0 COP/mes' : isPt ? '$0/mês' : '$0 / mo',
    },
    {
      id: 'tier1',
      name: isEs
        ? 'Tier 1: Pauta Inicial Meta/TikTok'
        : isPt
          ? 'Tier 1: Tráfego Inicial Meta/TikTok'
          : 'Tier 1: Initial Meta/TikTok Ads',
      priceCop: 450000,
      label: isEs ? '$450.000 COP/mes' : isPt ? '$450.000 COP/mês' : '$450,000 COP/mo (~$115 USD)',
    },
    {
      id: 'tier2',
      name: isEs
        ? 'Tier 2: Escalamiento + Contenido IA'
        : isPt
          ? 'Tier 2: Escala + Conteúdo IA'
          : 'Tier 2: Scale + AI Studio Content',
      priceCop: 780000,
      label: isEs ? '$780.000 COP/mes' : isPt ? '$780.000 COP/mês' : '$780,000 COP/mo (~$195 USD)',
    },
    {
      id: 'tier3',
      name: isEs
        ? 'Tier 3: Dominación Omnicanal'
        : isPt
          ? 'Tier 3: Dominação Omnichannel'
          : 'Tier 3: Omnichannel Domination',
      priceCop: 1450000,
      label: isEs ? '$1.450.000 COP/mes' : isPt ? '$1.450.000 COP/mês' : '$1,450,000 COP/mo (~$360 USD)',
    },
  ];

  const addons: Addon[] = [
    {
      id: 'ai_photos',
      name: isEs
        ? 'Pack 10 Fotos de Estudio IA Nanobanana'
        : isPt
          ? 'Pack 10 Fotos de Estúdio IA'
          : 'Pack 10 AI Studio Photos (Nanobanana)',
      priceCop: 150000,
      desc: isEs
        ? 'Pedestales de concreto e iluminación 4K para 10 modelos de tu catálogo.'
        : isPt
          ? 'Pedestais de concreto e iluminação 4K para 10 modelos do seu catálogo.'
          : 'Minimalist concrete pedestals and 4K lighting for 10 catalog silhouettes.',
      icon: '📸',
    },
    {
      id: 'ai_videos',
      name: isEs
        ? 'Pack 3 Videos Cinematográficos Google Veo'
        : isPt
          ? 'Pack 3 Vídeos Comerciais Google Veo'
          : 'Pack 3 Cinematic AI Videos (Google Veo)',
      priceCop: 250000,
      desc: isEs
        ? 'Spots publicitarios en vertical listos con audio para Reels y TikTok Ads.'
        : isPt
          ? 'Anúncios verticais prontos com áudio para Reels e TikTok Ads.'
          : 'Ready-to-run vertical video ads with sound engineered for Reels & TikTok.',
      icon: '🎬',
    },
    {
      id: 'meta_catalog',
      name: isEs
        ? 'Catálogo Instagram Shop & WhatsApp Business'
        : isPt
          ? 'Catálogo Instagram Shop & WhatsApp'
          : 'Instagram Shop & WhatsApp Business Catalog',
      priceCop: 100000,
      desc: isEs
        ? 'Vinculación de productos para etiquetar zapatillas en tus historias y posts.'
        : isPt
          ? 'Vinculação de produtos para marcar tênis em stories e publicações.'
          : 'Product sync to tag sneakers directly in Instagram stories, posts and WhatsApp.',
      icon: '🛍️',
    },
    {
      id: 'sheets_sync',
      name: isEs
        ? 'Sincronización en Vivo con Google Sheets'
        : isPt
          ? 'Sincronização com Google Sheets'
          : 'Live Sync with Google Sheets',
      priceCop: 80000,
      desc: isEs
        ? 'Actualiza tallas y precios desde un archivo de Excel/Sheets en tu celular.'
        : isPt
          ? 'Atualize tamanhos e preços direto de uma planilha no seu celular.'
          : 'Update sizes and prices directly from a simple spreadsheet on your phone.',
      icon: '📊',
    },
  ];

  const [selectedTierId, setSelectedTierId] = useState<string>('tier2');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['ai_photos']);

  const basePriceCop = 500000;
  const selectedTier = monthlyTiers.find((t) => t.id === selectedTierId) || monthlyTiers[0];

  const addonsTotalCop = selectedAddonIds.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon ? addon.priceCop : 0);
  }, 0);

  const oneTimeTotalCop = basePriceCop + addonsTotalCop;
  const monthlyTotalCop = selectedTier.priceCop;

  const formatCop = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const briefLink = getLocalizedPath(
    '/brief-web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const getWhatsAppMessage = () => {
    const addonNames = selectedAddonIds
      .map((id) => addons.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = isEs
      ? `Hola Andrés, configuré mi paquete de e-commerce de tenis personalizado:\n- Tienda Base en Next.js: $500.000 COP\n- Plan Mensual: ${selectedTier.name} (${formatCop(monthlyTotalCop)})\n${addonNames ? `- Extras: ${addonNames} (${formatCop(addonsTotalCop)})\n` : ''}\nInversión Única de Desarrollo: ${formatCop(oneTimeTotalCop)}\nInversión Mensual: ${formatCop(monthlyTotalCop)}\n\n¿Cuándo podemos agendar el kickoff?`
      : isPt
        ? `Olá Andrés, configurei meu pacote de e-commerce de tênis personalizado:\n- Loja Base Next.js: $500.000 COP\n- Plano Mensal: ${selectedTier.name} (${formatCop(monthlyTotalCop)})\n${addonNames ? `- Extras: ${addonNames} (${formatCop(addonsTotalCop)})\n` : ''}\nInvestimento Único: ${formatCop(oneTimeTotalCop)}\nInvestimento Mensal: ${formatCop(monthlyTotalCop)}\n\nPodemos agendar o kickoff?`
        : `Hi Andrés, I configured my custom sneaker e-commerce package:\n- Base Next.js Store: $500,000 COP (~$125 USD)\n- Monthly Plan: ${selectedTier.name} (${formatCop(monthlyTotalCop)})\n${addonNames ? `- Extras: ${addonNames} (${formatCop(addonsTotalCop)})\n` : ''}\nOne-time Investment: ${formatCop(oneTimeTotalCop)}\nMonthly Retainer: ${formatCop(monthlyTotalCop)}\n\nWhen can we schedule the kickoff?`;

    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="rounded-3xl bg-primary border-2 border-theme-1/40 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-theme-1/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 relative">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-2">
          <Sliders className="w-3.5 h-3.5" />
          {isEs
            ? 'CONFIGURADOR INTERACTIVO A MEDIDA'
            : isPt
              ? 'CONFIGURADOR INTERATIVO SOB MEDIDA'
              : 'INTERACTIVE CUSTOM CONFIGURATOR'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary">
          {isEs
            ? 'Arma tu Paquete Ideal & Cotiza en Vivo'
            : isPt
              ? 'Monte seu Pacote Ideal & Faça a Cotação ao Vivo'
              : 'Build Your Custom Package & Quote Live'}
        </h3>
        <p className="text-xs sm:text-sm text-secondary/70 mt-1">
          {isEs
            ? 'Personaliza tu solución combinando la tienda base con el nivel de pauta y contenido que mejor se adapte a tu meta de ventas.'
            : isPt
              ? 'Personalize sua solução combinando a loja base com o nível de tráfego e conteúdo que melhor se adapte às suas metas.'
              : 'Customize your setup by pairing the base store with the marketing and AI content tier that fits your sales goal.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Configurator Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: BASE STORE (INCLUDED) */}
          <div className="rounded-2xl p-4 sm:p-5 bg-theme-5 border-2 border-secondary/20 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 font-bold" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-theme-1 uppercase">
                  {isEs
                    ? 'Paso 01 // Base Obligatoria'
                    : isPt
                      ? 'Passo 01 // Base Obrigatória'
                      : 'Step 01 // Required Base Store'}
                </span>
                <span className="text-xs font-mono font-black text-secondary">
                  $500.000 COP {isEs ? '(Único)' : isPt ? '(Único)' : '(One-time)'}
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-secondary">
                {isEs
                  ? 'Tienda E-Commerce Headless en Next.js 15'
                  : isPt
                    ? 'Loja E-Commerce Headless em Next.js 15'
                    : 'Headless E-Commerce Store on Next.js 15'}
              </h4>
              <p className="text-xs text-secondary/70 mt-1 leading-relaxed">
                {isEs
                  ? 'Carga <0.8s, catálogo de tenis, selector de tallas US/Col, pasarelas de pago, contraentrega y hosting vitalicio de $0 COP.'
                  : isPt
                    ? 'Carregamento <0.8s, catálogo de tênis, seletor de numeração, gateways de pagamento e hospedagem vitalícia com $0 de mensalidade.'
                    : 'Sub-0.8s loading, full sneaker catalog, interactive sizing matrix, secure payment checkouts, and lifetime $0 cloud hosting.'}
              </p>
            </div>
          </div>

          {/* STEP 2: MONTHLY TIER SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-secondary/80 flex items-center gap-1.5">
                <span>
                  {isEs
                    ? 'Paso 02 // Acompañamiento Mensual (Retainer)'
                    : isPt
                      ? 'Passo 02 // Acompanhamento Mensal'
                      : 'Step 02 // Monthly Growth Retainer'}
                </span>
              </label>
              <span className="text-[11px] font-mono text-theme-1 font-bold">
                {isEs
                  ? 'Opcional pero recomendado'
                  : isPt
                    ? 'Opcional mas recomendado'
                    : 'Optional but recommended'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {monthlyTiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-theme-1 bg-theme-1/10 shadow-xs'
                        : 'border-secondary/15 bg-theme-5 hover:border-secondary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-secondary">{tier.name}</span>
                      <input
                        type="radio"
                        name="monthlyTierBuilder"
                        checked={isSelected}
                        onChange={() => setSelectedTierId(tier.id)}
                        className="accent-theme-1 w-4 h-4 cursor-pointer"
                        aria-label={`Seleccionar ${tier.name}`}
                      />
                    </div>
                    <span className="font-mono text-xs font-black text-secondary">
                      {tier.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: OPTIONAL ADDONS */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase text-secondary/80 block">
              {isEs
                ? 'Paso 03 // Addons & Producción de Contenido (Pago Único)'
                : isPt
                  ? 'Passo 03 // Add-ons & Produção de Conteúdo (Pagamento Único)'
                  : 'Step 03 // Add-ons & Content Production (One-Time)'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {addons.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isChecked
                        ? 'border-secondary bg-secondary text-primary shadow-xs'
                        : 'border-secondary/15 bg-theme-5 text-secondary hover:border-secondary/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{addon.icon}</span>
                        <span className={`font-mono text-[11px] font-bold ${isChecked ? 'text-theme-1' : 'text-secondary'}`}>
                          +{formatCop(addon.priceCop)}
                        </span>
                      </div>
                      <p className="font-heading font-bold text-xs leading-snug">
                        {addon.name}
                      </p>
                      <p className={`text-[11px] mt-1 leading-snug ${isChecked ? 'text-primary/70' : 'text-secondary/60'}`}>
                        {addon.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="font-medium">
                        {isChecked
                          ? (isEs ? '✓ Añadido' : isPt ? '✓ Adicionado' : '✓ Added')
                          : (isEs ? '+ Añadir' : isPt ? '+ Adicionar' : '+ Add')}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddon(addon.id)}
                        className="accent-theme-1 w-3.5 h-3.5 cursor-pointer"
                        aria-label={`Añadir ${addon.name}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Consolidated Quote Box (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl bg-secondary text-primary p-6 sm:p-7 shadow-2xl border-2 border-theme-1/50 space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-theme-1 font-bold">
                  {isEs ? 'RESUMEN DE PROPUESTA' : isPt ? 'RESUMO DA PROPOSTA' : 'PROPOSAL SUMMARY'}
                </span>
                <h4 className="font-heading text-xl font-bold text-primary mt-0.5">
                  {isEs ? 'Tu Cotización en Tiempo Real' : isPt ? 'Sua Cotação em Tempo Real' : 'Your Real-Time Quote'}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-theme-1 text-secondary text-[10px] font-mono font-bold">
                {isEs ? 'Transparente' : isPt ? 'Transparente' : 'Transparent'}
              </span>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-primary/80">
                <span>
                  {isEs
                    ? 'Tienda Base Next.js (Código Propio):'
                    : isPt
                      ? 'Loja Base Next.js (Código Próprio):'
                      : 'Base Next.js Store (100% Owned Code):'}
                </span>
                <span className="font-mono font-bold text-primary">$500.000 COP</span>
              </div>

              {selectedAddonIds.length > 0 && (
                <div className="flex justify-between items-center text-primary/80">
                  <span>
                    {isEs
                      ? `Extras seleccionados (${selectedAddonIds.length}):`
                      : isPt
                        ? `Extras selecionados (${selectedAddonIds.length}):`
                        : `Selected add-ons (${selectedAddonIds.length}):`}
                  </span>
                  <span className="font-mono font-bold text-theme-1">+{formatCop(addonsTotalCop)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-primary/70 block">
                    {isEs
                      ? 'Inversión Única de Desarrollo'
                      : isPt
                        ? 'Investimento Único de Desenvolvimento'
                        : 'One-Time Development Investment'}
                  </span>
                  <span className="text-[10px] text-primary/50">
                    {isEs
                      ? 'Entrega en 2-3 semanas'
                      : isPt
                        ? 'Entrega em 2-3 semanas'
                        : 'Delivery in 2-3 weeks'}
                  </span>
                </div>
                <span className="font-mono text-2xl font-black text-primary">
                  {formatCop(oneTimeTotalCop)}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-primary/70 block">
                    {isEs
                      ? 'Acompañamiento Mensual'
                      : isPt
                        ? 'Acompanhamento Mensal'
                        : 'Monthly Growth Retainer'}
                  </span>
                  <span className="text-[10px] text-primary/50">{selectedTier.name}</span>
                </div>
                <span className="font-mono text-xl font-black text-theme-1">
                  {formatCop(monthlyTotalCop)}
                  <span className="text-xs font-normal text-primary/70">
                    {isEs ? '/mes' : isPt ? '/mês' : '/mo'}
                  </span>
                </span>
              </div>
            </div>

            {/* Value Guarantees */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-[11px] text-primary/80">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {isEs
                    ? '$0 COP en licencias de Shopify o servidores mensuales.'
                    : isPt
                      ? 'Zero mensalidades de Shopify ou servidores dedicados.'
                      : '$0 monthly Shopify subscription or server hosting bills.'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {isEs
                    ? 'Cobro automático Addi, Nequi, Wompi y Contra Entrega.'
                    : isPt
                      ? 'Gateways de pagamento, parcelamento e entrega configurados.'
                      : 'Automated checkouts with card gateways, installments and cash on delivery.'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <a
                href={getWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('proposal_whatsapp_clicked', {
                    source: 'package_builder',
                    total_one_time: oneTimeTotalCop,
                    total_monthly: monthlyTotalCop,
                  });
                }}
                className="btn-theme w-full py-3.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>
                  {isEs
                    ? '💬 Enviar Cotización a WhatsApp'
                    : isPt
                      ? '💬 Enviar Cotação para WhatsApp'
                      : '💬 Send Quote to WhatsApp'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href={briefLink}
                onClick={() => {
                  track('proposal_brief_clicked', {
                    source: 'package_builder',
                  });
                }}
                className="w-full py-2.5 rounded-full text-xs font-secondary font-bold text-primary/80 hover:text-primary hover:bg-white/10 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <span>
                  {isEs
                    ? '📋 Enviar requerimientos en Brief Web (3 min)'
                    : isPt
                      ? '📋 Enviar requisitos no Brief Web (3 min)'
                      : '📋 Send Requirements in Web Brief (3 min)'}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
