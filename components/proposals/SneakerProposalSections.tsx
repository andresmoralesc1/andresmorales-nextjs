'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { track } from '@/lib/analytics';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { Volume2, VolumeX, Sparkles, Smartphone, Video as VideoIcon } from 'lucide-react';
import { SneakerRoiCalculator } from '@/components/proposals/SneakerRoiCalculator';
import { SneakerDmVsWebComparison } from '@/components/proposals/SneakerDmVsWebComparison';
import { SneakerLogisticsFaq } from '@/components/proposals/SneakerLogisticsFaq';
import { SneakerBeforeAfterSlider } from '@/components/proposals/SneakerBeforeAfterSlider';
import { SneakerPackageBuilder } from '@/components/proposals/SneakerPackageBuilder';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  priceCop: string;
  priceUsd: string;
  timeline: string;
  popular?: boolean;
  features: string[];
}

interface BaseOffer {
  badge: string;
  title: string;
  subtitle: string;
  priceCop: string;
  priceUsd: string;
  tagline: string;
  timeline: string;
  hostingBadge: string;
  hostingDesc: string;
  sslBadge: string;
  sslDesc: string;
  domainBadge: string;
  domainDesc: string;
  features: string[];
  cta: string;
}

interface SneakerProposalSectionsProps {
  baseOffer: BaseOffer;
  diagnostic: {
    badge: string;
    title: string;
    intro: string;
    stats: Array<{ value: string; label: string; desc: string }>;
    comparisonTitle: string;
    comparisonSubtitle: string;
    standard: { title: string; badge: string; points: string[] };
    proposed: { title: string; badge: string; points: string[] };
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    list: Array<{ icon: string; title: string; desc: string; highlight: string }>;
  };
  roadmap: {
    badge: string;
    title: string;
    subtitle: string;
    weeks: Array<{ week: string; title: string; deliverables: string[] }>;
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    selectPlan: string;
    timelineLabel: string;
    plans: Plan[];
  };
  guarantees: {
    badge: string;
    title: string;
    items: Array<{ title: string; desc: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    whatsappBtn: string;
    callBtn: string;
    printBtn: string;
  };
  lang: string;
}

export function SneakerProposalSections({
  baseOffer,
  diagnostic,
  features,
  roadmap,
  pricing,
  guarantees,
  cta,
  lang,
}: SneakerProposalSectionsProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('tier2');
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideoMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

  const selectedPlan =
    pricing.plans.find((p) => p.id === selectedPlanId) || pricing.plans[1];

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    track('proposal_plan_selected', {
      plan_id: plan.id,
      plan_name: plan.name,
      price: currency === 'COP' ? plan.priceCop : plan.priceUsd,
    });
  };

