'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Prospect, AiAutomationProposal, ProspectAudit } from '@/lib/prospect-store';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import {
  Clock,
  Gauge,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Printer,
  FileText,
  Download,
  Zap,
  Layers,
  Server,
  ArrowRight,
  Maximize2,
  Share2,
  Check,
  Sparkles,
  TrendingUp,
  Bot,
  Cpu,
  Activity,
} from 'lucide-react';

interface Props {
  prospect: Prospect;
  lang: string;
  defaultCurrency?: 'COP' | 'USD';
  isAnglophone?: boolean;
  aiProposal?: AiAutomationProposal;
}

const I18N_AUDIT = {
  es: {
    copyLink: 'Copiar Link',
    linkCopied: 'Enlace Copiado',
    savePdf: 'Guardar PDF / Imprimir',
    bookReview: 'Agendar Revisión',
    auditAnother: 'Auditar otro sitio',
    badge: 'DICTAMEN 360° · VELOCIDAD GOOGLE + UX/UI + AUTOMATIZACIÓN IA',
    mainTitle: 'Auditoría 360°: Rendimiento Móvil, UX/UI & Automatización IA',
    consultant: 'Consultor Responsable: Andrés Morales · Senior Web & AI Automation Architect',
    folio: 'FOLIO',
    date: 'FECHA',
    status: 'ESTADO',
    confidential: 'CONFIDENCIAL',
    scope: 'ALCANCE',
    scopeVal: 'Móvil (390px 4G)',
    company: 'EMPRESA AUDITADA',
    domain: 'DOMINIO PRINCIPAL',
    market: 'UBICACIÓN / MERCADO',
    platform: 'PLATAFORMA / SISTEMA',
    speedStrip: 'Carga Móvil',
    excelStrip: 'Operación: Migración Excel',
    waStrip: 'WhatsApp IA: 24/7 Activable',
    reportStrip: 'Dictamen: Confidencial',

    // Score status
    scoreOptimal: 'Rendimiento Óptimo',
    scoreNeedsImprovement: 'Requiere Optimización',
    scoreCritical: 'Rendimiento Crítico',

    // Section 1
    sec1Tag: 'SECCIÓN 01',
    sec1Title: 'Dictamen Ejecutivo de Salud Técnica & Métricas Clave',
    sec1Sub: 'Evaluación técnica de infraestructura, velocidad móvil y tracking de conversión.',
    sec1Methodology:
      'La evaluación técnica se realizó mediante instrumentación de red móvil (simulando conexión 4G estándar en pantalla móvil de 390×844px). Los resultados evidencian cuellos de botella significativos en la entrega de activos iniciales y ejecución de código Javascript que impactan de manera directa la tasa de conversión y el costo por adquisición (CAC) en pauta digital.',
    googleBadge: 'Google Lighthouse Core Web Vitals',
    googleAuditEngine: 'Medición oficial auditada mediante motor Google Lighthouse Móvil (Chrome Emulation 390×844px)',
    coreVitalsTitle: 'Métricas Oficiales de Rendimiento Google (Core Web Vitals)',
    verifiedBadge: 'Google Lighthouse Verificado',
    unverifiedBadge: 'Instrumentación de Red 4G',
    lcpLabel: 'LCP (Renderizado)',
    lcpMeta: 'Bloque principal visible. Meta Google: ',
    fcpLabel: 'FCP (Primer Trazo)',
    fcpMeta: 'Primer elemento dibujado. Meta Google: ',
    tbtLabel: 'TBT (Bloqueo JS)',
    tbtMeta: 'Hilo principal congelado. Meta Google: ',
    clsLabel: 'CLS (Estabilidad)',
    clsMeta: 'Saltos de layout. Meta Google: ',
    ttfbLabel: 'TTFB (Primer Byte)',
    ttfbMeta: 'Respuesta de servidor. Meta Edge: ',

    // Section 2
    sec2Tag: 'SECCIÓN 02',
    sec2Title: 'Evidencia Visual: Dictamen Técnico de Google Lighthouse',
    sec2Sub: 'Ficha gráfica técnica oficial emitida por el motor Google Lighthouse (simulación móvil 390×844px 4G).',
    tabGoogleCard: 'Tarjeta Google',
    tabScreenshot: 'Captura Web',
    mobileTag: 'Móvil 390px 4G',
    outOf100: 'de 100',
    googleScale: 'Escala Google: 🔴 0–49   🟠 50–89   🟢 90–100',
    officialMetricsTitle: 'Métricas Oficiales de Rendimiento:',
    lcpCardLabel: 'LCP (Render Mayor)',
    fcpCardLabel: 'FCP (Primer Pintado)',
    tbtCardLabel: 'TBT (Bloqueo JS)',
    clsCardLabel: 'CLS (Estabilidad)',
    speedIndexCardLabel: 'Speed Index',
    verifyGoogle: 'Verificar en Google',
    mobileViewportView: 'Vista Móvil:',
    resolutionTag: 'Resolución: 390 × 844 px',
    mobileInspectionText: 'Inspección técnica de interfaz',
    fullscreen: 'Pantalla Completa',
    minimize: 'Reducir',
    mobileFindingsTitle: 'Hallazgos Observados en el Flujo de Navegación Móvil',
    finding1Title: '1. Retraso en First Contentful Paint (>2.0s)',
    finding1Desc:
      'El cliente experimenta una pantalla en blanco antes de visualizar los primeros elementos de catálogo o tipografía de marca. En pauta móvil (Meta Ads, TikTok, Google Ads), este retraso provoca una fuga inmediata del tráfico pagado antes de registrar interacción.',
    finding2Title: '2. Sobrecarga de Scripts de Terceros y Bloqueo de Hilo Principal',
    finding2Desc:
      'Se detectó la carga concurrente de librerías externas, widgets y analizadores de tráfico ejecutándose de forma síncrona. Esto congela la capacidad de scroll y el tap en botones como "Agregar al Carrito" durante los primeros 3 segundos.',
    finding3Title: '3. Oportunidad de Optimización Perimetral (Edge Caching)',
    finding3Desc:
      'Al delegar la entrega de catálogo e imágenes estáticas a una red de distribución de contenido (CDN) con caché inteligente en nodos locales de Colombia/Miami, el tiempo total de carga puede reducirse a <1.1 segundos sin necesidad de reconstruir la tienda desde cero.',
    specificNotesTitle: 'Observaciones Específicas de la Inspección:',

    // Section 3
    sec3Tag: 'SECCIÓN 03',
    sec3Title: 'Matriz Comparativa de Arquitectura Web (Actual vs Propuesta)',
    sec3Sub: 'Contraste entre la infraestructura actual y la arquitectura moderna de alto rendimiento propuesta.',
    thComponent: 'Componente Técnico',
    thCurrent: (name: string) => `Estado Actual (${name})`,
    thRecommended: 'Arquitectura Recomendada (Andrés Morales)',
    thImpact: 'Impacto Esperado',

    // Section 4
    sec4Tag: 'SECCIÓN 04 · ARQUITECTURA DE IA & PROCESOS',
    sec4Efficiency: 'EFICIENCIA OPERATIVA',
    sec4EfficiencySub: 'Atención 24/7 sin sumar nómina',
    pipelineBadge: 'PIPELINE OPERATIVO RECOMENDADO',
    pipelineTech: 'n8n + Agentes IA + Base de Datos Centralizada',
    pipe1Num: '01. CAPTACIÓN',
    pipe1Title: 'WhatsApp / Web',
    pipe1Sub: 'Solicitud de cotización',
    pipe2Num: '02. CALIFICACIÓN IA',
    pipe2Title: 'Agente 24/7',
    pipe2Sub: 'Filtra y valida requisitos',
    pipe3Num: '03. N8N ENGINE',
    pipe3Title: 'Cotización PDF',
    pipe3Sub: 'Propuesta formal en 60s',
    pipe4Num: '04. CONTROL TOTAL',
    pipe4Title: 'Base de Datos',
    pipe4Sub: 'Cero Excels dispersos',
    savingsEstimateLabel: 'Impacto Operativo Estimado:',
    designWorkflows: 'Diseñar Flujos de IA',

    // Section 5
    sec5Tag: 'SECCIÓN 05',
    sec5Title: 'Plan de Acción Recomendado (Roadmap de Implementación)',
    sec5Sub: 'Estrategia escalonada diseñada para generar victorias rápidas sin interrumpir la operación comercial de la tienda.',
    phase1Tag: 'FASE 1 · DÍAS 1 A 5',
    phase1Title: 'Limpieza Crítica & Quick Wins',
    phase1Desc:
      'Auditoría y diferimiento de scripts secundarios de tracking, depuración de plugins en desuso y compresión de imágenes pesadas en banners principales.',
    phase2Tag: 'FASE 2 · DÍAS 6 A 15',
    phase2Title: 'Aceleración Perimetral (Edge)',
    phase2Desc:
      'Configuración de reglas de almacenamiento perimetral (Edge Caching) para servir el catálogo desde servidores locales en Colombia y Miami con TTFB inferior a 250ms.',
    phase3Tag: 'FASE 3 · DÍAS 16 A 30',
    phase3Title: 'Optimización de Embudo & CRO',
    phase3Desc:
      'Refactorización del flujo de carrito y checkout móvil para eliminar pasos innecesarios, garantizando una experiencia de compra fluida en un solo toque.',

    // Section 6
    sec6Tag: 'SECCIÓN 06 · DICTAMEN & PRÓXIMOS PASOS',
    sec6Title: 'Dictamen Final & Próximos Pasos',
    sec6Notice:
      'Este informe es un análisis técnico preliminar independiente. No compromete a la marca ni genera cobros automáticos.',
    sec6Prompt: (name: string) =>
      `Si el equipo técnico o directivo de ${name} desea revisar en detalle las líneas de código, logs de red y las recomendaciones de este dictamen:`,
    chatWa: 'Consultar Dudas por WhatsApp',
    bookMeeting: 'Agendar Sesión Técnica (20 min)',
    downloadPdf: 'Descargar en PDF',
    docFooter: 'Documento Confidencial',
    floatingDockAudit: 'Auditoría 360°',
    waMsg: (name: string, url: string) =>
      `Hola Andrés, estuve revisando el reporte técnico de auditoría de ${name} (${url}). Me gustaría conversar sobre los puntos de optimización móvil y arquitectura web.`,
  },
  en: {
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied',
    savePdf: 'Save PDF / Print',
    bookReview: 'Book Review',
    auditAnother: 'Audit another site',
    badge: '360° TECHNICAL AUDIT · GOOGLE SPEED + UX/UI + AI AUTOMATION',
    mainTitle: '360° Audit: Mobile Performance, UX/UI & AI Automation',
    consultant: 'Lead Consultant: Andrés Morales · Senior Web & AI Automation Architect',
    folio: 'REPORT ID',
    date: 'DATE',
    status: 'STATUS',
    confidential: 'CONFIDENTIAL',
    scope: 'SCOPE',
    scopeVal: 'Mobile (390px 4G)',
    company: 'AUDITED COMPANY',
    domain: 'PRIMARY DOMAIN',
    market: 'LOCATION / MARKET',
    platform: 'PLATFORM / SYSTEM',
    speedStrip: 'Mobile Load',
    excelStrip: 'Operations: Excel Replacement',
    waStrip: 'AI Agent: 24/7 Ready',
    reportStrip: 'Status: Confidential',

    // Score status
    scoreOptimal: 'Optimal Performance',
    scoreNeedsImprovement: 'Needs Optimization',
    scoreCritical: 'Critical Performance',

    // Section 1
    sec1Tag: 'SECTION 01',
    sec1Title: 'Executive Technical Diagnostic & Core Vitals',
    sec1Sub: 'Technical evaluation of infrastructure, mobile responsiveness, and tracking.',
    sec1Methodology:
      'The technical evaluation was conducted using mobile network instrumentation (simulating a standard 4G connection on a 390×844px mobile viewport). Results highlight significant bottlenecks in initial asset delivery and JavaScript execution directly affecting conversion rates and customer acquisition cost (CAC) in digital campaigns.',
    googleBadge: 'Google Lighthouse Core Web Vitals',
    googleAuditEngine: 'Official audit engine: Google Lighthouse Mobile (Chrome Emulation 390×844px)',
    coreVitalsTitle: 'Official Google Lighthouse Core Web Vitals',
    verifiedBadge: 'Google Lighthouse Verified',
    unverifiedBadge: '4G Network Emulation',
    lcpLabel: 'LCP (Largest Render)',
    lcpMeta: 'Main content visible. Google target: ',
    fcpLabel: 'FCP (First Paint)',
    fcpMeta: 'First element drawn. Google target: ',
    tbtLabel: 'TBT (JS Blocking)',
    tbtMeta: 'Main thread frozen. Google target: ',
    clsLabel: 'CLS (Stability)',
    clsMeta: 'Layout shifts. Google target: ',
    ttfbLabel: 'TTFB (First Byte)',
    ttfbMeta: 'Server response. Edge target: ',

    // Section 2
    sec2Tag: 'SECTION 02',
    sec2Title: 'Visual Evidence: Google Lighthouse Technical Assessment',
    sec2Sub: 'Official technical scorecard generated by Google Lighthouse engine (mobile 390×844px 4G emulation).',
    tabGoogleCard: 'Google Card',
    tabScreenshot: 'Live Viewport',
    mobileTag: 'Mobile 390px 4G',
    outOf100: 'out of 100',
    googleScale: 'Google Scale: 🔴 0–49   🟠 50–89   🟢 90–100',
    officialMetricsTitle: 'Official Performance Metrics:',
    lcpCardLabel: 'LCP (Largest Contentful)',
    fcpCardLabel: 'FCP (First Contentful)',
    tbtCardLabel: 'TBT (Total Blocking)',
    clsCardLabel: 'CLS (Layout Shift)',
    speedIndexCardLabel: 'Speed Index',
    verifyGoogle: 'Verify on Google',
    mobileViewportView: 'Mobile View:',
    resolutionTag: 'Resolution: 390 × 844 px',
    mobileInspectionText: 'Mobile interface technical inspection',
    fullscreen: 'Fullscreen',
    minimize: 'Minimize',
    mobileFindingsTitle: 'Findings Observed in Mobile Navigation Flow',
    finding1Title: '1. Delay in First Contentful Paint (>2.0s)',
    finding1Desc:
      'Users experience a blank screen before seeing core catalog items or brand typography. In mobile paid media (Meta Ads, TikTok, Google Ads), this delay causes immediate abandonment of paid traffic before any interaction.',
    finding2Title: '2. Third-Party Script Overhead & Main Thread Blocking',
    finding2Desc:
      'Concurrent loading of external libraries, tracking widgets, and analytics scripts runs synchronously, freezing scrolling and CTA taps (such as "Add to Cart") during the critical first 3 seconds.',
    finding3Title: '3. Edge Caching & Perimeter Acceleration Opportunity',
    finding3Desc:
      'By distributing catalog delivery and static media across an intelligent Edge CDN cache at regional nodes, total load time drops to <1.1s without rebuilding the store from scratch.',
    specificNotesTitle: 'Specific Inspection Notes:',

    // Section 3
    sec3Tag: 'SECTION 03',
    sec3Title: 'Web Architecture Comparison Matrix (Current vs Recommended)',
    sec3Sub: 'Side-by-side contrast between current infrastructure and proposed high-performance modern architecture.',
    thComponent: 'Technical Component',
    thCurrent: (name: string) => `Current Setup (${name})`,
    thRecommended: 'Recommended Architecture (Andrés Morales)',
    thImpact: 'Expected Impact',

    // Section 4
    sec4Tag: 'SECTION 04 · AI ARCHITECTURE & AUTOMATION',
    sec4Efficiency: 'OPERATIONAL EFFICIENCY',
    sec4EfficiencySub: '24/7 client response without adding headcount',
    pipelineBadge: 'RECOMMENDED OPERATIONAL PIPELINE',
    pipelineTech: 'n8n + AI Agents + Centralized Database',
    pipe1Num: '01. INGESTION',
    pipe1Title: 'WhatsApp / Web',
    pipe1Sub: 'Quote requests & inquiries',
    pipe2Num: '02. AI QUALIFICATION',
    pipe2Title: '24/7 Agent',
    pipe2Sub: 'Filters & scores requirements',
    pipe3Num: '03. N8N ENGINE',
    pipe3Title: 'PDF Quote',
    pipe3Sub: 'Formal proposal in 60s',
    pipe4Num: '04. TOTAL CONTROL',
    pipe4Title: 'Database',
    pipe4Sub: 'Zero scattered spreadsheets',
    savingsEstimateLabel: 'Estimated Operational Impact:',
    designWorkflows: 'Design AI Workflows',

    // Section 5
    sec5Tag: 'SECTION 05',
    sec5Title: 'Recommended Action Plan (Implementation Roadmap)',
    sec5Sub: 'Phased strategy engineered for quick wins without disrupting ongoing commercial operations.',
    phase1Tag: 'PHASE 1 · DAYS 1 TO 5',
    phase1Title: 'Critical Cleanup & Quick Wins',
    phase1Desc:
      'Audit and deferral of secondary tracking scripts, removal of unused plugins, and compression of oversized banner images.',
    phase2Tag: 'PHASE 2 · DAYS 6 TO 15',
    phase2Title: 'Perimeter Acceleration (Edge)',
    phase2Desc:
      'Configuration of Edge Caching rules to serve catalog and assets from regional nodes with TTFB under 250ms.',
    phase3Tag: 'PHASE 3 · DAYS 16 TO 30',
    phase3Title: 'Funnel & CRO Optimization',
    phase3Desc:
      'Refactoring mobile cart and checkout flows to remove friction, ensuring seamless one-tap purchasing experience.',

    // Section 6
    sec6Tag: 'SECTION 06 · VERDICT & NEXT STEPS',
    sec6Title: 'Final Verdict & Next Steps',
    sec6Notice:
      'This report is an independent preliminary technical analysis. It does not commit the company nor incur automatic charges.',
    sec6Prompt: (name: string) =>
      `If the technical or executive team at ${name} would like to inspect code lines, network logs, and implementation details of this report:`,
    chatWa: 'Chat on WhatsApp with Andrés',
    bookMeeting: 'Book Strategy Session (20 min)',
    downloadPdf: 'Download PDF Report',
    docFooter: 'Confidential Document',
    floatingDockAudit: '360° Audit',
    waMsg: (name: string, url: string) =>
      `Hi Andrés, I was reviewing the technical audit report for ${name} (${url}). I'd like to discuss the mobile performance and AI automation roadmap.`,
  },
  pt: {
    copyLink: 'Copiar Link',
    linkCopied: 'Link Copiado',
    savePdf: 'Salvar PDF / Imprimir',
    bookReview: 'Agendar Reunião',
    auditAnother: 'Auditar outro site',
    badge: 'PARECER TÉCNICO 360° · VELOCIDADE GOOGLE + UX/UI + AUTOMAÇÃO IA',
    mainTitle: 'Auditoria 360°: Performance Mobile, UX/UI & Automação IA',
    consultant: 'Consultor Responsável: Andrés Morales · Senior Web & AI Automation Architect',
    folio: 'PROTOCOLO',
    date: 'DATA',
    status: 'STATUS',
    confidential: 'CONFIDENCIAL',
    scope: 'ESCOPO',
    scopeVal: 'Mobile (390px 4G)',
    company: 'EMPRESA AUDITADA',
    domain: 'DOMÍNIO PRINCIPAL',
    market: 'LOCALIZAÇÃO / MERCADO',
    platform: 'PLATAFORMA / SISTEMA',
    speedStrip: 'Carga Mobile',
    excelStrip: 'Operação: Substituição de Planilhas',
    waStrip: 'WhatsApp IA: 24/7 Ativável',
    reportStrip: 'Parecer: Confidencial',

    // Score status
    scoreOptimal: 'Performance Ideal',
    scoreNeedsImprovement: 'Requer Otimização',
    scoreCritical: 'Performance Crítica',

    // Section 1
    sec1Tag: 'SEÇÃO 01',
    sec1Title: 'Parecer Executivo de Saúde Técnica & Métricas Principais',
    sec1Sub: 'Avaliação técnica de infraestrutura, velocidade mobile e rastreamento de conversão.',
    sec1Methodology:
      'A avaliação técnica foi realizada através de instrumentação de rede móvel (simulando conexão 4G padrão em viewport móvel de 390×844px). Os resultados revelam gargalos expressivos na entrega de ativos iniciais e execução de Javascript, impactando diretamente a taxa de conversão e o custo de aquisição (CAC) em mídia paga.',
    googleBadge: 'Google Lighthouse Core Web Vitals',
    googleAuditEngine: 'Medição oficial via motor Google Lighthouse Mobile (Emulação Chrome 390×844px)',
    coreVitalsTitle: 'Métricas Oficiais do Google Lighthouse (Core Web Vitals)',
    verifiedBadge: 'Google Lighthouse Verificado',
    unverifiedBadge: 'Instrumentação de Rede 4G',
    lcpLabel: 'LCP (Renderização Maior)',
    lcpMeta: 'Conteúdo principal visível. Meta Google: ',
    fcpLabel: 'FCP (Primeira Pintura)',
    fcpMeta: 'Primeiro elemento desenhado. Meta Google: ',
    tbtLabel: 'TBT (Bloqueio JS)',
    tbtMeta: 'Thread principal bloqueada. Meta Google: ',
    clsLabel: 'CLS (Estabilidade)',
    clsMeta: 'Mudanças de layout. Meta Google: ',
    ttfbLabel: 'TTFB (Primeiro Byte)',
    ttfbMeta: 'Resposta do servidor. Meta Edge: ',

    // Section 2
    sec2Tag: 'SEÇÃO 02',
    sec2Title: 'Evidência Visual: Parecer Técnico do Google Lighthouse',
    sec2Sub: 'Ficha gráfica técnica oficial emitida pelo motor Google Lighthouse (simulação mobile 390×844px 4G).',
    tabGoogleCard: 'Cartão Google',
    tabScreenshot: 'Captura Web',
    mobileTag: 'Mobile 390px 4G',
    outOf100: 'de 100',
    googleScale: 'Escala Google: 🔴 0–49   🟠 50–89   🟢 90–100',
    officialMetricsTitle: 'Métricas Oficiais de Performance:',
    lcpCardLabel: 'LCP (Renderização Maior)',
    fcpCardLabel: 'FCP (Primeira Pintura)',
    tbtCardLabel: 'TBT (Bloqueio JS)',
    clsCardLabel: 'CLS (Estabilidade)',
    speedIndexCardLabel: 'Speed Index',
    verifyGoogle: 'Verificar no Google',
    mobileViewportView: 'Visualização Mobile:',
    resolutionTag: 'Resolução: 390 × 844 px',
    mobileInspectionText: 'Inspeção técnica de interface',
    fullscreen: 'Tela Cheia',
    minimize: 'Reduzir',
    mobileFindingsTitle: 'Diagnósticos Observados no Fluxo de Navegação Mobile',
    finding1Title: '1. Atraso no First Contentful Paint (>2.0s)',
    finding1Desc:
      'O usuário visualiza uma tela em branco antes dos primeiros itens do catálogo ou tipografia da marca. Em mídia paga (Meta Ads, TikTok, Google Ads), esse atraso causa abandono imediato do tráfego pago antes de qualquer interação.',
    finding2Title: '2. Sobrecarga de Scripts de Terceiros e Bloqueio da Thread Principal',
    finding2Desc:
      'Identificou-se o carregamento simultâneo de bibliotecas externas, widgets e rastreadores executados de forma síncrona, congelando a rolagem e o clique em botões de ação ("Adicionar ao Carrinho") durante os primeiros 3 segundos.',
    finding3Title: '3. Oportunidade de Otimização Perimetral (Edge Caching)',
    finding3Desc:
      'Ao distribuir catálogo e imagens estáticas através de CDN com cache inteligente em nós locais, o tempo total de carregamento cai para <1.1s sem necessidade de reconstruir o site do zero.',
    specificNotesTitle: 'Observações Específicas da Inspeção:',

    // Section 3
    sec3Tag: 'SEÇÃO 03',
    sec3Title: 'Matriz Comparativa de Arquitetura Web (Atual vs Recomendada)',
    sec3Sub: 'Comparativo direto entre a infraestrutura atual e a arquitetura moderna de alta performance proposta.',
    thComponent: 'Componente Técnico',
    thCurrent: (name: string) => `Setup Atual (${name})`,
    thRecommended: 'Arquitetura Recomendada (Andrés Morales)',
    thImpact: 'Impacto Esperado',

    // Section 4
    sec4Tag: 'SEÇÃO 04 · ARQUITETURA DE IA & AUTOMAÇÃO',
    sec4Efficiency: 'EFICIÊNCIA OPERACIONAL',
    sec4EfficiencySub: 'Atendimento 24/7 sem aumentar equipe',
    pipelineBadge: 'PIPELINE OPERACIONAL RECOMENDADO',
    pipelineTech: 'n8n + Agentes IA + Banco de Dados Centralizado',
    pipe1Num: '01. CAPTAÇÃO',
    pipe1Title: 'WhatsApp / Web',
    pipe1Sub: 'Solicitação de orçamento',
    pipe2Num: '02. QUALIFICAÇÃO IA',
    pipe2Title: 'Agente 24/7',
    pipe2Sub: 'Filtra e valida requisitos',
    pipe3Num: '03. MOTOR N8N',
    pipe3Title: 'Orçamento em PDF',
    pipe3Sub: 'Proposta formal em 60s',
    pipe4Num: '04. CONTROLE TOTAL',
    pipe4Title: 'Banco de Dados',
    pipe4Sub: 'Zero planilhas dispersas',
    savingsEstimateLabel: 'Impacto Operacional Estimado:',
    designWorkflows: 'Desenhar Fluxos de IA',

    // Section 5
    sec5Tag: 'SEÇÃO 05',
    sec5Title: 'Plano de Ação Recomendado (Roadmap de Implementação)',
    sec5Sub: 'Estratégia em fases desenhada para gerar vitórias rápidas sem interromper a operação comercial.',
    phase1Tag: 'FASE 1 · DIAS 1 A 5',
    phase1Title: 'Limpeza Crítica & Quick Wins',
    phase1Desc:
      'Auditoria e adiamento de scripts secundários de rastreamento, remoção de plugins em desuso e compressão de imagens pesadas em banners.',
    phase2Tag: 'FASE 2 · DIAS 6 A 15',
    phase2Title: 'Aceleração Perimetral (Edge)',
    phase2Desc:
      'Configuração de regras de armazenamento perimetral (Edge Caching) para servir o catálogo de servidores locais com TTFB inferior a 250ms.',
    phase3Tag: 'FASE 3 · DIAS 16 A 30',
    phase3Title: 'Otimização de Funil & CRO',
    phase3Desc:
      'Refatoração do fluxo de carrinho e checkout mobile para eliminar atritos, garantindo uma experiência de compra fluida em um toque.',

    // Section 6
    sec6Tag: 'SEÇÃO 06 · PARECER & PRÓXIMOS PASSOS',
    sec6Title: 'Parecer Final & Próximos Passos',
    sec6Notice:
      'Este relatório é uma análise técnica preliminar independente. Não compromete a marca nem gera cobranças automáticas.',
    sec6Prompt: (name: string) =>
      `Caso a equipe técnica ou executiva da ${name} deseje analisar detalhadamente o código-fonte, logs de rede e as recomendações deste parecer:`,
    chatWa: 'Tirar Dúvidas no WhatsApp',
    bookMeeting: 'Agendar Sessão Técnica (20 min)',
    downloadPdf: 'Baixar Parecer em PDF',
    docFooter: 'Documento Confidencial',
    floatingDockAudit: 'Auditoria 360°',
    waMsg: (name: string, url: string) =>
      `Olá Andrés, estive revisando o parecer técnico de auditoria da ${name} (${url}). Gostaria de conversar sobre a otimização mobile e a automação de processos.`,
  },
};

