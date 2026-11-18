'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Proposal } from '@/lib/crm-store';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';

interface Props {
  initialProposal: Proposal;
  lang: string;
}

export default function ProposalClient({ initialProposal, lang }: Props) {
  const [proposal, setProposal] = useState<Proposal>(initialProposal);
  const [accepting, setAccepting] = useState(false);
  const [clientNotes, setClientNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccepting(true);

    try {
      const res = await fetch(`/api/proposals/${proposal.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: clientNotes }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProposal(data.proposal);
        setJustAccepted(true);
        setIsModalOpen(false);
      } else {
        alert(data.error || 'Error al aceptar la propuesta');
      }
    } catch {
      alert('Error de conexión al confirmar la propuesta');
    } finally {
      setAccepting(false);
    }
  };

  const isAccepted = proposal.status === 'accepted';

  return (
    <div className="min-h-screen bg-[#F8F5F4] text-[#1E1810] selection:bg-[#f96e03] selection:text-white pb-20">
      {/* Top Brand Header */}
      <header className="border-b border-[#1E1810]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E1810] flex items-center justify-center text-[#f96e03] font-serif font-black text-sm group-hover:scale-105 transition-transform">
              AM
            </div>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1E1810] block leading-tight">
                Andrés Morales
              </span>
              <span className="text-[10px] font-mono text-[#575250] uppercase tracking-wider block">
                Automatización & Desarrollo Web
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                isAccepted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {isAccepted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Propuesta Aceptada</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Propuesta Activa</span>
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {justAccepted && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-lg animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">
              ¡Muchas gracias, {proposal.clientName}!
            </h2>
            <p className="text-sm text-emerald-800 max-w-lg mx-auto">
              Has aceptado formalmente la propuesta. Andrés Morales ha recibido la notificación de inmediato y se pondrá en contacto contigo para iniciar la primera fase.
            </p>
            <div>
              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  `¡Hola Andrés! Acabo de aceptar la propuesta "${proposal.title}". ¿Cuándo coordinamos el kick-off?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-serif font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Escribirle a Andrés por WhatsApp para iniciar</span>
              </a>
            </div>
          </div>
        )}

        {/* Cover Card */}
        <div className="bg-white border border-[#1E1810]/10 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f96e03]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F5] border border-stone-200 text-xs font-mono text-[#575250]">
              <Sparkles className="w-3.5 h-3.5 text-[#f96e03]" />
              <span>Propuesta de Servicios Profesionales</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1E1810] leading-tight">
              {proposal.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100">
              <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-stone-200/70">
                <span className="text-[10px] font-mono uppercase text-[#575250] font-bold block mb-0.5">
                  Preparado para
                </span>
                <span className="font-serif font-bold text-sm text-[#1E1810] block">
                  {proposal.clientName}
                </span>
                {proposal.clientCompany && (
                  <span className="text-xs text-[#575250] flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-stone-400" />
                    {proposal.clientCompany}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-stone-200/70">
                <span className="text-[10px] font-mono uppercase text-[#575250] font-bold block mb-0.5">
                  Especialidad
                </span>
                <span className="font-semibold text-xs sm:text-sm text-[#1E1810] block truncate">
                  {proposal.service}
                </span>
                <span className="text-xs text-[#575250] block mt-0.5">
                  Por Andrés Morales
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-stone-200/70">
                <span className="text-[10px] font-mono uppercase text-[#575250] font-bold block mb-0.5">
                  Fecha de Emisión
                </span>
                <span className="font-mono text-xs text-[#1E1810] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {new Date(proposal.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Válida por 15 días calendario
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scope / Diagnostic Section */}
        {proposal.scopeSummary && (
          <div className="bg-white border border-[#1E1810]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1E1810] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#f96e03]" />
              Diagnóstico & Alcance del Proyecto
            </h2>
            <div className="text-xs sm:text-sm text-[#575250] leading-relaxed whitespace-pre-wrap bg-[#FAF7F5] border border-stone-200/70 rounded-2xl p-5">
              {proposal.scopeSummary}
            </div>
          </div>
        )}

        {/* Deliverables / Phases */}
        <div className="bg-white border border-[#1E1810]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1E1810] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#f96e03]" />
                Fases de Entrega & Entregables
              </h2>
              <p className="text-xs text-[#575250] mt-0.5">
                Ruta paso a paso con entregas verificables y sin costos ocultos.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {proposal.deliverables?.map((phase, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F5] border border-stone-200/80 rounded-2xl p-5 sm:p-6 transition-all hover:border-[#1E1810]/30 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-[#1E1810] text-[#f96e03] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-serif font-bold text-base text-[#1E1810]">
                      {phase.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-[#575250] font-semibold">
                      {phase.phase}
                    </span>
                    {phase.duration && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {phase.duration}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#575250] leading-relaxed pt-1">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Investment & Payment Terms */}
        <div className="bg-gradient-to-br from-white to-[#FAF7F5] border border-[#1E1810]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#575250] font-bold block mb-1">
                Inversión Total del Proyecto
              </span>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1810]">
                {proposal.investmentAmount}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:max-w-xs text-xs text-[#575250] space-y-1">
              <span className="font-mono font-bold uppercase text-[10px] text-[#1E1810] block">
                Forma de Pago Acordada:
              </span>
              <p className="leading-relaxed">{proposal.investmentTerms}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#575250]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Garantía de soporte y acompañamiento post-lanzamiento.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Facturación legal y código fuente/flujos entregados al 100%.</span>
            </div>
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="bg-[#1E1810] text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {isAccepted ? 'Proyecto en Marcha' : '¿Listo para comenzar?'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {isAccepted
                ? `Esta propuesta fue aceptada formalmente el ${new Date(
                    proposal.acceptedAt || proposal.updatedAt
                  ).toLocaleDateString('es-CO')}. Estamos trabajando en los entregables acordados.`
                : 'Al aceptar esta propuesta, reservamos el espacio en el calendario de desarrollo y procedemos con la configuración inicial.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isAccepted ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] font-serif font-bold text-sm transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceptar Propuesta Formalmente</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-serif font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aceptada y confirmada</span>
              </div>
            )}

            {isAccepted ? (
              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  `¡Hola Andrés! Ya acepté la propuesta "${proposal.title}". Me gustaría coordinar los primeros pasos.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hablar por WhatsApp con Andrés</span>
              </a>
            ) : (
              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  `Hola Andrés, estuve revisando la propuesta "${proposal.title}" y quisiera comentarte unos detalles.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#f96e03]" />
                <span>Resolver dudas por WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Acceptance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#1E1810]/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1E1810]">
                Aceptar Propuesta de Proyecto
              </h3>
              <p className="text-xs text-[#575250] mt-1">
                Confirmas la aceptación de los entregables y el valor de inversión de{' '}
                <strong className="text-[#1E1810]">{proposal.investmentAmount}</strong>.
              </p>
            </div>

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  value={proposal.clientName}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs sm:text-sm text-stone-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Comentarios o Requerimientos adicionales (opcional)
                </label>
                <textarea
                  rows={3}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Por ejemplo: 'Listo, nos vemos el lunes a las 9am para el kick-off'..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="px-6 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {accepting ? 'Confirmando...' : 'Confirmar y Aceptar Propuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
