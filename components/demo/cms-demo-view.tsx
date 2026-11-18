'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  Mail,
  Building2,
  DollarSign,
  CheckCircle2,
  Send,
  MessageSquare,
  FileText,
  Sparkles,
  Kanban,
  Table as TableIcon,
  X,
  Check,
  BarChart3,
  RefreshCw,
  Clock,
  Calendar,
  ArrowRight,
  Flame,
  Zap,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import {
  MOCK_LEADS,
  MOCK_PROPOSALS,
  MOCK_EMAIL_LOGS,
  MOCK_AUTOMATION_SETTINGS,
} from '@/lib/mock-cms-data';
import type { Lead, LeadStatus, Proposal } from '@/lib/crm-store';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string; badgeBg: string }[] = [
  { id: 'new', label: 'Nuevos Leads', color: 'border-blue-500/50', badgeBg: 'bg-blue-500/10 text-blue-400' },
  { id: 'in_conversation', label: 'En Conversación', color: 'border-amber-500/50', badgeBg: 'bg-amber-500/10 text-amber-400' },
  { id: 'proposal_sent', label: 'Propuesta Enviada', color: 'border-purple-500/50', badgeBg: 'bg-purple-500/10 text-purple-400' },
  { id: 'in_development', label: 'En Desarrollo', color: 'border-cyan-500/50', badgeBg: 'bg-cyan-500/10 text-cyan-400' },
  { id: 'closed_won', label: 'Cerrados / Ganados', color: 'border-emerald-500/50', badgeBg: 'bg-emerald-500/10 text-emerald-400' },
];

