'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import {
  Check,
  Plus,
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Video,
  Layers,
  Smartphone,
  Share2,
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

const MONTHLY_TIERS: MonthlyTier[] = [
  { id: 'none', name: 'Sin Acompañamiento Mensual', priceCop: 0, label: '$0 COP/mes' },
  { id: 'tier1', name: 'Tier 1: Pauta Inicial Meta/TikTok', priceCop: 450000, label: '$450.000 COP/mes' },
  { id: 'tier2', name: 'Tier 2: Escalamiento + Contenido IA', priceCop: 780000, label: '$780.000 COP/mes' },
  { id: 'tier3', name: 'Tier 3: Dominación Omnicanal', priceCop: 1450000, label: '$1.450.000 COP/mes' },
];

interface Addon {
  id: string;
  name: string;
  priceCop: number;
  desc: string;
  icon: string;
}

const ADDONS: Addon[] = [
  {
    id: 'ai_photos',
    name: 'Pack 10 Fotos de Estudio IA Nanobanana',
    priceCop: 150000,
    desc: 'Pedestales de concreto e iluminación 4K para 10 modelos de tu catálogo.',
    icon: '📸',
  },
  {
    id: 'ai_videos',
    name: 'Pack 3 Videos Cinematográficos Google Veo',
    priceCop: 250000,
    desc: 'Spots publicitarios en vertical listos con audio para Reels y TikTok Ads.',
    icon: '🎬',
  },
  {
    id: 'meta_catalog',
    name: 'Catálogo Instagram Shop & WhatsApp Business',
    priceCop: 100000,
    desc: 'Vinculación de productos para etiquetar zapatillas en tus historias y posts.',
    icon: '🛍️',
  },
  {
    id: 'sheets_sync',
    name: 'Sincronización en Vivo con Google Sheets',
    priceCop: 80000,
    desc: 'Actualiza tallas y precios desde un archivo de Excel/Sheets en tu celular.',
    icon: '📊',
  },
];

export function SneakerPackageBuilder({ lang = 'es' }: SneakerPackageBuilderProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>('tier2');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['ai_photos']);

  const basePriceCop = 500000;
  const selectedTier = MONTHLY_TIERS.find((t) => t.id === selectedTierId) || MONTHLY_TIERS[0];

  const addonsTotalCop = selectedAddonIds.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id);
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
    '/brief?type=web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const getWhatsAppMessage = () => {
    const addonNames = selectedAddonIds
      .map((id) => ADDONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `Hola Andrés, configuré mi paquete de e-commerce de tenis personalizado:\n- Tienda Base en Next.js: $500.000 COP\n- Plan Mensual: ${selectedTier.name} (${formatCop(monthlyTotalCop)})\n${addonNames ? `- Extras: ${addonNames} (${formatCop(addonsTotalCop)})\n` : ''}\nInversión Única de Desarrollo: ${formatCop(oneTimeTotalCop)}\nInversión Mensual: ${formatCop(monthlyTotalCop)}\n\n¿Cuándo podemos agendar el kickoff?`;

    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="rounded-3xl bg-primary border-2 border-theme-1/40 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-theme-1/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 relative">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-2">
          <Sliders className="w-3.5 h-3.5" /> CONFIGURADOR INTERACTIVO A MEDIDA
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary">
          Arma tu Paquete Ideal & Cotiza en Vivo
        </h3>
        <p className="text-xs sm:text-sm text-secondary/70 mt-1">
          Personaliza tu solución combinando la tienda base con el nivel de pauta y contenido que mejor se adapte a tu meta de ventas.
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
                  Paso 01 // Base Obligatoria
                </span>
                <span className="text-xs font-mono font-black text-secondary">
                  $500.000 COP (Único)
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-secondary">
                Tienda E-Commerce Headless en Next.js 15
              </h4>
              <p className="text-xs text-secondary/70 mt-1 leading-relaxed">
                Carga &lt;0.8s, catálogo de tenis, selector de tallas US/Col, Wompi, Nequi, Addi a 3 cuotas, contraentrega y hosting vitalicio de $0 COP.
              </p>
            </div>
          </div>

          {/* STEP 2: MONTHLY TIER SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-secondary/80 flex items-center gap-1.5">
                <span>Paso 02 // Acompañamiento Mensual (Retainer)</span>
              </label>
              <span className="text-[11px] font-mono text-theme-1 font-bold">
                Opcional pero recomendado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MONTHLY_TIERS.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-theme-1 bg-theme-1/10 shadow-sm'
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
              Paso 03 // Addons & Producción de Contenido (Pago Único)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ADDONS.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isChecked
                        ? 'border-secondary bg-secondary text-primary shadow-sm'
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
                      <span className="font-medium">{isChecked ? '✓ Añadido' : '+ Añadir'}</span>
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
                  RESUMEN DE PROPUESTA
                </span>
                <h4 className="font-heading text-xl font-bold text-primary mt-0.5">
                  Tu Cotización en Tiempo Real
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-theme-1 text-secondary text-[10px] font-mono font-bold">
                Transparente
              </span>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-primary/80">
                <span>Tienda Base Next.js (Código Propio):</span>
                <span className="font-mono font-bold text-primary">$500.000 COP</span>
              </div>

              {selectedAddonIds.length > 0 && (
                <div className="flex justify-between items-center text-primary/80">
                  <span>Extras seleccionados ({selectedAddonIds.length}):</span>
                  <span className="font-mono font-bold text-theme-1">+{formatCop(addonsTotalCop)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-primary/70 block">Inversión Única de Desarrollo</span>
                  <span className="text-[10px] text-primary/50">Entrega en 2-3 semanas</span>
                </div>
                <span className="font-mono text-2xl font-black text-primary">
                  {formatCop(oneTimeTotalCop)}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-primary/70 block">Acompañamiento Mensual</span>
                  <span className="text-[10px] text-primary/50">{selectedTier.name}</span>
                </div>
                <span className="font-mono text-xl font-black text-theme-1">
                  {formatCop(monthlyTotalCop)}
                  <span className="text-xs font-normal text-primary/70">/mes</span>
                </span>
              </div>
            </div>

            {/* Value Guarantees */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-[11px] text-primary/80">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>$0 COP en licencias de Shopify o servidores mensuales.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cobro automático Addi, Nequi, Wompi y Contra Entrega.</span>
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
                <span>💬 Enviar Cotización a WhatsApp</span>
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
                <span>📋 Enviar requerimientos en Brief Web (3 min)</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
