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

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const t = {
    step1Badge: isEs
      ? '⚡ PASO 1: TU TIENDA EN NEXT.JS // PAGO ÚNICO'
      : isPt
        ? '⚡ PASSO 1: SUA LOJA EM NEXT.JS // PAGAMENTO ÚNICO'
        : '⚡ STEP 1: YOUR NEXT.JS STORE // ONE-TIME PAYMENT',
    lifetimePill: isEs
      ? 'Hosting Vitalicio • SSL Vitalicio'
      : isPt
        ? 'Hospedagem Vitalícia • SSL Vitalício'
        : 'Lifetime Edge Hosting • Lifetime SSL',
    oneTimeInvestment: isEs
      ? 'Inversión Única de Desarrollo'
      : isPt
        ? 'Investimento Único de Desenvolvimento'
        : 'One-Time Development Investment',
    ownershipDelivery: isEs
      ? 'Código 100% de tu propiedad • Entrega en 2 a 3 semanas'
      : isPt
        ? 'Código 100% de sua propriedade • Entrega em 2 a 3 semanas'
        : '100% Client-Owned Code • Delivery in 2 to 3 weeks',
    hireBaseStore: isEs
      ? '💬 Contratar Tienda Base'
      : isPt
        ? '💬 Contratar Loja Base'
        : '💬 Get Your Base Store',
    fillBrief: isEs
      ? '📋 Llenar Brief Web (3 min)'
      : isPt
        ? '📋 Preencher Briefing Web (3 min)'
        : '📋 Complete Web Brief (3 min)',
    step2Badge: isEs
      ? '🚀 PASO 2: ACOMPAÑAMIENTO MENSUAL // RETAINERS'
      : isPt
        ? '🚀 PASSO 2: ACOMPANHAMENTO MENSAL // RETAINERS'
        : '🚀 STEP 2: MONTHLY GROWTH PLANS // RETAINERS',
    choosePlan: isEs
      ? 'Elige tu Plan de Crecimiento & Ads'
      : isPt
        ? 'Escolha seu Plano de Crescimento & Ads'
        : 'Choose your Growth & Ads Plan',
    noCommitment: isEs
      ? 'Sin cláusulas de permanencia • Cancela cuando quieras'
      : isPt
        ? 'Sem fidelidade • Cancele quando quiser'
        : 'No lock-in contracts • Cancel anytime',
    perMonth: isEs ? '/ mes' : isPt ? '/ mês' : '/ mo',
    selectMonthlyPlan: isEs
      ? '💬 Elegir este Plan Mensual'
      : isPt
        ? '💬 Escolher este Plano Mensal'
        : '💬 Choose this Monthly Plan',
    caseBadge: isEs
      ? 'CASO REAL // DEL CELULAR A CAMPAÑA PUBLICITARIA'
      : isPt
        ? 'CASO REAL // DO CELULAR À CAMPANHA PUBLICITÁRIA'
        : 'REAL CASE STUDY // FROM PHONE TO AD CAMPAIGN',
    caseTitle: isEs
      ? '¿Cómo pasamos de una foto casera a un comercial de cine?'
      : isPt
        ? 'Como transformamos uma foto caseira em um comercial de cinema?'
        : 'How do we turn a quick mobile snap into a cinematic commercial?',
    caseDesc: isEs
      ? 'Una sesión tradicional con estudio, fotógrafo, luces y modelos cuesta más de $3.000.000 COP por drop. Mira este ejemplo real con una zapatilla Nike Tuned Air: tú solo tomas la foto con tu teléfono y la IA generativa de nuestros planes mensuales hace todo el resto.'
      : isPt
        ? 'Uma sessão tradicional com estúdio, fotógrafo, iluminação e modelos custa mais de R$ 4.000 por lançamento. Veja este exemplo real com o Nike Tuned Air: você só tira a foto no celular e a IA generativa dos nossos planos cuida de todo o resto.'
        : 'A traditional commercial shoot with a studio, photographer, lighting, and models costs upwards of $800+ USD per drop. Look at this real example with a Nike Tuned Air: you snap a photo on your phone, and the generative AI in our monthly plans handles the rest.',
    step1Tag: isEs ? 'PASO 01' : isPt ? 'PASSO 01' : 'STEP 01',
    step1Original: isEs ? 'Foto Original' : isPt ? 'Foto Original' : 'Raw Photo',
    step1Phone: isEs ? '📱 Foto con celular' : isPt ? '📱 Foto com celular' : '📱 Mobile photo',
    step1Heading: isEs
      ? 'Tomas la foto en bodega o casa'
      : isPt
        ? 'Tire a foto no estoque ou em casa'
        : 'Snap a photo in warehouse or home',
    step1Body: isEs
      ? 'Solo necesitas sostener el par con tu mano. Cero cámaras profesionales, cero alquiler de estudio y cero edición manual por tu parte.'
      : isPt
        ? 'Você só precisa segurar o par com a mão. Zero câmeras profissionais, zero aluguel de estúdio e zero edição manual sua.'
        : 'Just hold the sneaker in your hand. Zero professional cameras, zero studio rentals, and zero manual retouching from you.',
    step1Time: isEs ? '⏱️ 2 segundos' : isPt ? '⏱️ 2 segundos' : '⏱️ 2 seconds',
    step1Cost: isEs ? '$0 en producción' : isPt ? 'R$ 0 em produção' : '$0 production cost',
    step2Tag: isEs ? 'PASO 02 // NANOBANANA' : isPt ? 'PASSO 02 // NANOBANANA' : 'STEP 02 // NANOBANANA',
    step2Studio: isEs ? 'Set 4K' : isPt ? 'Set 4K' : '4K Set',
    step2Render: isEs ? '🍌 Render Nanobanana' : isPt ? '🍌 Render Nanobanana' : '🍌 Nanobanana Render',
    step2Heading: isEs
      ? 'Estudio fotográfico virtual 4K'
      : isPt
        ? 'Estúdio fotográfico virtual 4K'
        : 'Virtual 4K photo studio',
    step2Body: isEs
      ? 'Eliminamos la mano y el fondo casero. Colocamos la zapatilla en un pedestal de concreto con iluminación publicitaria suave manteniendo texturas y colores 100% fieles.'
      : isPt
        ? 'Removemos a mão e o fundo caseiro. Posicionamos o tênis em um pedestal de concreto com iluminação publicitária suave, mantendo texturas e cores 100% fiéis.'
        : 'We remove the hand and home background. We place the sneaker on a concrete pedestal with soft commercial lighting, preserving textures and colorways 100% faithfully.',
    step2Res: isEs ? '✨ Resolución 2048px' : isPt ? '✨ Resolução 2048px' : '✨ 2048px Resolution',
    step2Ready: isEs ? 'Listo para catálogo' : isPt ? 'Pronto para o catálogo' : 'Ready for catalog',
    step3Tag: isEs ? 'PASO 03 // GOOGLE VEO' : isPt ? 'PASSO 03 // GOOGLE VEO' : 'STEP 03 // GOOGLE VEO',
    step3Active: isEs ? '● Video Ad Activo' : isPt ? '● Video Ad Ativo' : '● Active Video Ad',
    step3Heading: isEs
      ? 'Video de cine que para el scroll'
      : isPt
        ? 'Vídeo cinematográfico que para o feed'
        : 'Thumb-stopping cinematic video ads',
    step3Body: isEs
      ? 'Generamos tomas macro con paneo a la cápsula de aire, movimiento de cámara en curva y física de iluminación de comercial de Nike, listo para pautar en Reels y TikTok Ads.'
      : isPt
        ? 'Criamos tomadas macro com sweep na cápsula de ar, câmera em curva e iluminação de comercial de ponta da Nike, pronto para Reels e TikTok Ads.'
        : 'We generate macro pans on the air bubble, sweeping camera movements, and cinematic studio lighting matching Nike ad spots, ready for Reels and TikTok Ads.',
    step3Clicks: isEs ? '🚀 4x más clics en Ads' : isPt ? '🚀 4x mais cliques em Ads' : '🚀 4x more clicks in Ads',
    step3Included: isEs ? 'Incluido en Tiers 2 & 3' : isPt ? 'Incluso nos Tiers 2 & 3' : 'Included in Tiers 2 & 3',
    audioMuted: isEs ? 'Activar Audio' : isPt ? 'Ativar Áudio' : 'Unmute Audio',
    audioOn: isEs ? 'Audio ON' : isPt ? 'Áudio ON' : 'Audio ON',
    audioTitleMuted: isEs ? 'Activar sonido comercial' : isPt ? 'Ativar som comercial' : 'Enable commercial audio',
    audioTitleOn: isEs ? 'Silenciar video' : isPt ? 'Silenciar vídeo' : 'Mute video',
    metric1Title: isEs ? 'Ahorro de $3M+ por Drop' : isPt ? 'Economia de R$ 4K+ por Drop' : 'Save $800+ USD per Drop',
    metric1Desc: isEs ? 'Sin fotógrafos, estudios ni modelos presenciales.' : isPt ? 'Sem fotógrafos, estúdios ou modelos presenciais.' : 'Zero studio rentals, photographers, or on-site models.',
    metric2Title: isEs ? 'Velocidad Instantánea' : isPt ? 'Velocidade Instantânea' : 'Instant Turnaround',
    metric2Desc: isEs ? 'Publicamos campañas el mismo día que te llega mercancía.' : isPt ? 'Campanhas no ar no mesmo dia em que o estoque chega.' : 'Launch campaigns the exact same day your inventory arrives.',
    metric3Title: isEs ? 'ROAS Superior en Pauta' : isPt ? 'ROAS Superior em Mídia' : 'Superior Ad ROAS',
    metric3Desc: isEs ? 'Videos dinámicos generan hasta 300% más retención en TikTok y Meta.' : isPt ? 'Vídeos dinâmicos geram até 300% mais retenção no TikTok e Meta.' : 'Dynamic video creates up to 300% longer retention on TikTok & Meta.',
    toggleDetailsOpen: isEs ? 'Ocultar Diagnóstico Técnico & Roadmap' : isPt ? 'Ocultar Diagnóstico Técnico & Cronograma' : 'Hide Technical Diagnostic & Roadmap',
    toggleDetailsClosed: isEs ? '¿Deseas ver el Diagnóstico de Mercado, Arquitectura y Cronograma?' : isPt ? 'Deseja ver o Diagnóstico de Mercado, Arquitetura e Cronograma?' : 'Want to view Market Diagnostic, Architecture & Roadmap?',
    toggleDetailsSubOpen: isEs ? 'Haz clic para colapsar' : isPt ? 'Clique para recolher' : 'Click to collapse',
    toggleDetailsSubClosed: isEs ? 'Haz clic aquí para desplegar el análisis comparativo y fases de entrega' : isPt ? 'Clique para expandir a análise comparativa e fases de entrega' : 'Click here to expand competitive analysis and delivery milestones',
    toggleCollapseBtn: isEs ? 'Colapsar ▴' : isPt ? 'Recolher ▴' : 'Collapse ▴',
    toggleExpandBtn: isEs ? 'Ver detalles ▾' : isPt ? 'Ver detalhes ▾' : 'View details ▾',
    readyToSellTitle: isEs ? '¿Listo para empezar a vender?' : isPt ? 'Pronto para começar a vender?' : 'Ready to start selling?',
    readyToSellSub: isEs ? 'Hablemos por WhatsApp para afinar los detalles de tu catálogo y agendar el kickoff.' : isPt ? 'Fale conosco pelo WhatsApp para alinhar detalhes do seu catálogo e agendar o kickoff.' : 'Let us connect on WhatsApp to refine your catalog specifics and lock in the kickoff date.',
    startWhatsapp: isEs ? '💬 Iniciar por WhatsApp' : isPt ? '💬 Iniciar pelo WhatsApp' : '💬 Start on WhatsApp',
    fillBriefBtn: isEs ? '📋 Llenar Brief Web' : isPt ? '📋 Preencher Briefing Web' : '📋 Complete Web Brief',
    bookCallBtn: isEs ? '📅 Agendar Llamada' : isPt ? '📅 Agendar Chamada' : '📅 Book a Call',
    printAria: isEs ? 'Imprimir propuesta' : isPt ? 'Imprimir proposta' : 'Print proposal',
    stickyTitle: isEs ? 'Tienda Next.js Base' : isPt ? 'Loja Next.js Base' : 'Base Next.js Store',
    stickyApprove: isEs ? '💬 Aprobar por WhatsApp' : isPt ? '💬 Aprovar pelo WhatsApp' : '💬 Approve via WhatsApp',
  };

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
      (isEs
        ? `Hola Andrés, estuve revisando la propuesta de la tienda de tenis. Quiero arrancar con la web base ($500.000 COP) y el plan mensual *${selectedPlan.name}* (${selectedPlan.priceCop}). ¿Cuándo podemos agendar el kickoff?`
        : isPt
          ? `Olá Andrés, estive revisando a proposta da loja de tênis. Quero iniciar com a loja base ($500.000 COP) e o plano mensal *${selectedPlan.name}* (${currency === 'COP' ? selectedPlan.priceCop : selectedPlan.priceUsd}). Quando podemos agendar o kickoff?`
          : `Hi Andrés, I've reviewed the sneaker store proposal. I want to start with the base store ($500,000 COP / ~$125 USD) and the monthly *${selectedPlan.name}* plan (${currency === 'COP' ? selectedPlan.priceCop : selectedPlan.priceUsd}). When can we schedule the kickoff?`);
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const getBaseWebWhatsAppLink = () => {
    const phone = '573161482507';
    const text = isEs
      ? `Hola Andrés, vi la propuesta de la web en Next.js por $500.000 COP (hosting vitalicio y SSL incluido). Quiero contratar el desarrollo base para mi tienda de tenis.`
      : isPt
        ? `Olá Andrés, vi a proposta da loja em Next.js por $500.000 COP (hospedagem vitalícia e SSL incluído). Quero contratar o desenvolvimento base para minha loja de tênis.`
        : `Hi Andrés, I saw the Next.js sneaker store proposal ($500,000 COP / ~$125 USD with lifetime hosting and SSL included). I'd like to hire the base development for my sneaker store.`;
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
              {t.step1Badge}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.lifetimePill}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8 pb-8 border-b border-theme-9">
            <div className="lg:col-span-8">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-secondary tracking-tight mb-3">
                {baseOffer.title}
              </h2>
              <p className="text-sm sm:text-base text-secondary/80 leading-relaxed max-w-2xl font-normal mb-6">
                {baseOffer.subtitle}
              </p>

              {/* 3 Micro-pills de confianza */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🌐 {baseOffer.hostingBadge}
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    {baseOffer.hostingDesc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🔒 {baseOffer.sslBadge}
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    {baseOffer.sslDesc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-theme-5 border border-secondary/10">
                  <p className="text-xs font-secondary font-bold text-secondary uppercase mb-0.5">
                    🏷️ {baseOffer.domainBadge}
                  </p>
                  <p className="text-[11px] text-secondary/70 leading-snug">
                    {baseOffer.domainDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="lg:col-span-4 bg-theme-5 rounded-2xl p-6 sm:p-7 border-2 border-secondary/15 text-center flex flex-col justify-center items-center shadow-xs">
              <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary/70 mb-1">
                {t.oneTimeInvestment}
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-secondary tracking-tight mb-1">
                {currency === 'COP' ? baseOffer.priceCop : baseOffer.priceUsd}
              </div>
              <p className="text-[11px] font-secondary font-bold text-secondary/60 mb-5">
                {t.ownershipDelivery}
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
                {baseOffer.cta || t.hireBaseStore}
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
                <span>{t.fillBrief}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Grid compacto de inclusiones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-[13px] text-secondary/85 font-medium">
            {(baseOffer.features || []).slice(0, 6).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-theme-1 font-black">✓</span>
                <span>{feat}</span>
              </div>
            ))}
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
            {t.step2Badge}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary tracking-tight mb-2">
            {pricing.title || t.choosePlan}
          </h2>
          <p className="text-sm sm:text-base text-secondary/80 leading-relaxed font-normal mb-5">
            {pricing.subtitle}
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
                      aria-label={
                        isEs
                          ? `Seleccionar plan ${plan.name}`
                          : isPt
                            ? `Selecionar plano ${plan.name}`
                            : `Select plan ${plan.name}`
                      }
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
                        {t.perMonth}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono ${plan.popular ? 'text-primary/70' : 'text-secondary/70'}`}>
                      <span>{t.noCommitment}</span>
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
                  {pricing.selectPlan || t.selectMonthlyPlan}
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
            {t.caseBadge}
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black mt-1 text-primary tracking-tight">
            {t.caseTitle}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-primary/75 mt-2 leading-relaxed">
            {t.caseDesc}
          </p>
        </div>

        {/* 3 STEPS VISUAL PIPELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-8">
          
          {/* PASO 1: FOTO CON CELULAR */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-white/10 text-primary/90 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-theme-1" /> {t.step1Tag}
                </span>
                <span className="text-[10px] font-mono text-primary/60">{t.step1Original}</span>
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/10">
                <Image
                  src="/sneakers/ai-pipeline/1-raw-mobile-web.jpg"
                  alt="Raw sneaker mobile snapshot"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white/90 border border-white/10">
                  {t.step1Phone}
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                {t.step1Heading}
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                {t.step1Body}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-emerald-400 font-bold">{t.step1Time}</span>
              <span>{t.step1Cost}</span>
            </div>
          </div>

          {/* PASO 2: RENDER DE ESTUDIO IA */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-theme-1 text-secondary flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" /> {t.step2Tag}
                </span>
                <span className="text-[10px] font-mono text-theme-1 font-bold">{t.step2Studio}</span>
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/10">
                <Image
                  src="/sneakers/ai-pipeline/2-ai-studio-web.jpg"
                  alt="Sneaker 4K AI studio render"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-theme-1 border border-theme-1/30">
                  {t.step2Render}
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                {t.step2Heading}
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                {t.step2Body}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-theme-1 font-bold">{t.step2Res}</span>
              <span>{t.step2Ready}</span>
            </div>
          </div>

          {/* PASO 3: VIDEO CINEMÁTICO GOOGLE VEO */}
          <div className="rounded-2xl bg-white/5 border-2 border-theme-1/60 p-4 sm:p-5 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-theme-1 text-secondary flex items-center gap-1.5 shadow-2xs">
                  <VideoIcon className="w-3.5 h-3.5" /> {t.step3Tag}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">{t.step3Active}</span>
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
                  title={isVideoMuted ? t.audioTitleMuted : t.audioTitleOn}
                >
                  {isVideoMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-primary/70" />
                      <span className="hidden sm:inline">{t.audioMuted}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-theme-1 animate-pulse" />
                      <span className="hidden sm:inline text-theme-1">{t.audioOn}</span>
                    </>
                  )}
                </button>

                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white/90 border border-white/10">
                  🎬 Google Veo 2 / 3
                </div>
              </div>

              <h4 className="font-heading text-base sm:text-lg font-bold text-primary mb-1">
                {t.step3Heading}
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed mb-3">
                {t.step3Body}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary/60">
              <span className="text-emerald-400 font-bold">{t.step3Clicks}</span>
              <span>{t.step3Included}</span>
            </div>
          </div>
        </div>

        {/* COMPARADOR INTERACTIVO ANTES Y DESPUÉS */}
        <div className="mb-8">
          <SneakerBeforeAfterSlider lang={lang} />
        </div>

        {/* BOTTOM METRICS BAR */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              💰
            </span>
            <div>
              <p className="text-xs font-bold text-primary">{t.metric1Title}</p>
              <p className="text-[11px] text-primary/70">{t.metric1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-primary">{t.metric2Title}</p>
              <p className="text-[11px] text-primary/70">{t.metric2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-theme-1/15 border border-theme-1/30 flex items-center justify-center text-theme-1 font-bold text-lg shrink-0">
              📈
            </span>
            <div>
              <p className="text-xs font-bold text-primary">{t.metric3Title}</p>
              <p className="text-[11px] text-primary/70">{t.metric3Desc}</p>
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
                {showTechnicalDetails ? t.toggleDetailsOpen : t.toggleDetailsClosed}
              </h3>
              <p className="text-xs text-secondary/60">
                {showTechnicalDetails ? t.toggleDetailsSubOpen : t.toggleDetailsSubClosed}
              </p>
            </div>
          </div>
          <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary px-3 py-1 rounded-lg bg-theme-5 group-hover:bg-theme-1 group-hover:text-secondary transition-colors hidden sm:inline-block">
            {showTechnicalDetails ? t.toggleCollapseBtn : t.toggleExpandBtn}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-8 pt-8 border-t border-theme-9 space-y-12 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Diagnóstico */}
            <div>
              <span className="text-xs font-mono font-bold uppercase text-theme-1 block mb-2">
                {diagnostic.badge || (isEs ? '01. DIAGNÓSTICO' : isPt ? '01. DIAGNÓSTICO' : '01. DIAGNOSTIC')}
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
                  <p className="text-xs font-bold text-red-800 uppercase mb-2">✕ {diagnostic.standard.title}</p>
                  <ul className="space-y-1.5 text-xs text-secondary/80">
                    {diagnostic.standard.points.slice(0, 3).map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-theme-5 border-2 border-theme-1">
                  <p className="text-xs font-bold text-secondary uppercase mb-2">✓ {diagnostic.proposed.title}</p>
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
                {roadmap.badge || (isEs ? '02. CRONOGRAMA DE ENTREGAS' : isPt ? '02. CRONOGRAMA DE ENTREGAS' : '02. DELIVERY ROADMAP')}
              </span>
              <h4 className="font-heading text-xl font-bold text-secondary mb-4">
                {roadmap.title}
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
              {cta.title || t.readyToSellTitle}
            </h3>
            <p className="text-xs sm:text-sm text-primary/75">
              {cta.subtitle || t.readyToSellSub}
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
              {cta.whatsappBtn || t.startWhatsapp}
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
              {t.fillBriefBtn}
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
              {cta.callBtn || t.bookCallBtn}
            </a>

            <button
              type="button"
              onClick={handlePrint}
              aria-label={cta.printBtn || t.printAria}
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
          <span className="text-[10px] text-primary/60 font-mono block">{t.stickyTitle}</span>
          <span className="text-sm font-mono font-black text-theme-1">
            {currency === 'COP' ? baseOffer.priceCop : baseOffer.priceUsd}
          </span>
        </div>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-theme px-4 py-2.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider shadow-md"
        >
          {t.stickyApprove}
        </a>
      </div>
    </div>
  );
}