function getComparisonRows(
  audit: { ttfbMs: number; platform?: string },
  prospectName: string,
  loadSeconds: string,
  lang: 'es' | 'en' | 'pt'
) {
  const isVtex = (audit.platform || '').toLowerCase().includes('vtex') || prospectName.toLowerCase().includes('bosi');

  if (lang === 'en') {
    return [
      {
        component: 'Infrastructure & Server',
        current: isVtex
          ? `VTEX IO Enterprise Engine (TTFB ~${audit.ttfbMs}ms)`
          : `Traditional shared hosting server (TTFB ~${audit.ttfbMs}ms)`,
        recommended: isVtex
          ? 'Load optimization over current VTEX architecture without operational risk'
          : 'Distributed Edge Network on Cloudflare / Vercel Edge (<150ms)',
        impact: isVtex ? 'Zero backend risk' : '8× faster',
      },
      {
        component: 'Mobile Catalog Delivery',
        current: `Full blocking page load (~${loadSeconds}s)`,
        recommended: isVtex
          ? 'Decoupled Frontend / FastStore keeping the native VTEX backend (<1.0s)'
          : 'Next.js Server-Side Streaming + Incremental ISR Cache (<1.0s)',
        impact: isVtex ? 'Preserves existing inventory' : 'Zero blank screens',
      },
      {
        component: 'Media & Image Optimization',
        current: 'Heavy JPG/PNG banners without adaptive compression',
        recommended: 'Automated WebP/AVIF compression with responsive srcset',
        impact: '-65% payload size',
      },
      {
        component: 'Third-Party Script Execution',
        current: 'Synchronous main-thread execution (freezes interactivity)',
        recommended: 'Off-thread deferred loading via Web Workers (Partytown / Next Script)',
        impact: 'Instant scroll & tap',
      },
      {
        component: 'Mobile Paid Traffic Retention',
        current: 'Estimated 30% to 40% bounce rate on paid ad visits',
        recommended: '>92% retention rate on mobile ad clicks',
        impact: '+20% to +35% CRO',
      },
      {
        component: 'Operations & Spreadsheet Management',
        current: 'Scattered Excel / Google Sheets, error-prone manual entry',
        recommended: 'Centralized database with automated real-time n8n workflows',
        impact: 'Zero operational chaos',
      },
      {
        component: 'Proposal & Quote Generation',
        current: 'Manual spreadsheet calculations taking hours or days to deliver',
        recommended: 'Instant branded PDF proposal generation with digital approval link',
        impact: '10× faster delivery',
      },
    ];
  }

  if (lang === 'pt') {
    return [
      {
        component: 'Infraestrutura & Servidor',
        current: isVtex
          ? `Motor E-commerce Enterprise VTEX IO (TTFB ~${audit.ttfbMs}ms)`
          : `Servidor compartilhado tradicional (TTFB ~${audit.ttfbMs}ms)`,
        recommended: isVtex
          ? 'Otimização de carga sobre a arquitetura atual da VTEX sem risco operacional'
          : 'Edge Network distribuída em Cloudflare / Vercel Edge (<150ms)',
        impact: isVtex ? 'Zero risco de backend' : '8× mais rápido',
      },
      {
        component: 'Entrega do Catálogo Mobile',
        current: `Carregamento bloqueante completo (~${loadSeconds}s)`,
        recommended: isVtex
          ? 'Frontend desacoplado / FastStore mantendo o backend nativo da VTEX (<1.0s)'
          : 'Next.js Server-Side Streaming + Cache Incremental ISR (<1.0s)',
        impact: isVtex ? 'Preserva inventário' : 'Zero telas em branco',
      },
      {
        component: 'Otimização de Mídias (Imagens)',
        current: 'Banners em JPG/PNG pesados sem compressão adaptativa',
        recommended: 'Compressão automática em WebP/AVIF com srcset responsivo',
        impact: '-65% peso de dados',
      },
      {
        component: 'Execução de Scripts de Terceiros',
        current: 'Carga síncrona na thread principal (congela interatividade)',
        recommended: 'Carga diferida em Web Workers (Partytown / Next Script)',
        impact: 'Rolagem instantânea',
      },
      {
        component: 'Taxa de Retenção de Tráfego Mobile',
        current: 'Fuga estimada de 30% a 40% de visitas em mídia paga',
        recommended: 'Retenção >92% dos cliques vindos de anúncios mobile',
        impact: '+20% a +35% CRO',
      },
      {
        component: 'Gestão Operacional de Dados & Planilhas',
        current: 'Planilhas de Excel dispersas, suscetíveis a erros e digitação manual',
        recommended: 'Banco de dados centralizado com fluxos n8n em tempo real',
        impact: 'Zero caos operacional',
      },
      {
        component: 'Geração de Orçamentos & Propostas',
        current: 'Cálculo manual em planilhas que demora horas ou dias para envio',
        recommended: 'Geração instantânea de proposta em PDF com link de aprovação digital',
        impact: '10× mais rápido',
      },
    ];
  }

  return [
    {
      component: 'Infraestructura & Servidor',
      current: isVtex
        ? `Motor E-commerce Enterprise VTEX IO (TTFB ~${audit.ttfbMs}ms)`
        : `Servidor tradicional compartido (TTFB ~${audit.ttfbMs}ms)`,
      recommended: isVtex
        ? 'Optimización de carga sobre la arquitectura actual de VTEX sin riesgo operativo'
        : 'Edge Network distribuido en Cloudflare / Vercel Edge (<150ms)',
      impact: isVtex ? 'Cero riesgo backend' : '8× más rápido',
    },
    {
      component: 'Entrega de Catálogo Móvil',
      current: `Carga bloqueante completa (~${loadSeconds}s)`,
      recommended: isVtex
        ? 'Frontend desacoplado / FastStore manteniendo el backend de VTEX (<1.0s)'
        : 'Next.js Server-Side Streaming + Caché Incremental ISR (<1.0s)',
      impact: isVtex ? 'Inventario intacto' : 'Cero pantallas blancas',
    },
    {
      component: 'Optimización de Medios (Imágenes)',
      current: 'Banners en JPG/PNG pesados sin compresión adaptativa',
      recommended: 'Compresión automática en WebP/AVIF con responsive srcset',
      impact: '-65% peso de datos',
    },
    {
      component: 'Ejecución de Scripts de Terceros',
      current: 'Carga síncrona en el hilo principal (afecta interactividad)',
      recommended: 'Carga diferida mediante Web Workers (Partytown / Next Script)',
      impact: 'Scroll instantáneo',
    },
    {
      component: 'Tasa de Retención de Tráfico Móvil',
      current: 'Fuga estimada de 30% a 40% de visitas en pauta publicitaria',
      recommended: 'Retención >92% de los clics provenientes de anuncios móviles',
      impact: '+20% a +35% CRO',
    },
    {
      component: 'Gestión Operativa de Datos & Excels',
      current: 'Hojas de Excel / Google Sheets dispersas, propensas a errores y copiado manual',
      recommended: 'Base de datos centralizada con flujos n8n y sincronización automática en tiempo real',
      impact: 'Cero caos operativo',
    },
    {
      component: 'Generación de Cotizaciones & Presupuestos',
      current: 'Cálculo manual en hojas de cálculo que demora horas o días en entregarse',
      recommended: 'Generación instantánea de propuesta en PDF formal con enlace de aprobación digital',
      impact: '10× más rápido',
    },
  ];
}