  const getWhatsAppLink = (customText?: string) => {
    const phone = '573161482507';
    const text =
      customText ||
      `Hola Andrés, estuve revisando la propuesta de la tienda de tenis. Quiero arrancar con la web base ($500.000 COP) y el plan mensual *${selectedPlan.name}* (${selectedPlan.priceCop}). ¿Cuándo podemos agendar el kickoff?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const getBaseWebWhatsAppLink = () => {
    const phone = '573161482507';
    const text =
      `Hola Andrés, vi la propuesta de la web en Next.js por $500.000 COP (hosting vitalicio y SSL incluido). Quiero contratar el desarrollo base para mi tienda de tenis.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const briefWebLink = getLocalizedPath(
    '/brief?type=web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-16 md:space-y-20">
      {/* ============================================================
          BLOQUE 1: LA OFERTA BASE DIRECTA ($500.000 COP — PAGO ÚNICO)
          Inmediatamente después del Hero para eliminar fricción
         ============================================================ */}
      <section id="desarrollo-base" className="scroll-mt-20">
        <div className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="px-3.5 py-1 rounded-full text-xs font-secondary font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs">
              ⚡ PASO 1: TU TIENDA EN NEXT.JS // PAGO ÚNICO
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Hosting Vitalicio • SSL Vitalicio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8 pb-8 border-b border-theme-9">
            <div className="lg:col-span-8">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-secondary tracking-tight mb-3">
                {baseOffer.title}
              </h2>
              <p className="text-sm sm:text-base text-secondary/80 leading-relaxed max-w-2xl font-normal mb-6">
                Construida con la misma tecnología y rendimiento de la demo superior. Carga en menos de 0.8s en celulares para compras rápidas por impulso desde Instagram Ads y TikTok.
              </p>

              {/* 3 Micro-pills de confianza */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🌐 Hosting Vitalicio Edge
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    Serverless en Cloudflare/Vercel. $0 mensualidades de servidor.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🔒 SSL de por Vida
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    Candado de seguridad permanente incluido sin costos anuales.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🏷️ Dominio Propio
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    A tu nombre (~$45.000 COP/año). Cero ataduras a terceros.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="lg:col-span-4 bg-theme-5 rounded-2xl p-6 sm:p-7 border-2 border-secondary/15 text-center flex flex-col justify-center items-center shadow-xs">
              <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary/70 mb-1">
                Inversión Única de Desarrollo
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-secondary tracking-tight mb-1">
                {currency === 'COP' ? baseOffer.priceCop : baseOffer.priceUsd}
              </div>
              <p className="text-[11px] font-secondary font-bold text-secondary/60 mb-5">
                Código 100% de tu propiedad • Entrega en 2 a 3 semanas
              </p>

              <a
                href={getBaseWebWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('proposal_whatsapp_clicked', {
                    plan_id: 'base_development',
                    price: baseOffer.priceCop,
                  });
                }}
                className="btn-theme w-full py-3.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg text-center"
              >
                💬 Contratar Tienda Base
              </a>

              <Link
                href={briefWebLink}
                onClick={() => {
                  track('proposal_brief_clicked', {
                    source: 'base_offer_card',
                  });
                }}
                className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-secondary font-bold text-secondary/75 hover:text-secondary hover:bg-theme-1/10 rounded-full transition-colors text-center"
              >
                <span>📋 Llenar Brief Web (3 min)</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Grid compacto de inclusiones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-[13px] text-secondary/85 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Next.js 15 (Carga &lt;0.8s en 4G)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Hero interactivo 3D breakout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Catálogo con filtros por silueta y talla</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Matriz de tallas (US / EU / Col / CM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Wompi, PSE, Addi a cuotas y Contraentrega</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-1 font-black">✓</span>
              <span>Capacitación en video para tu equipo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SIMULADOR DE ROI / AMORTIZACIÓN EN PARES Y DÍAS
         ============================================================ */}
      <SneakerRoiCalculator lang={lang} />

      {/* ============================================================
          COMPARATIVA DM DE INSTAGRAM VS E-COMMERCE NEXT.JS
         ============================================================ */}
      <SneakerDmVsWebComparison lang={lang} />

      {/* ============================================================
          BLOQUE 2: LOS 3 TIERS MENSUALES (ADS, CONTENIDO IA & VENTAS)
          Visualmente nítido, con currency switcher y selector ágil
         ============================================================ */}
      <section id="inversion" className="scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-secondary font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-3">
            🚀 PASO 2: ACOMPAÑAMIENTO MENSUAL // RETAINERS
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary tracking-tight mb-2">
            Elige tu Plan de Crecimiento & Ads
          </h2>
          <p className="text-sm sm:text-base text-secondary/80 leading-relaxed font-normal mb-5">
            Una tienda sin visitas no factura. Nos encargamos de que vendas a diario con pauta publicitaria en Meta/TikTok y producciones de video de cine generadas con IA (<strong>Nanobanana, Veo 2 y Veo 3</strong>).
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex rounded-xl bg-theme-5 p-1 border border-secondary/15">
            <button
              type="button"
              onClick={() => setCurrency('COP')}
              className={`px-3.5 py-1.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-lg transition-all ${
                currency === 'COP'
                  ? 'bg-secondary text-primary shadow-xs'
                  : 'text-secondary/70 hover:text-secondary'
              }`}
            >
              🇨🇴 COP
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-lg transition-all ${
                currency === 'USD'
                  ? 'bg-secondary text-primary shadow-xs'
                  : 'text-secondary/70 hover:text-secondary'
              }`}
            >
              🇺🇸 USD
            </button>
          </div>
        </div>

        {/* 3 TIERS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {pricing.plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer ${
                  plan.popular
                    ? 'bg-secondary text-primary ring-2 ring-theme-1 shadow-xl lg:-translate-y-1.5'
                    : 'bg-primary text-secondary border-2 border-secondary/15 shadow-xs hover:border-theme-1/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-theme-1 text-secondary text-[11px] font-secondary font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-xl font-bold">
                      {plan.name}
                    </h3>
                    <input
                      type="radio"
                      name="planSelect"
                      checked={isSelected}
                      onChange={() => handleSelectPlan(plan)}
                      className="accent-theme-1 w-4 h-4 cursor-pointer"
                      aria-label={`Seleccionar plan ${plan.name}`}
                    />
                  </div>

                  <p
                    className={`text-xs mb-4 ${
                      plan.popular
                        ? 'text-primary/75'
                        : 'text-secondary/70'
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="mb-5 pb-5 border-b border-theme-9/40">
                    <div className="font-mono text-3xl font-black tracking-tight mb-0.5">
                      {currency === 'COP' ? plan.priceCop : plan.priceUsd}
                      <span className="text-xs font-secondary font-bold tracking-normal uppercase ml-1 opacity-70">
                        / mes
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono ${plan.popular ? 'text-primary/70' : 'text-secondary/70'}`}>
                      <span>Sin cláusulas de permanencia • Cancela cuando quieras</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs sm:text-[13px] font-medium leading-snug">
                        <span className="text-theme-1 font-black mt-0.5">✓</span>
                        <span
                          className={
                            plan.popular
                              ? 'text-primary/90'
                              : 'text-secondary/85'
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Button */}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    track('proposal_whatsapp_clicked', {
                      plan_id: plan.id,
                      price: currency === 'COP' ? plan.priceCop : plan.priceUsd,
                    });
                  }}
                  className={`w-full py-3.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider text-center block transition-all shadow-md ${
                    plan.popular
                      ? 'bg-theme-1 hover:bg-theme-2 text-secondary'
                      : 'bg-secondary hover:bg-secondary/90 text-primary'
                  }`}
                >
                  💬 Elegir este Plan Mensual
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          BLOQUE 3: CASO REAL // DEL CELULAR A CAMPAÑA PUBLICITARIA
          Flujo de 3 pasos: Foto mano -> Foto estudio IA -> Video Veo
         ============================================================ */}
      <section className="rounded-3xl bg-secondary text-primary p-6 sm:p-8 md:p-10 shadow-2xl border border-secondary overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-theme-1 text-secondary font-bold shadow-xs mb-3">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            CASO REAL // DEL CELULAR A CAMPAÑA PUBLICITARIA
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black mt-1 text-primary tracking-tight">
            ¿Cómo pasamos de una foto casera a un comercial de cine?
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-primary/75 mt-2 leading-relaxed">
            Una sesión tradicional con estudio, fotógrafo, luces y modelos cuesta más de $3.000.000 COP por drop. Mira este ejemplo real con una zapatilla <strong>Nike Tuned Air</strong>: tú solo tomas la foto con tu teléfono y la IA generativa de nuestros planes mensuales hace todo el resto.
          </p>
        </div>

        {/* 3 STEPS VISUAL PIPELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-8">
          
          {/* PASO 1: FOTO CON CELULAR */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-white/10 text-primary/90 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-theme-1" /> PASO 01
                </span>
                <span className="text-[10px] font-mono text-primary/60">Foto Original</span>
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/10">
                <Image
                  src="/sneakers/ai-pipeline/1-raw-mobile-web.jpg"
                  alt="Zapatilla fotografiada con mano en bodega"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white/90 border border-white/10">
                  📱 Foto con celular
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                Tomas la foto en bodega o casa
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                Solo necesitas sostener el par con tu mano. Cero cámaras profesionales, cero alquiler de estudio y cero edición manual por tu parte.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-emerald-400 font-bold">⏱️ 2 segundos</span>
              <span>$0 en producción</span>
            </div>
          </div>

          {/* PASO 2: RENDER DE ESTUDIO IA */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-theme-1 text-secondary flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" /> PASO 02 // NANOBANANA
                </span>
                <span className="text-[10px] font-mono text-theme-1 font-bold">Set 4K</span>
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/10">
                <Image
                  src="/sneakers/ai-pipeline/2-ai-studio-web.jpg"
                  alt="Zapatilla sobre pedestal de concreto generada con IA"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-theme-1 border border-theme-1/30">
                  🍌 Render Nanobanana
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                Estudio fotográfico virtual 4K
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                Eliminamos la mano y el fondo casero. Colocamos la zapatilla en un pedestal de concreto con iluminación publicitaria suave manteniendo texturas y colores 100% fieles.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-theme-1 font-bold">✨ Resolución 2048px</span>
              <span>Listo para catálogo</span>
            </div>
          </div>

          {/* PASO 3: VIDEO CINEMÁTICO GOOGLE VEO */}
          <div className="rounded-2xl bg-white/5 border-2 border-theme-1/60 p-4 sm:p-5 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-theme-1 text-secondary flex items-center gap-1.5 shadow-2xs">
                  <VideoIcon className="w-3.5 h-3.5" /> PASO 03 // GOOGLE VEO
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">● Video Ad Activo</span>
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-black border border-white/15 shadow-2xl">
                <video
                  ref={videoRef}
                  src="/sneakers/ai-pipeline/3-ai-video-web.mp4"
                  poster="/sneakers/ai-pipeline/video-poster.jpg"
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Audio Mute/Unmute Control Overlay */}
                <button
                  type="button"
                  onClick={toggleVideoMute}
                  className="absolute bottom-2.5 right-2.5 z-20 bg-secondary/85 hover:bg-secondary text-primary p-2 rounded-full border border-white/20 shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95 flex items-center gap-1 text-[10px] font-mono font-bold"
                  title={isVideoMuted ? 'Activar sonido comercial' : 'Silenciar video'}
                >
                  {isVideoMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-primary/70" />
                      <span className="hidden sm:inline">Activar Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-theme-1 animate-pulse" />
                      <span className="hidden sm:inline text-theme-1">Audio ON</span>
                    </>
                  )}
                </button>

                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white/90 border border-white/10">
                  🎬 Google Veo 2 / 3
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                Video de cine que para el scroll
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                Generamos tomas macro con paneo a la cápsula de aire, movimiento de cámara en curva y física de iluminación de comercial de Nike, listo para pautar en Reels y TikTok Ads.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-emerald-400 font-bold">🚀 4x más clics en Ads</span>
              <span>Incluido en Tiers 2 & 3</span>
            </div>
          </div>
        </div>

        {/* COMPARADOR INTERACTIVO ANTES Y DESPUÉS */}
        <div className="mb-8">
          <SneakerBeforeAfterSlider />
        </div>

        {/* BOTTOM METRICS BAR */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              💰
            </span>
            <div>
              <p className="text-xs font-bold text-primary">Ahorro de $3M+ por Drop</p>
              <p className="text-[11px] text-primary/70">Sin fotógrafos, estudios ni modelos presenciales.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-primary">Velocidad Instantánea</p>
              <p className="text-[11px] text-primary/70">Publicamos campañas el mismo día que te llega mercancía.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              📈
            </span>
            <div>
              <p className="text-xs font-bold text-primary">ROAS Superior en Pauta</p>
              <p className="text-[11px] text-primary/70">Videos dinámicos generan hasta 300% más retención en TikTok y Meta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONFIGURADOR INTERACTIVO A MEDIDA & COTIZADOR EN VIVO
         ============================================================ */}
      <SneakerPackageBuilder lang={lang} />

      {/* ============================================================
          BLOQUE 4: PROFUNDIDAD TÉCNICA Y ROADMAP (EXPANDIBLE / ACORDEÓN)
          Para no cansar al cliente que va directo a comprar, pero
          disponible en 1 clic para el cliente analítico
         ============================================================ */}
      <section className="bg-primary rounded-3xl border border-secondary/15 p-6 sm:p-8 shadow-xs">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-theme-5 text-secondary flex items-center justify-center font-bold text-sm border border-secondary/15">
              {showTechnicalDetails ? '−' : '+'}
            </span>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-theme-1 transition-colors">
                {showTechnicalDetails ? 'Ocultar Diagnóstico Técnico & Roadmap' : '¿Deseas ver el Diagnóstico de Mercado, Arquitectura y Cronograma?'}
              </h3>
              <p className="text-xs text-secondary/60">
                {showTechnicalDetails ? 'Haz clic para colapsar' : 'Haz clic aquí para desplegar el análisis comparativo y fases de entrega'}
              </p>
            </div>
          </div>
          <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary px-3 py-1 rounded-lg bg-theme-5 group-hover:bg-theme-1 group-hover:text-secondary transition-colors hidden sm:inline-block">
            {showTechnicalDetails ? 'Colapsar ▴' : 'Ver detalles ▾'}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-8 pt-8 border-t border-theme-9 space-y-12 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Diagnóstico */}
            <div>
              <span className="text-xs font-mono font-bold uppercase text-theme-1 block mb-2">
                01. DIAGNÓSTICO
              </span>
              <h4 className="font-heading text-xl font-bold text-secondary mb-3">
                {diagnostic.title}
              </h4>
              <p className="text-xs sm:text-sm text-secondary/80 leading-relaxed mb-6">
                {diagnostic.intro}
              </p>

              {/* Stats en 4 cajitas compactas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {diagnostic.stats.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-theme-5 border border-secondary/10">
                    <p className="font-mono text-2xl font-black text-secondary">{s.value}</p>
                    <p className="text-[11px] font-bold text-secondary uppercase">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Comparativa compacta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-theme-5 border border-red-200">
                  <p className="text-xs font-bold text-red-800 uppercase mb-2">✕ E-commerce Tradicional (Shopify/Woo)</p>
                  <ul className="space-y-1.5 text-xs text-secondary/80">
                    {diagnostic.standard.points.slice(0, 3).map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-theme-5 border-2 border-theme-1">
                  <p className="text-xs font-bold text-secondary uppercase mb-2">✓ Solución Headless Next.js</p>
                  <ul className="space-y-1.5 text-xs text-secondary font-medium">
                    {diagnostic.proposed.points.slice(0, 3).map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Cronograma en 5 pastillas compactas */}
            <div>
              <span className="text-xs font-mono font-bold uppercase text-theme-1 block mb-2">
                02. CRONOGRAMA DE ENTREGAS
              </span>
              <h4 className="font-heading text-xl font-bold text-secondary mb-4">
                Fases de Construcción y Lanzamiento
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roadmap.weeks.map((w, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-theme-5 border border-secondary/10">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-secondary text-primary inline-block mb-1.5">
                      {w.week}
                    </span>
                    <p className="text-xs font-bold text-secondary mb-1">{w.title}</p>
                    <p className="text-[11px] text-secondary/70 leading-snug">
                      {w.deliverables[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          LOGÍSTICA COLOMBIANA & PREGUNTAS FRECUENTES (FAQ)
         ============================================================ */}
      <SneakerLogisticsFaq lang={lang} />

      {/* ============================================================
          BLOQUE 5: GARANTÍAS Y CIERRE EJECUTIVO (DIRECTO A LA ACCIÓN)
         ============================================================ */}
      <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {guarantees.items.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-theme-5 border border-secondary/10 flex items-start gap-3">
              <span className="text-xl text-theme-1">★</span>
              <div>
                <p className="text-xs font-heading font-bold text-secondary">{item.title}</p>
                <p className="text-[11px] text-secondary/70 leading-snug mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner Central */}
        <div className="bg-secondary text-primary rounded-2xl p-6 sm:p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="font-heading text-2xl font-bold text-primary mb-1">
              ¿Listo para empezar a vender?
            </h3>
            <p className="text-xs sm:text-sm text-primary/75">
              Hablemos por WhatsApp para afinar los detalles de tu catálogo y agendar el kickoff.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track('proposal_whatsapp_clicked', {
                  plan_id: selectedPlan.id,
                  source: 'final_cta',
                });
              }}
              className="btn-theme w-full sm:w-auto px-7 py-3.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg text-center"
            >
              💬 Iniciar por WhatsApp
            </a>

            <Link
              href={briefWebLink}
              onClick={() => {
                track('proposal_brief_clicked', {
                  source: 'final_cta_banner',
                });
              }}
              className="w-full sm:w-auto px-5 py-3.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-full bg-theme-1 text-secondary hover:bg-theme-1/90 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              📋 Llenar Brief Web
            </Link>

            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track('cta_clicked', {
                  source: 'sneaker_proposal_calendar',
                });
              }}
              className="w-full sm:w-auto px-5 py-3.5 text-xs font-secondary font-bold uppercase tracking-wider rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-secondary transition-all text-center"
            >
              📅 Agendar Llamada
            </a>

            <button
              type="button"
              onClick={handlePrint}
              aria-label="Imprimir propuesta"
              className="hidden sm:inline-flex p-3 text-xs text-primary/70 hover:text-primary rounded-full hover:bg-white/10 transition-colors"
            >
              🖨️
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          STICKY MOBILE CONVERSION BAR (Solo en pantallas móviles)
          Para que el cliente siempre tenga el botón de compra a mano
         ============================================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-secondary/95 backdrop-blur-md p-3 border-t border-secondary sm:hidden flex items-center justify-between shadow-2xl pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div>
          <span className="text-[10px] text-primary/60 font-mono block">Tienda Next.js Base</span>
          <span className="text-sm font-mono font-black text-theme-1">$500.000 COP</span>
        </div>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-theme px-4 py-2.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider shadow-md"
        >
          💬 Aprobar por WhatsApp
        </a>
      </div>
    </div>
  );
}
