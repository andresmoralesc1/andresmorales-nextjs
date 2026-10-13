'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { Calculator, TrendingUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface SneakerRoiCalculatorProps {
  lang: string;
}

export function SneakerRoiCalculator({ lang }: SneakerRoiCalculatorProps) {
  const [pairsPerMonth, setPairsPerMonth] = useState<number>(20);
  const [ticketPrice, setTicketPrice] = useState<number>(250000);
  const [marginPercent, setMarginPercent] = useState<number>(35);
  const sliderId = useId();

  // Calculations
  const webCostCop = 500000;
  const monthlyRevenue = pairsPerMonth * ticketPrice;
  const profitPerPair = ticketPrice * (marginPercent / 100);
  const netMonthlyProfit = monthlyRevenue * (marginPercent / 100);
  const pairsToAmortize = Math.max(1, Math.ceil(webCostCop / profitPerPair));
  const daysToAmortize = Math.max(1, Math.round((pairsToAmortize / pairsPerMonth) * 30));

  const formatCop = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getWhatsAppMessage = () => {
    const text = `Hola Andrés, estuve usando el simulador de ROI de la web de tenis. Calculé vender ${pairsPerMonth} pares/mes a ${formatCop(ticketPrice)}. Quiero arrancar con el desarrollo base de $500.000 COP.`;
    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const briefLink = getLocalizedPath('/brief?type=web', (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale);

  return (
    <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-theme-1 via-amber-500 to-theme-1" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1/15 text-secondary border border-theme-1/30 mb-3">
          <Calculator className="w-3.5 h-3.5 text-theme-1" />
          {isEs
            ? 'SIMULADOR DE RETORNO // LA WEB SE PAGA SOLA'
            : isPt
              ? 'SIMULADOR DE RETORNO // O SITE SE PAGA SOZINHO'
              : 'ROI SIMULATOR // THE STORE PAYS FOR ITSELF'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary tracking-tight mb-2">
          {isEs
            ? '¿En cuántos días recuperas los $500.000 COP?'
            : isPt
              ? 'Em quantos dias você recupera o investimento?'
              : 'How fast do you recoup your $500,000 COP?'}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-secondary/80 leading-relaxed font-normal">
          {isEs
            ? 'Mueve los controles según el volumen de tu tienda y mira en tiempo real la facturación estimada y el punto exacto de equilibrio.'
            : isPt
              ? 'Ajuste os controles conforme o volume da sua loja e veja o faturamento e o ponto de equilíbrio.'
              : 'Adjust the sliders to match your store numbers and watch your break-even point in real time.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6 bg-theme-5 p-6 sm:p-8 rounded-2xl border border-secondary/10">
          {/* Slider: Pares al mes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={sliderId} className="text-xs sm:text-sm font-secondary font-bold text-secondary uppercase tracking-wider">
                {isEs ? 'Pares vendidos al mes por la web:' : isPt ? 'Pares vendidos/mês pelo site:' : 'Pairs sold/month via web:'}
              </label>
              <span className="font-mono text-xl sm:text-2xl font-black text-theme-1">
                {pairsPerMonth} {isEs ? 'pares' : isPt ? 'pares' : 'pairs'}
              </span>
            </div>
            <input
              id={sliderId}
              type="range"
              min="5"
              max="60"
              step="1"
              value={pairsPerMonth}
              onChange={(e) => {
                setPairsPerMonth(Number(e.target.value));
                track('proposal_hero_interacted', { action: 'roi_pairs_slider', value: e.target.value });
              }}
              className="w-full h-2 bg-theme-9 rounded-lg appearance-none cursor-pointer accent-theme-1"
            />
            <div className="flex justify-between text-[11px] font-mono text-secondary/50 mt-1">
              <span>5 pares (arranque)</span>
              <span>25 pares (promedio)</span>
              <span>60 pares (temporada)</span>
            </div>
          </div>

          {/* Selector: Ticket promedio */}
          <div>
            <label className="text-xs sm:text-sm font-secondary font-bold text-secondary uppercase tracking-wider block mb-2">
              {isEs ? 'Precio promedio de venta por par:' : isPt ? 'Preço médio por par:' : 'Average price per pair:'}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: '$180.000', value: 180000, desc: isEs ? 'Running / Básico' : 'Running' },
                { label: '$250.000', value: 250000, desc: isEs ? 'OG Clásicos' : 'OG Classics' },
                { label: '$380.000', value: 380000, desc: isEs ? 'Hype / Edición' : 'Hype Drops' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTicketPrice(opt.value);
                    track('proposal_hero_interacted', { action: 'roi_ticket_selected', value: opt.value });
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    ticketPrice === opt.value
                      ? 'border-theme-1 bg-theme-1/15 text-secondary font-bold shadow-xs ring-1 ring-theme-1/40'
                      : 'border-theme-9 bg-primary text-secondary/70 hover:border-theme-1/30 hover:text-secondary'
                  }`}
                >
                  <span className="font-mono text-sm sm:text-base font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-secondary/60 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Margen de ganancia */}
          <div>
            <label className="text-xs sm:text-sm font-secondary font-bold text-secondary uppercase tracking-wider block mb-2">
              {isEs ? 'Margen de ganancia estimado:' : isPt ? 'Margem de lucro estimada:' : 'Estimated profit margin:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '25% (Volumen)', val: 25 },
                { label: '35% (Estándar)', val: 35 },
                { label: '50% (Exclusivo)', val: 50 },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setMarginPercent(m.val)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    marginPercent === m.val
                      ? 'border-theme-1 bg-secondary text-primary font-bold'
                      : 'border-theme-9 bg-primary text-secondary/70 hover:text-secondary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Math Output Card */}
        <div className="lg:col-span-5 bg-secondary text-primary rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-primary/70 uppercase">Facturación Mensual Web</span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-theme-1">
                {formatCop(monthlyRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-primary/70 uppercase">Ganancia Neta Estimada</span>
              <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
                +{formatCop(netMonthlyProfit)}
                <span className="text-xs text-primary/60 font-normal"> / mes</span>
              </span>
            </div>

            {/* Break-even highlight box */}
            <div className="rounded-xl bg-white/5 border border-white/15 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-theme-1 font-bold text-xs uppercase font-mono mb-2">
                <Zap className="w-4 h-4 text-theme-1 fill-theme-1" />
                Punto de Amortización Rápido
              </div>

              <div className="text-3xl sm:text-4xl font-mono font-black text-primary mb-1">
                Solo {pairsToAmortize} {pairsToAmortize === 1 ? 'par' : 'pares'}
              </div>

              <p className="text-xs text-primary/80 leading-relaxed">
                Con la venta de tus primeros <strong className="text-theme-1 font-bold">{pairsToAmortize} pares</strong> (aproximadamente en <strong className="text-white font-bold">{daysToAmortize} días</strong>), recuperas el 100% de la web de $500.000 COP. A partir del par #{pairsToAmortize + 1}, todo es ganancia recurrente.
              </p>
            </div>
          </div>

          {/* Interactive Amortization Bar */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between text-[11px] font-mono mb-1.5">
              <span className="text-theme-1 font-bold">● Amortización: {pairsToAmortize} pares</span>
              <span className="text-emerald-400 font-bold">● Ganancia pura: {Math.max(0, pairsPerMonth - pairsToAmortize)} pares</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="bg-theme-1 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (pairsToAmortize / pairsPerMonth) * 100)}%` }}
              />
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, 100 - (pairsToAmortize / pairsPerMonth) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-theme-9">
        <div className="flex items-center gap-2 text-xs text-secondary/70">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
          <span>$0 mensualidades obligatorias de hosting o plataforma (código 100% tuyo).</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href={briefLink}
            onClick={() => {
              track('cta_clicked', { source: 'roi_calculator_brief', pairs: pairsPerMonth });
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-secondary text-secondary font-secondary font-bold text-xs uppercase tracking-wider hover:bg-secondary hover:text-primary transition-all text-center inline-flex items-center justify-center gap-1.5"
          >
            <span>{isEs ? '📋 Personalizar en Brief Web (3 min)' : isPt ? '📋 Personalizar no Brief Web' : '📋 Customize in Web Brief'}</span>
          </Link>

          <a
            href={getWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track('proposal_whatsapp_clicked', { source: 'roi_calculator_cta', pairs: pairsPerMonth });
            }}
            className="btn-theme w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-secondary font-bold uppercase tracking-wider shadow-md hover:shadow-lg text-center inline-flex items-center justify-center gap-2"
          >
            <span>{isEs ? `💬 Quiero vender ${pairsPerMonth} pares/mes` : `💬 Quero vender ${pairsPerMonth} pares/mês`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
