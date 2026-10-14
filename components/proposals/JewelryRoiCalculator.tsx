'use client';

import React, { useState } from 'react';
import { Sparkles, Calculator, Check, ArrowRight } from 'lucide-react';

interface JewelryRoiCalculatorProps {
  lang?: string;
}

export function JewelryRoiCalculator({ lang = 'es' }: JewelryRoiCalculatorProps) {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const [averageTicket, setAverageTicket] = useState<number>(2500000); // 2.5M COP
  const [piecesPerMonth, setPiecesPerMonth] = useState<number>(6); // 6 pieces
  const [profitMargin, setProfitMargin] = useState<number>(45); // 45% gross margin

  const baseWebCost = 500000; // $500.000 COP

  const monthlyGrossSales = averageTicket * piecesPerMonth;
  const monthlyGrossProfit = monthlyGrossSales * (profitMargin / 100);
  const piecesToBreakEven = Math.ceil(baseWebCost / (averageTicket * (profitMargin / 100)));
  const daysToBreakEven = Math.max(1, Math.round((piecesToBreakEven / piecesPerMonth) * 30));
  const annualProfit = monthlyGrossProfit * 12;

  const formatCop = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-8 md:p-10 shadow-xl">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-theme-1 text-secondary font-bold shadow-xs mb-3">
          <Calculator className="w-3.5 h-3.5" />
          {isEs
            ? 'SIMULADOR DE AMORTIZACIÓN // ALTA JOYERÍA'
            : isPt
              ? 'SIMULADOR DE RETORNO // ALTA JOALHERIA'
              : 'ROI SIMULATOR // FINE JEWELRY BOUTIQUE'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-secondary tracking-tight">
          {isEs
            ? '¿Con cuántas joyas vendidas amortizas tu tienda en Next.js?'
            : isPt
              ? 'Com quantas joias vendidas você amortiza sua loja Next.js?'
              : 'How many jewelry sales to break even on your Next.js store?'}
        </h3>
        <p className="text-xs sm:text-sm text-secondary/75 mt-2 leading-relaxed">
          {isEs
            ? 'En alta joyería el ticket promedio es elevado. Debido al bajo costo de desarrollo base ($500.000 COP), una sola joya vendida online suele recuperar el 100% de tu inversión.'
            : isPt
              ? 'Na alta joalheria o ticket médio é elevado. Como o investimento base é de apenas $500.000 COP (~$125 USD), uma única peça vendida online cobre todo o custo.'
              : 'In fine jewelry, average order value is high. Because our base development is only $500,000 COP (~$125 USD), just 1 online piece sale typically recovers 100% of your investment.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controles de Entrada */}
        <div className="lg:col-span-7 space-y-6 bg-theme-5 p-5 sm:p-6 rounded-2xl border border-secondary/10">
          {/* Slider 1: Ticket Promedio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-secondary font-bold">
              <span>{isEs ? 'Ticket promedio por joya' : isPt ? 'Ticket médio por joia' : 'Average piece price'}</span>
              <span className="font-mono text-sm text-theme-1 font-black">{formatCop(averageTicket)}</span>
            </div>
            <input
              type="range"
              min={800000}
              max={10000000}
              step={200000}
              value={averageTicket}
              onChange={(e) => setAverageTicket(Number(e.target.value))}
              className="w-full accent-theme-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-secondary/50">
              <span>$800.000</span>
              <span>$5.000.000</span>
              <span>$10.000.000+</span>
            </div>
          </div>

          {/* Slider 2: Piezas Vendidas al Mes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-secondary font-bold">
              <span>{isEs ? 'Joyas vendidas al mes online' : isPt ? 'Joias vendidas por mês online' : 'Jewelry pieces sold / month'}</span>
              <span className="font-mono text-sm text-theme-1 font-black">
                {piecesPerMonth} {isEs ? 'joyas' : isPt ? 'peças' : 'pieces'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={piecesPerMonth}
              onChange={(e) => setPiecesPerMonth(Number(e.target.value))}
              className="w-full accent-theme-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-secondary/50">
              <span>1 {isEs ? 'joya' : 'piece'}</span>
              <span>15 {isEs ? 'joyas' : 'pieces'}</span>
              <span>30 {isEs ? 'joyas' : 'pieces'}</span>
            </div>
          </div>

          {/* Slider 3: Margen de Ganancia */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-secondary font-bold">
              <span>{isEs ? 'Margen bruto estimado' : isPt ? 'Margem bruta estimada' : 'Gross profit margin'}</span>
              <span className="font-mono text-sm text-theme-1 font-black">{profitMargin}%</span>
            </div>
            <input
              type="range"
              min={25}
              max={65}
              step={5}
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              className="w-full accent-theme-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-secondary/50">
              <span>25%</span>
              <span>45% (Típico en joyería)</span>
              <span>65%</span>
            </div>
          </div>
        </div>

        {/* Panel de Resultados / Amortización */}
        <div className="lg:col-span-5 bg-secondary text-primary p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-1 block font-bold mb-1">
              {isEs ? 'PUNTO DE EQUILIBRIO' : isPt ? 'PONTO DE EQUILÍBRIO' : 'BREAK-EVEN POINT'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl sm:text-5xl font-black text-theme-1 tracking-tight">
                {piecesToBreakEven}
              </span>
              <span className="text-sm font-secondary font-bold uppercase text-primary/80">
                {piecesToBreakEven === 1 ? (isEs ? 'joya vendida' : isPt ? 'joia vendida' : 'piece sold') : (isEs ? 'joyas vendidas' : isPt ? 'joias vendidas' : 'pieces sold')}
              </span>
            </div>
            <p className="text-xs text-primary/70 mt-1 leading-snug">
              {isEs
                ? `Recuperas los $500.000 COP en aproximadamente ${daysToBreakEven} días de operación.`
                : isPt
                  ? `Você recupera o investimento em aproximadamente ${daysToBreakEven} dias de operação.`
                  : `You recover the $500,000 COP in approximately ${daysToBreakEven} days.`}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-primary/70">{isEs ? 'Ventas mensuales estimadas:' : isPt ? 'Vendas mensais estimadas:' : 'Estimated monthly revenue:'}</span>
              <span className="font-bold text-primary">{formatCop(monthlyGrossSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary/70">{isEs ? 'Ganancia bruta mensual:' : isPt ? 'Lucro bruto mensal:' : 'Estimated monthly profit:'}</span>
              <span className="font-bold text-emerald-400 text-sm">{formatCop(monthlyGrossProfit)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10 text-theme-1 font-bold">
              <span>{isEs ? 'Ganancia bruta anual:' : isPt ? 'Lucro bruto anual:' : 'Projected annual profit:'}</span>
              <span>{formatCop(annualProfit)}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>{isEs ? '0% Comisiones por venta de por vida' : isPt ? '0% Comissões sobre vendas para sempre' : '0% Sales commissions forever'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