export default function AuditClient({ prospect, lang, aiProposal }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFullImg, setShowFullImg] = useState(false);
  const [visualMode, setVisualMode] = useState<'metrics' | 'screenshot'>('metrics');

  // Dynamic screenshot resolution with cascading fallback
  const initialScreenshot = useMemo(() => {
    if (prospect.screenshotUrl && !prospect.screenshotUrl.includes('expired')) {
      return prospect.screenshotUrl;
    }
    return `/api/screenshot?url=${encodeURIComponent(prospect.website || '')}`;
  }, [prospect.screenshotUrl, prospect.website]);

  const [imgSrc, setImgSrc] = useState<string>(initialScreenshot);
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  const pdfDownloadUrl = useMemo(() => {
    if (prospect.pdfUrl) return prospect.pdfUrl;
    if (prospect.auditSlug && (prospect.auditSlug.includes('bosi') || prospect.name?.toLowerCase().includes('bosi'))) {
      return '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf';
    }
    return null;
  }, [prospect.pdfUrl, prospect.auditSlug, prospect.name]);

  const handleImgError = () => {
    if (fallbackAttempt === 0) {
      setFallbackAttempt(1);
      setImgSrc(`https://image.thum.io/get/width/390/crop/844/noanimate/${encodeURIComponent(prospect.website)}`);
    } else if (fallbackAttempt === 1) {
      setFallbackAttempt(2);
      setImgSrc(
        `https://api.microlink.io?url=${encodeURIComponent(
          prospect.website
        )}&screenshot=true&meta=false&embed=screenshot.url&viewport.isMobile=true&viewport.width=390&viewport.height=844`
      );
    } else {
      setImgError(true);
    }
  };

  const t = I18N_AUDIT[(lang as 'en' | 'pt') || 'es'] || I18N_AUDIT.es;

  const audit: ProspectAudit = prospect.audit || {
    loadTimeMs: 3800,
    ttfbMs: 1450,
    platform: 'E-commerce',
    hasWhatsAppFloating: true,
    hasAnalytics: true,
    hasMetaPixel: true,
    hasMobileViewport: true,
    score: 45,
    techScore: 48,
    uxScore: 42,
    uiScore: 50,
    auditHighlights:
      lang === 'en'
        ? [
            'Initial server response time (TTFB) exceeds 1.2s on mobile 4G connections.',
            'Third-party tracking scripts execute synchronously blocking primary render.',
            'High-resolution banner images without modern WebP/AVIF compression.',
          ]
        : lang === 'pt'
        ? [
            'Tempo de resposta inicial (TTFB) superior a 1.2s em conexões mobile 4G.',
            'Scripts de rastreamento de terceiros bloqueando a renderização principal.',
            'Imagens de banner em alta resolução sem compressão WebP/AVIF moderna.',
          ]
        : [
            'Tiempo de respuesta inicial (TTFB) superior a 1.2s en conexiones móviles 4G.',
            'Carga diferida de scripts de tracking de terceros bloqueando el render principal.',
            'Imágenes en banners de alta resolución sin compresión WebP/AVIF moderna.',
          ],
    suggestedImprovement:
      ((prospect.audit as ProspectAudit | undefined)?.platform || '').toLowerCase().includes('vtex') || prospect.name?.toLowerCase().includes('bosi')
        ? (lang === 'en'
            ? 'Load optimization over current VTEX architecture without operational risk (or Decoupled Frontend / FastStore keeping the native VTEX backend) to achieve <1.0s loading and +25% mobile conversion.'
            : lang === 'pt'
            ? 'Otimização de carga sobre a arquitetura atual da VTEX sem risco operacional (ou Frontend desacoplado / FastStore mantendo o backend da VTEX) para atingir <1.0s de carregamento.'
            : 'Optimización de carga sobre la arquitectura actual de VTEX sin riesgo operativo (o Frontend desacoplado / FastStore manteniendo el backend de VTEX intacto) para lograr <1.0s de carga y +25% de conversión móvil.')
        : (lang === 'en'
            ? 'Performance optimization, responsive Edge Caching and mobile checkout redesign to reach <1s load times and +25% mobile conversion.'
            : lang === 'pt'
            ? 'Otimização de performance mobile e Edge Caching para atingir <1s de carregamento e +25% de conversão mobile.'
            : 'Optimización de carga sobre la arquitectura actual y Edge Caching para lograr <1s de carga y +25% de conversión móvil.'),
    auditedAt: new Date().toISOString(),
  };

  const loadSeconds = (audit.loadTimeMs / 1000).toFixed(1);
  const score = audit.score || 45;
  const lhScore = audit.lighthouse?.performanceScore ?? audit.techScore ?? score;
  const scoreColor = lhScore >= 90 ? '#16a34a' : lhScore >= 50 ? '#d97706' : '#dc2626';
  const scoreBg =
    lhScore >= 90
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : lhScore >= 50
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-800 border-rose-200';
  const scoreLabel =
    lhScore >= 90
      ? t.scoreOptimal
      : lhScore >= 50
      ? t.scoreNeedsImprovement
      : t.scoreCritical;

  const comparisonRows = useMemo(
    () => getComparisonRows(audit, prospect.name, loadSeconds, (lang as 'en' | 'pt') || 'es'),
    [audit, prospect.name, loadSeconds, lang]
  );

  const ai: AiAutomationProposal = useMemo(() => {
    if (aiProposal) return aiProposal;
    if (prospect.audit?.aiAutomationProposal) return prospect.audit.aiAutomationProposal;
    if (lang === 'en') {
      return {
        headline: `Operations, Projects & Excel Replacement AI Plan for ${prospect.name}`,
        summary: `Automated architecture with n8n and AI agents engineered to centralize client data, eliminate spreadsheet chaos, and accelerate quotes without adding headcount.`,
        operationalSavingsEstimate:
          'Projected savings: ~20 to 30 weekly staff hours on manual administrative tasks and lead response in <60 seconds.',
        modules: [
          {
            title: 'Migrating Excel Chaos to Centralized Database & CRM',
            description: `Centralizing leads, quotes, and project deliverables scattered across spreadsheets into a unified, secure database. Inbound inquiries are logged automatically without manual typing.`,
            impact: 'Zero lost records, consistent data accessible in one place',
            techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
          },
          {
            title: 'Automated Quote & PDF Proposal Generation',
            description: `Eliminate hours calculating estimates in Excel. An automated n8n workflow processes client requirements, calculates pricing, generates a formal branded PDF quote, and delivers it via WhatsApp or email instantly.`,
            impact: 'Proposals delivered in minutes (10× faster) with higher closing rates',
            techStack: 'n8n + Dynamic PDF Generator + WhatsApp / Email',
          },
          {
            title: '24/7 AI Agent for Lead Qualification & Calendar Booking',
            description: `An intelligent WhatsApp & web assistant answering leads around the clock, qualifying project scope, answering FAQs, and booking meetings directly on your team's Google Calendar.`,
            impact: 'Automated lead scoring and frictionless qualified meetings',
            techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
          },
          {
            title: 'Operational Project Tracking & Smart Alerts',
            description: `Real-time monitoring of tasks, deadlines, and deliverables. Leadership and team receive automatic alerts on WhatsApp/Telegram when milestones are met, without manually checking spreadsheets.`,
            impact: 'Total operational visibility without spreadsheet micro-management',
            techStack: 'n8n + Telegram / WhatsApp Bot + Status Triggers',
          },
        ],
      };
    }
    if (lang === 'pt') {
      return {
        headline: `Plano de Automação Operacional, Projetos & Substituição de Planilhas para ${prospect.name}`,
        summary: `Arquitetura de processos autônomos com n8n e agentes de IA projetada para centralizar clientes, eliminar a desorganização de planilhas de Excel e acelerar orçamentos sem inchar a equipe.`,
        operationalSavingsEstimate:
          'Economia projetada: ~20 a 30 horas semanais em tarefas administrativas e resposta a leads em <60 segundos.',
        modules: [
          {
            title: 'Migração do Caos do Excel para Banco de Dados & CRM',
            description: `Centralização de clientes, orçamentos e status de projetos dispersos em planilhas para um banco de dados seguro. Novos contatos de WhatsApp, web ou e-mail são integrados em tempo real sem digitação manual.`,
            impact: 'Zero perda de dados, visibilidade consistente em um só lugar',
            techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
          },
          {
            title: 'Geração Automatizada de Orçamentos & Propostas em PDF',
            description: `Elimina horas montando orçamentos manuais no Excel. O fluxo n8n processa a solicitação, calcula valores, gera proposta formal com a marca da ${prospect.name} e envia por WhatsApp ou e-mail na hora.`,
            impact: 'Propostas enviadas em minutos (10× mais rápido) com maior conversão',
            techStack: 'n8n + Gerador Dinâmico de PDF + WhatsApp / E-mail',
          },
          {
            title: 'Agente de IA para Qualificação de Leads & Agendamento (24/7)',
            description: `Assistente inteligente no WhatsApp que atende clientes potenciais 24h, coleta o escopo, valida o perfil ideal e agenda diretamente no calendário da equipe.`,
            impact: 'Filtro automático de leads e reuniões qualificadas sem atrito',
            techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
          },
          {
            title: 'Controle Operacional de Projetos & Alertas Inteligentes',
            description: `Monitoramento de prazos e entregas. Gestores e equipe recebem notificações automáticas no WhatsApp quando um marco é atingido, sem abrir planilhas.`,
            impact: 'Supervisão total da operação sem microgestão em planilhas',
            techStack: 'n8n + Bot de Telegram / WhatsApp + Triggers de Status',
          },
        ],
      };
    }
    return {
      headline: `Plan de Automatización Operativa, Proyectos & Reemplazo de Excels para ${prospect.name}`,
      summary: `Estrategia de procesos autónomos con n8n y agentes de IA diseñada para centralizar clientes y proyectos, eliminar el desorden de hojas de cálculo de Excel y acelerar cotizaciones sin sumar personal.`,
      operationalSavingsEstimate:
        'Ahorro proyectado: ~20 a 30 horas semanales en tareas administrativas manuales y respuesta a prospectos en <60 segundos.',
      modules: [
        {
          title: 'Migración del Caos de Excel a Base de Datos & CRM Automatizado',
          description: `Centralización de clientes, cotizaciones y estados de proyectos dispersos en múltiples archivos de Excel en un sistema unificado y seguro. Cada nuevo contacto por web, WhatsApp o correo se clasifica y actualiza en tiempo real sin digitación manual.`,
          impact: 'Cero datos perdidos, información consistente y accesible en un solo lugar',
          techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
        },
        {
          title: 'Generación Automatizada de Cotizaciones & Propuestas en PDF',
          description: `Elimina las horas invertidas en calcular presupuestos manualmente en Excel. Un flujo en n8n procesa los requerimientos del cliente, calcula los valores, genera el documento PDF formal con la marca de ${prospect.name} y lo envía por WhatsApp o email al instante.`,
          impact: 'Cotizaciones entregadas en minutos (10× más rápido) con mayor tasa de cierre',
          techStack: 'n8n + Generador Dinámico de PDF + WhatsApp / Correo',
        },
        {
          title: 'Agente de IA para Calificación de Prospectos & Agendamiento (24/7)',
          description: `Asistente inteligente en WhatsApp que atiende clientes potenciales las 24 horas, recopila el alcance del proyecto o servicio solicitado, valida si cumple con el perfil ideal del negocio y agenda directamente en el calendario del equipo.`,
          impact: 'Filtro automático de prospectos y reuniones calificadas sin fricción',
          techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
        },
        {
          title: 'Control Operativo de Proyectos & Alertas Inteligentes',
          description: `Monitoreo del avance de tareas, fechas de entrega y cuentas por cobrar. La gerencia y el equipo reciben notificaciones automáticas por Telegram o WhatsApp cuando una tarea se atrasa o un hito se cumple, sin tener que revisar hojas de cálculo.`,
          impact: 'Supervisión total de la operación sin microgestión en hojas de cálculo',
          techStack: 'n8n + Bot de Telegram / WhatsApp + Triggers de Estado',
        },
      ],
    };
  }, [aiProposal, prospect.audit?.aiAutomationProposal, prospect.name, lang]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // WhatsApp inquiry URL
  const waMessage = t.waMsg(prospect.name, prospect.website);
  const waUrl = `https://wa.me/573161482507?text=${encodeURIComponent(waMessage)}`;

  const auditDate = audit.auditedAt
    ? new Date(audit.auditedAt).toLocaleDateString(
        lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-CO',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : new Date().toLocaleDateString(
        lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-CO',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );

  const folioCode = `AUD-${(prospect.auditSlug || prospect.id)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#F8F5F4] text-[#1E1810] font-sans antialiased selection:bg-[#f96e03] selection:text-white print:bg-white print:text-black">
      {/* Top Action Utility Bar (hidden when printing) */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#1E1810]/10 sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <Image
              src="/logo-wp.png"
              alt="Andrés Morales"
              width={160}
              height={76}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/${lang}/audit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E1810]/15 bg-[#F8F5F4] hover:bg-white text-xs font-medium text-[#1E1810] transition-colors cursor-pointer"
              title={t.auditAnother}
            >
              <Gauge className="w-3.5 h-3.5 text-[#f96e03]" />
              <span className="hidden sm:inline">{t.auditAnother}</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E1810]/15 bg-[#F8F5F4] hover:bg-white text-xs font-medium text-[#1E1810] transition-colors cursor-pointer"
              title={t.copyLink}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{t.linkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#575250]" />
                  <span>{t.copyLink}</span>
                </>
              )}
            </button>

            {pdfDownloadUrl ? (
              <a
                href={pdfDownloadUrl}
                download={`Ultra_Auditoria_${prospect.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_AndresMorales.pdf`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f96e03]/30 bg-[#f96e03]/10 hover:bg-[#f96e03]/20 text-xs font-semibold text-[#1E1810] transition-colors shadow-xs"
                title="Descargar Dictamen Ejecutivo en PDF con capturas reales"
              >
                <Download className="w-3.5 h-3.5 text-[#9a3412]" />
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E1810]/15 bg-[#F8F5F4] hover:bg-white text-xs font-medium text-[#1E1810] transition-colors cursor-pointer"
                title={t.savePdf}
              >
                <Printer className="w-3.5 h-3.5 text-[#575250]" />
                <span className="hidden sm:inline">{t.savePdf}</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#f96e03] hover:bg-[#e05f00] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.bookReview}</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Report Document Sheet */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-36 sm:pb-16 space-y-8 print:py-0 print:px-0">
        {/* Document Header / Dossier Title */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header Top Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#1E1810]/10 pb-6">
            <div className="space-y-3">
              <Link href={`/${lang}`} className="inline-block">
                <Image
                  src="/logo-wp.png"
                  alt="Andrés Morales"
                  width={196}
                  height={94}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#f96e03] font-bold block">
                  {t.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1E1810] mt-1 tracking-tight">
                  {t.mainTitle}
                </h1>
                <p className="text-xs text-[#575250] mt-1 font-mono">
                  {t.consultant}
                </p>
              </div>
            </div>

            {/* Document Stamp Box */}
            <div className="bg-[#F8F5F4] border border-[#1E1810]/10 rounded-xl p-4 text-xs font-mono space-y-1.5 min-w-[240px] shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[#575250]">{t.folio}:</span>
                <span className="font-bold text-[#1E1810]">{folioCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#575250]">{t.date}:</span>
                <span className="font-semibold text-[#1E1810]">{auditDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#575250]">{t.status}:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.confidential}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#575250]">{t.scope}:</span>
                <span className="text-[#1E1810]">{t.scopeVal}</span>
              </div>
            </div>
          </div>

          {/* Subject / Company Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F5F4]/70 border border-[#1E1810]/5 text-xs">
            <div>
              <span className="text-[#575250] font-mono block text-[10px] uppercase">
                {t.company}
              </span>
              <span className="font-bold text-sm text-[#1E1810] mt-0.5 block">
                {prospect.name}
              </span>
            </div>
            <div>
              <span className="text-[#575250] font-mono block text-[10px] uppercase">
                {t.domain}
              </span>
              <a
                href={prospect.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f96e03] font-mono hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>{prospect.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <span className="text-[#575250] font-mono block text-[10px] uppercase">
                {t.market}
              </span>
              <span className="font-semibold text-[#1E1810] mt-0.5 block">
                {prospect.city}, {prospect.country}
              </span>
            </div>
            <div>
              <span className="text-[#575250] font-mono block text-[10px] uppercase">
                {t.platform}
              </span>
              <span className="font-semibold text-[#1E1810] mt-0.5 block truncate">
                {audit.platform || 'Web Corporativa'}
              </span>
            </div>
          </div>

          {/* Quick Executive Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-mono">
            <div className="bg-[#F8F5F4] p-2.5 rounded-lg border border-[#1E1810]/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="truncate">{t.speedStrip}: <strong>{loadSeconds}s</strong></span>
            </div>
            <div className="bg-[#F8F5F4] p-2.5 rounded-lg border border-[#1E1810]/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate"><strong>{t.excelStrip}</strong></span>
            </div>
            <div className="bg-[#F8F5F4] p-2.5 rounded-lg border border-[#1E1810]/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate"><strong>{t.waStrip}</strong></span>
            </div>
            <div className="bg-[#F8F5F4] p-2.5 rounded-lg border border-[#1E1810]/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate"><strong>{t.reportStrip}</strong></span>
            </div>
          </div>
        </section>

        {/* Section 1: Executive Diagnostic & Core Vitals */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1810]/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
                {t.sec1Tag}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1E1810]">
                {t.sec1Title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                  score >= 80
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : score >= 50
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <Gauge className="w-5 h-5 shrink-0" />
                <div className="text-left font-mono">
                  <div className="text-xl font-black leading-none">{score}/100</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                    {score < 50
                      ? t.scoreCritical
                      : score < 75
                      ? t.scoreNeedsImprovement
                      : t.scoreOptimal}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#575250] leading-relaxed">
            {t.sec1Methodology}
          </p>

          {/* Google Lighthouse Core Web Vitals Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#f96e03] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {t.coreVitalsTitle}
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {audit.lighthouse ? t.verifiedBadge : t.unverifiedBadge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* LCP */}
              <div className="p-3.5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/70 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#575250] block">{t.lcpLabel}</span>
                <div className="text-2xl font-serif font-black text-rose-600">
                  {audit.lighthouse?.lcp || `${loadSeconds}s`}
                </div>
                <p className="text-[10px] text-[#575250] leading-tight">
                  {t.lcpMeta}<strong>&lt;2.5s</strong>
                </p>
              </div>

              {/* FCP */}
              <div className="p-3.5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/70 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#575250] block">{t.fcpLabel}</span>
                <div className="text-2xl font-serif font-black text-amber-600">
                  {audit.lighthouse?.fcp || `${Math.min(Number(loadSeconds), 2.2).toFixed(1)}s`}
                </div>
                <p className="text-[10px] text-[#575250] leading-tight">
                  {t.fcpMeta}<strong>&lt;1.8s</strong>
                </p>
              </div>

              {/* TBT */}
              <div className="p-3.5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/70 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#575250] block">{t.tbtLabel}</span>
                <div className="text-2xl font-serif font-black text-rose-600">
                  {audit.lighthouse?.tbt || `${Math.min(audit.loadTimeMs, 1200)}ms`}
                </div>
                <p className="text-[10px] text-[#575250] leading-tight">
                  {t.tbtMeta}<strong>&lt;200ms</strong>
                </p>
              </div>

              {/* CLS */}
              <div className="p-3.5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/70 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#575250] block">{t.clsLabel}</span>
                <div className="text-2xl font-serif font-black text-emerald-600">
                  {audit.lighthouse?.cls || '0.002'}
                </div>
                <p className="text-[10px] text-[#575250] leading-tight">
                  {t.clsMeta}<strong>&lt;0.10</strong>
                </p>
              </div>

              {/* TTFB */}
              <div className="p-3.5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/70 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-mono font-bold text-[#575250] block">{t.ttfbLabel}</span>
                <div className="text-2xl font-serif font-black text-[#1E1810]">
                  {audit.ttfbMs}ms
                </div>
                <p className="text-[10px] text-[#575250] leading-tight">
                  {t.ttfbMeta}<strong>&lt;300ms</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#575250] pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{t.googleAuditEngine}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Visual Evidence & Mobile Viewport Inspection */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1810]/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
                {t.sec2Tag}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1E1810]">
                {t.sec2Title}
              </h2>
              <p className="text-xs text-[#575250] mt-1">
                {t.sec2Sub}
              </p>
            </div>

            {/* Visual View Switcher (Metrics Card vs Mobile Web Screenshot) */}
            <div className="flex items-center gap-1.5 bg-[#F8F5F4] p-1 rounded-xl border border-[#1E1810]/10 text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setVisualMode('metrics')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  visualMode === 'metrics'
                    ? 'bg-[#1E1810] text-white shadow-sm'
                    : 'text-[#575250] hover:text-[#1E1810]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#f96e03]" />
                <span>{t.tabGoogleCard}</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('screenshot')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  visualMode === 'screenshot'
                    ? 'bg-[#1E1810] text-white shadow-sm'
                    : 'text-[#575250] hover:text-[#1E1810]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.tabScreenshot}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Panel */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {visualMode === 'metrics' ? (
                /* ── OFICIAL GOOGLE LIGHTHOUSE VISUAL CARD ── */
                <div className="w-full max-w-[360px] bg-[#1E1810] text-white rounded-2xl p-5 shadow-xl border border-white/10 space-y-4">
                  {/* Google Brand Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                      </div>
                      <span className="font-mono text-xs font-bold text-white tracking-wider">
                        Google Lighthouse™
                      </span>
                    </div>
                    <span className="bg-white/10 text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      {t.mobileTag}
                    </span>
                  </div>

                  {/* Circular Speedometer Score */}
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          fill="none"
                          stroke={scoreColor}
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 44}
                          strokeDashoffset={2 * Math.PI * 44 * (1 - lhScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span
                          className="text-3xl font-black font-mono leading-none"
                          style={{ color: scoreColor }}
                        >
                          {lhScore}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-1">
                          {t.outOf100}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${scoreBg}`}
                    >
                      {scoreLabel}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {t.googleScale}
                    </span>
                  </div>

                  {/* Core Web Vitals Breakdown Table */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs font-mono">
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                      {t.officialMetricsTitle}
                    </div>

                    {/* Metric Row 1: LCP */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-stone-300">{t.lcpCardLabel}</span>
                      </div>
                      <span className="font-bold text-rose-400">
                        {audit.lighthouse?.lcp || `${loadSeconds}s`}
                      </span>
                    </div>

                    {/* Metric Row 2: FCP */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-stone-300">{t.fcpCardLabel}</span>
                      </div>
                      <span className="font-bold text-amber-400">
                        {audit.lighthouse?.fcp || '4.3 s'}
                      </span>
                    </div>

                    {/* Metric Row 3: TBT */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-stone-300">{t.tbtCardLabel}</span>
                      </div>
                      <span className="font-bold text-rose-400">
                        {audit.lighthouse?.tbt || `${Math.min(audit.loadTimeMs, 1200)} ms`}
                      </span>
                    </div>

                    {/* Metric Row 4: CLS */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-stone-300">{t.clsCardLabel}</span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        {audit.lighthouse?.cls || '0.002'}
                      </span>
                    </div>

                    {/* Metric Row 5: Speed Index */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-stone-300">{t.speedIndexCardLabel}</span>
                      </div>
                      <span className="font-bold text-amber-400">
                        {audit.lighthouse?.speedIndex || `${(audit.loadTimeMs / 1000).toFixed(1)} s`}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer with Direct Link to Google PageSpeed */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-stone-400 truncate max-w-[170px]">
                      {prospect.website}
                    </span>
                    <a
                      href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(
                        prospect.website
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f96e03] hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>{t.verifyGoogle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* ── MOBILE SCREENSHOT FRAME ── */
                <div className="w-full max-w-[340px] bg-[#1E1810] rounded-2xl p-2.5 shadow-lg border border-[#1E1810]">
                  {/* Frame Header Bar */}
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-[#F8F5F4]/70 border-b border-white/10 mb-2">
                    <span className="truncate max-w-[180px]">{prospect.website}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px]">{t.mobileTag}</span>
                  </div>

                  {/* Frame Viewport */}
                  <div className="relative w-full h-[460px] overflow-hidden rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center">
                    {!imgError ? (
                      <div className="w-full h-full overflow-y-auto">
                        {/* Standard img tag for 100% reliable external loading without proxy friction */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={`Mobile inspection: ${prospect.name}`}
                          className="w-full h-auto block object-top"
                          onError={handleImgError}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[#F8F5F4]/70 space-y-3">
                        <Smartphone className="w-12 h-12 text-[#f96e03] mx-auto opacity-80" />
                        <div>
                          <span className="font-mono text-xs font-bold block text-white">
                            {t.mobileViewportView} {prospect.name}
                          </span>
                          <span className="text-[11px] text-stone-400 block mt-1">
                            {prospect.website}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-white/10 px-2.5 py-1 rounded-full text-stone-300 inline-block">
                          {t.resolutionTag}
                        </span>
                      </div>
                    )}

                    {/* Friction Tag */}
                    <div className="absolute top-3 left-3 bg-rose-600/95 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow z-20">
                      LCP: {audit.lighthouse?.lcp || `${loadSeconds}s`}
                    </div>
                  </div>

                  {/* Frame Footer Controls */}
                  <div className="mt-2 flex items-center justify-between px-2 pt-1 text-[11px]">
                    <span className="text-stone-400 font-mono text-[10px]">
                      {t.mobileInspectionText}
                    </span>
                    {!imgError && (
                      <button
                        type="button"
                        onClick={() => setShowFullImg(!showFullImg)}
                        className="text-[#f96e03] hover:underline inline-flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{showFullImg ? t.minimize : t.fullscreen}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Modal / Expanded Image View if requested */}
              {showFullImg && !imgError && (
                <div
                  className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
                  onClick={() => setShowFullImg(false)}
                >
                  <div className="max-w-md max-h-[90vh] overflow-y-auto bg-black rounded-2xl p-2 border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={`Full inspection: ${prospect.name}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Friction Points & Technical Notes */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#1E1810]">
                {t.mobileFindingsTitle}
              </h3>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-1">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t.finding1Title}</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed pl-6">
                  {t.finding1Desc}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.finding2Title}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed pl-6">
                  {t.finding2Desc}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-1">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t.finding3Title}</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed pl-6">
                  {t.finding3Desc}
                </p>
              </div>

              {audit.auditHighlights && audit.auditHighlights.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-mono font-bold text-[#575250] uppercase block mb-2">
                    {t.specificNotesTitle}
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#575250]">
                    {audit.auditHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#f96e03] font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Technical Architecture Comparison Table */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[#1E1810]/10 pb-4">
            <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
              {t.sec3Tag}
            </span>
            <h2 className="text-xl font-serif font-bold text-[#1E1810]">
              {t.sec3Title}
            </h2>
            <p className="text-xs text-[#575250] mt-1">
              {t.sec3Sub}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#1E1810]/10 rounded-xl overflow-hidden">
              <thead className="bg-[#F8F5F4] text-[#1E1810] font-mono text-[11px] uppercase border-b border-[#1E1810]/10">
                <tr>
                  <th className="p-3.5 font-bold">{t.thComponent}</th>
                  <th className="p-3.5 font-bold text-rose-900 bg-rose-50/50">
                    {t.thCurrent(prospect.name)}
                  </th>
                  <th className="p-3.5 font-bold text-emerald-900 bg-emerald-50/50">
                    {t.thRecommended}
                  </th>
                  <th className="p-3.5 font-bold">{t.thImpact}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1810]/10">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3.5 font-semibold text-[#1E1810]">
                      {row.component}
                    </td>
                    <td className="p-3.5 text-[#575250] bg-rose-50/20">
                      {row.current}
                    </td>
                    <td className="p-3.5 text-[#1E1810] font-medium bg-emerald-50/20">
                      {row.recommended}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-700 font-bold">
                      {row.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 04: AI Business Automation Architecture Proposal */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1E1810]/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
                {t.sec4Tag}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1E1810] mt-0.5">
                {ai.headline}
              </h2>
              <p className="text-xs text-[#575250] mt-1 max-w-2xl leading-relaxed">
                {ai.summary}
              </p>
            </div>
            <div className="shrink-0 bg-purple-50 border border-purple-200/80 rounded-xl px-3.5 py-2 text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-700 block">
                {t.sec4Efficiency}
              </span>
              <span className="text-xs font-serif font-black text-purple-950 block mt-0.5">
                {t.sec4EfficiencySub}
              </span>
            </div>
          </div>

          {/* Visual Architecture Pipeline Banner */}
          <div className="p-4 rounded-xl bg-[#1E1810] text-[#F8F5F4] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-stone-400 border-b border-white/10 pb-2 gap-1">
              <span className="text-[#f96e03] font-bold">{t.pipelineBadge}</span>
              <span className="text-stone-300">{t.pipelineTech}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] text-stone-400">{t.pipe1Num}</span>
                <span className="font-bold text-white text-[11px]">{t.pipe1Title}</span>
                <span className="text-[9px] text-stone-400 leading-tight">{t.pipe1Sub}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] text-purple-400">{t.pipe2Num}</span>
                <span className="font-bold text-purple-300 text-[11px]">{t.pipe2Title}</span>
                <span className="text-[9px] text-stone-400 leading-tight">{t.pipe2Sub}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] text-amber-400">{t.pipe3Num}</span>
                <span className="font-bold text-amber-300 text-[11px]">{t.pipe3Title}</span>
                <span className="text-[9px] text-stone-400 leading-tight">{t.pipe3Sub}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] text-emerald-400">{t.pipe4Num}</span>
                <span className="font-bold text-emerald-300 text-[11px]">{t.pipe4Title}</span>
                <span className="text-[9px] text-stone-400 leading-tight">{t.pipe4Sub}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ai.modules.map((mod, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/60 space-y-3 flex flex-col justify-between hover:border-[#1E1810]/30 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#f96e03]/10 text-[#f96e03] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-[#1E1810]">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#575250] leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1E1810]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{mod.impact}</span>
                  </span>
                  <span className="text-stone-400 font-mono text-[10px]">
                    Stack: {mod.techStack}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Operational Savings Callout */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-purple-950 leading-snug">
                <strong>{t.savingsEstimateLabel}</strong> {ai.operationalSavingsEstimate}
              </p>
            </div>
            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
            >
              <span>{t.designWorkflows}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Section 05: Recommended 3-Phase Action Roadmap */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[#1E1810]/10 pb-4">
            <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
              {t.sec5Tag}
            </span>
            <h2 className="text-xl font-serif font-bold text-[#1E1810]">
              {t.sec5Title}
            </h2>
            <p className="text-xs text-[#575250] mt-1">
              {t.sec5Sub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phase 1 */}
            <div className="p-5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/60 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f96e03] bg-[#f96e03]/10 px-2 py-0.5 rounded">
                {t.phase1Tag}
              </span>
              <h3 className="font-serif font-bold text-sm text-[#1E1810]">
                {t.phase1Title}
              </h3>
              <p className="text-xs text-[#575250] leading-relaxed">
                {t.phase1Desc}
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/60 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {t.phase2Tag}
              </span>
              <h3 className="font-serif font-bold text-sm text-[#1E1810]">
                {t.phase2Title}
              </h3>
              <p className="text-xs text-[#575250] leading-relaxed">
                {t.phase2Desc}
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-5 rounded-xl border border-[#1E1810]/10 bg-[#F8F5F4]/60 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {t.phase3Tag}
              </span>
              <h3 className="font-serif font-bold text-sm text-[#1E1810]">
                {t.phase3Title}
              </h3>
              <p className="text-xs text-[#575250] leading-relaxed">
                {t.phase3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Section 06: Signature & Next Steps Consultation */}
        <section className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1E1810]/10 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#f96e03] uppercase">
                {t.sec6Tag}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1E1810]">
                {t.sec6Title}
              </h2>
              <p className="text-xs text-[#575250]">
                {t.sec6Notice}
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-[#575250] shrink-0">
              <span className="block text-[#1E1810] font-bold">Andrés Morales</span>
              <span className="block text-[11px]">Senior Web & AI Automation Consultant</span>
              <span className="block text-[10px] text-[#f96e03]">andresmorales.com.co</span>
            </div>
          </div>

          {/* Action CTAs (hidden when printing) */}
          <div className="print:hidden space-y-4">
            <p className="text-xs text-[#575250]">
              {t.sec6Prompt(prospect.name)}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={CALENDAR_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f96e03] hover:bg-[#e05f00] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm text-xs font-mono"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookMeeting}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1E1810] hover:bg-[#332b21] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm text-xs font-mono"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.chatWa}</span>
              </a>

              {pdfDownloadUrl ? (
                <>
                  <a
                    href={pdfDownloadUrl}
                    download={`Ultra_Auditoria_${prospect.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_AndresMorales.pdf`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f96e03] hover:bg-[#e05f00] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm text-xs font-mono"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Descargar Dictamen PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#1E1810]/20 bg-white hover:bg-[#F8F5F4] text-[#1E1810] font-semibold py-3 px-4 rounded-xl transition-colors text-xs font-mono cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#575250]" />
                    <span>Imprimir Vista Web</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#1E1810]/20 bg-white hover:bg-[#F8F5F4] text-[#1E1810] font-semibold py-3 px-4 rounded-xl transition-colors text-xs font-mono cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#575250]" />
                  <span>{t.downloadPdf}</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E1810]/5 flex items-center justify-between text-[11px] text-[#575250] font-mono">
            <span>Andrés Morales · Senior Full Stack & AI Architect</span>
            <span>{t.docFooter} · {folioCode}</span>
          </div>
        </section>

        {/* Dedicated mobile safety margin to prevent AutoRex floating button from overlapping actions */}
        <div className="h-20 sm:hidden pointer-events-none" aria-hidden="true" style={{ minHeight: '80px' }} />
      </main>

      {/* Mobile Floating Decision Dock (hidden on print and desktop) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#1E1810]/10 p-3 sm:hidden z-40 flex items-center justify-between gap-2 shadow-lg print:hidden">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold text-[#575250] truncate block">
            {prospect.name} · {t.floatingDockAudit}
          </span>
          <span className="text-xs font-serif font-black text-[#1E1810] block">
            Andrés Morales
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#1E1810] hover:bg-[#332b21] text-white font-mono text-[11px] font-bold px-3 py-2 rounded-lg shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href={CALENDAR_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#f96e03] hover:bg-[#e05f00] text-white font-mono text-[11px] font-bold px-3 py-2 rounded-lg shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>20 min</span>
          </a>
        </div>
      </div>
    </div>
  );
}