export function CmsDemoView({ locale = 'es' }: { locale?: string }) {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'proposals' | 'automations' | 'metrics'>('pipeline');
  const [mobileStage, setMobileStage] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [demoToast, setDemoToast] = useState<string | null>(null);
  const [filterScore, setFilterScore] = useState<string>('all');

  const showToast = (msg: string) => {
    setDemoToast(msg);
    setTimeout(() => setDemoToast(null), 3500);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.service || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = filterScore === 'all' || lead.score === filterScore;
      return matchesSearch && matchesScore;
    });
  }, [leads, searchQuery, filterScore]);

  const metrics = useMemo(() => {
    const totalPipelineValue = 38200;
    const activeClients = leads.filter((l) => l.status === 'in_development' || l.status === 'closed_won').length;
    const winRate = '78%';
    const avgResponseTime = '< 15 min';
    return { totalPipelineValue, activeClients, winRate, avgResponseTime };
  }, [leads]);

  const moveLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Lead movido a "${STATUS_COLUMNS.find((c) => c.id === newStatus)?.label}"`);
  };

  const handleAddNote = () => {
    if (!selectedLead || !newNoteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...selectedLead,
      notes: [newNote, ...selectedLead.notes],
    };
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
    setSelectedLead(updated);
    setNewNoteText('');
    showToast('Nota interna agregada al historial');
  };

  const handleResetData = () => {
    setLeads(MOCK_LEADS);
    setProposals(MOCK_PROPOSALS);
    setSelectedLead(null);
    showToast('Datos demo restaurados al estado original');
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* Toast Notification */}
      {demoToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-medium text-sm shadow-xl shadow-amber-500/20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{demoToast}</span>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Entorno Demo Interactivo:</span>
            <span>Estás explorando el motor CMS & CRM de Andrés Morales con datos simulados seguros.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={handleResetData}
              className="hover:underline flex items-center gap-1 text-amber-200 hover:text-white"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar Datos
            </button>
            <Link
              href={locale === 'en' ? '/portfolio' : `/${locale}/portfolio`}
              className="px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 transition-colors flex items-center gap-1"
            >
              ← Volver al Portafolio
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#12151d]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Andrés Morales <span className="text-amber-400">CMS & Engine</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">Panel unificado de prospección, clientes y pipeline</p>
            </div>
          </div>

          {/* Navigation Tabs - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full no-scrollbar">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'pipeline' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Pipeline CRM
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'proposals' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Propuestas ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('automations')}
              className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'automations' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Automatizaciones
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'metrics' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Métricas
            </button>
          </div>

          <Link
            href={locale === 'en' ? '/contact' : `/${locale}/contact`}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md shadow-amber-500/10 transition-all"
          >
            <span>Crear Sistema Similar</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 font-medium">Pipeline Activo (Estimado)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              ${metrics.totalPipelineValue.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              ↑ 24% vs mes anterior
            </span>
          </div>
          <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 font-medium">Proyectos en Curso</span>
            <div className="text-2xl font-black text-white mt-1">{metrics.activeClients}</div>
            <span className="text-[11px] text-slate-400 mt-1">Next.js & SaaS Microfrontends</span>
          </div>
          <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 font-medium">Tasa de Conversión a Cliente</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.winRate}</div>
            <span className="text-[11px] text-slate-400 mt-1">Briefs calificados técnicamente</span>
          </div>
          <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 font-medium">Velocidad Respuesta Telegram</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{metrics.avgResponseTime}</div>
            <span className="text-[11px] text-blue-400/80 mt-1">Automatización vía Webhook</span>
          </div>
        </div>

        {/* TAB 1: KANBAN PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141822] border border-slate-800/80 p-3 rounded-2xl">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre, empresa o servicio..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Temperatura:</span>
                  <select
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="hot">🔥 Calientes (Hot)</option>
                    <option value="warm">⚡ Tibios (Warm)</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Mostrando <strong className="text-amber-400">{filteredLeads.length}</strong> prospectos simulados
              </div>
            </div>

            {/* Mobile Column Quick Switcher (md:hidden) */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setMobileStage('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all ${
                  mobileStage === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300'
                }`}
              >
                Todas ({filteredLeads.length})
              </button>
              {STATUS_COLUMNS.map((col) => {
                const count = filteredLeads.filter((l) => l.status === col.id).length;
                const isSelected = mobileStage === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setMobileStage(col.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {col.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {STATUS_COLUMNS.map((col) => {
                const colLeads = filteredLeads.filter((l) => l.status === col.id);
                const isMobileHidden = mobileStage !== 'all' && mobileStage !== col.id;
                return (
                  <div
                    key={col.id}
                    className={`${isMobileHidden ? 'hidden md:flex' : 'flex'} bg-[#12151d] border border-slate-800/80 rounded-2xl p-3 flex-col min-h-[400px] md:min-h-[500px]`}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.color.replace('border-', 'bg-')}`} />
                        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.label}</h2>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badgeBg}`}>
                        {colLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-3 rounded-xl bg-[#171b26] border cursor-pointer transition-all hover:border-amber-400/50 hover:shadow-lg hover:-translate-y-0.5 ${
                            selectedLead?.id === lead.id ? 'border-amber-400 bg-amber-500/5' : 'border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-xs font-bold text-white leading-tight">{lead.name}</h3>
                            {lead.score === 'hot' ? (
                              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Hot
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-blue-400">Warm</span>
                            )}
                          </div>

                          {lead.company && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </p>
                          )}

                          <div className="text-[11px] text-slate-300 font-medium mb-2.5 line-clamp-1 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/50">
                            {lead.service}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                            <span className="font-semibold text-emerald-400">{lead.budget}</span>
                            <span>{lead.notes.length} notas</span>
                          </div>
                        </div>
                      ))}

                      {colLeads.length === 0 && (
                        <div className="h-24 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                          Sin prospectos aquí
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PROPOSALS */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Generador & Gestor de Propuestas</h2>
                  <p className="text-xs text-slate-400">Cotizaciones interactivas con entregables desglosados en USD y pasarela Wompi</p>
                </div>
                <button
                  onClick={() => showToast('En el CMS real, esto abre el wizard de cotización técnica')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Propuesta
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {proposals.map((prop) => (
                  <div key={prop.id} className="bg-[#181d2a] border border-slate-800 rounded-xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                          {prop.status === 'sent' ? 'Propuesta Enviada' : 'Aprobada'}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2">{prop.title}</h3>
                        <p className="text-xs text-slate-400">Cliente: {prop.clientName} · {prop.clientCompany}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Inversión Estimada</span>
                        <div className="text-2xl font-black text-amber-400">
                          {prop.investmentAmount}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Entregables por Fase:</span>
                      {prop.deliverables.map((d, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-slate-200">{d.phase}: {d.title}</span>
                            <p className="text-slate-400 text-[11px]">{d.description}</p>
                          </div>
                          <span className="font-mono text-emerald-400 shrink-0 font-medium">
                            {d.duration}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                      <span>Condiciones: {prop.investmentTerms}</span>
                      <button
                        onClick={() => showToast('Simulando reenvío de propuesta en PDF al correo del cliente')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3 h-3 text-amber-400" /> Reenviar al Cliente
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATIONS */}
        {activeTab === 'automations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Integración n8n & Webhooks</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Toda solicitud recibida desde el portafolio dispara workflows en n8n autoalojado, notificando por Telegram en milisegundos y creando el lead en el CRM.
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">Webhook de Entrada (n8n)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Activo 200 OK</span>
                  </div>
                  <code className="text-[11px] font-mono text-amber-300 block truncate">
                    {MOCK_AUTOMATION_SETTINGS.n8nWebhookLead}
                  </code>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">Bot de Telegram (@AndresMoralesBot)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Conectado</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Notificaciones instantáneas push al móvil con botón de llamada directa y link al brief.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">Servidor de Correo Propio (Mailcow)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">100% Inbox Rate</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    DKIM, SPF y DMARC validados con 10/10 en Mail-Tester para entregabilidad sin spam.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Historial de Emails Transaccionales</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Registro de confirmaciones y seguimientos automáticos despachados vía SMTP seguro.
              </p>

              <div className="space-y-3">
                {MOCK_EMAIL_LOGS.map((email) => (
                  <div key={email.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{email.toName || email.to}</span>
                      <span className="text-[10px] text-slate-500">{new Date(email.sentAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] font-medium text-amber-300 truncate mb-1">{email.subject}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{email.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: METRICS & STACK */}
        {activeTab === 'metrics' && (
          <div className="bg-[#141822] border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2">Arquitectura & Rendimiento del CMS</h2>
            <p className="text-xs text-slate-400 mb-6">Métricas de infraestructura y capacidades del motor técnico desarrollado</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-black text-emerald-400 mb-1">100 / 100</div>
                <h3 className="text-xs font-bold text-slate-200 mb-1">Google PageSpeed Performance</h3>
                <p className="text-[11px] text-slate-400">Next.js App Router, CSS estático sin bloatware y Server Components ultraoptimizados.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-black text-amber-400 mb-1">&lt; 80ms</div>
                <h3 className="text-xs font-bold text-slate-200 mb-1">Latencia TTFB</h3>
                <p className="text-[11px] text-slate-400">Servido en VPS dedicado con Caddy Proxy inverso y compresión Zstandard nativa.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-black text-blue-400 mb-1">Zero Lock-in</div>
                <h3 className="text-xs font-bold text-slate-200 mb-1">Soberanía de Datos</h3>
                <p className="text-[11px] text-slate-400">Sin depender de suscripciones costosas de HubSpot o Salesforce; 100% código propio.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* LEAD DETAIL DRAWER / MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#141822] border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    Ficha de Prospecto
                  </span>
                  <span className="text-xs text-slate-400">{selectedLead.id}</span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedLead.company || 'Empresa confidencial'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email:</span>
                    <span className="font-mono text-slate-200">{selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Teléfono:</span>
                    <span className="font-mono text-slate-200">{selectedLead.phone || 'No registrado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Presupuesto:</span>
                    <span className="font-semibold text-emerald-400">{selectedLead.budget}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Servicio Solicitado:</span>
                    <span className="text-slate-200 truncate">{selectedLead.service}</span>
                  </div>
                </div>

                {/* Move Status Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Cambiar Etapa de Negociación:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STATUS_COLUMNS.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => moveLeadStatus(selectedLead.id, col.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-all border ${
                          selectedLead.status === col.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                {selectedLead.message && (
                  <div>
                    <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Mensaje / Requerimiento:
                    </span>
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      "{selectedLead.message}"
                    </p>
                  </div>
                )}

                {/* Notes History */}
                <div>
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Notas Internas ({selectedLead.notes.length}):
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {selectedLead.notes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <p className="text-slate-300">{note.text}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Agregar nota de seguimiento..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 pb-20 sm:pb-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cerrar Ficha
              </button>
              <button
                onClick={() => showToast('Simulando envío de propuesta a este contacto')}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generar Propuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CmsDemoView;
