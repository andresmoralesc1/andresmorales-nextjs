'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';

type Props = {
  lang: string;
};

export function PortfolioRoiCalculator({ lang }: Props) {
  const [teamMembers, setTeamMembers] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [hourlyRate, setHourlyRate] = useState(22);

  // Automation calculations (assuming 70% of repetitive operational tasks are automatable)
  const calculation = useMemo(() => {
    const weeklyManualHours = teamMembers * hoursPerWeek;
    const monthlyManualHours = weeklyManualHours * 4.33;
    const yearlyManualHours = weeklyManualHours * 52;

    const monthlyCost = monthlyManualHours * hourlyRate;
    const yearlyCost = yearlyManualHours * hourlyRate;

    // 70% average automation efficiency with n8n/AI workflows
    const monthlyHoursSaved = Math.round(monthlyManualHours * 0.7);
    const yearlyHoursSaved = Math.round(yearlyManualHours * 0.7);
    const yearlyDollarsSaved = Math.round(yearlyCost * 0.7);

    return {
      monthlyHoursSaved,
      yearlyHoursSaved,
      yearlyDollarsSaved,
      efficiencyPct: 70,
    };
  }, [teamMembers, hoursPerWeek, hourlyRate]);

  return (
    <section className="section bg-background relative overflow-hidden border-t border-theme-9/50">
      <div className="container-page max-w-5xl">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-1/15 border border-theme-1/30 text-xs font-secondary font-bold text-secondary mb-3">
            <Calculator className="w-3.5 h-3.5 text-accent" />
            <span>
              {lang === 'en'
                ? 'ROI & Savings Simulator'
                : lang === 'pt'
                ? 'Simulador de ROI e Economia'
                : 'Simulador de ROI y Ahorro'}
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl mb-3 text-secondary">
            {lang === 'en'
              ? 'How much time and money are manual tasks costing you?'
              : lang === 'pt'
              ? 'Quanto tempo e dinheiro as tarefas manuais estão custando?'
              : '¿Cuánto tiempo y dinero te cuestan las tareas manuales?'}
          </h2>
          <p className="text-text text-sm md:text-base leading-relaxed">
            {lang === 'en'
              ? 'Move the sliders to project the annual hours and capital your team can reclaim by automating operational workflows with AI and n8n.'
              : lang === 'pt'
              ? 'Mova os controles para estimar o tempo e o capital que sua equipe pode recuperar automatizando processos operacionais.'
              : 'Mueve los controles para proyectar las horas y el capital anual que tu equipo puede recuperar automatizando flujos operativos.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-primary rounded-3xl border border-theme-9 p-6 md:p-10 shadow-xl">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider 1: Team Members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="roi-team-members"
                  className="text-xs sm:text-sm font-secondary font-bold text-secondary"
                >
                  {lang === 'en'
                    ? 'People doing repetitive tasks'
                    : lang === 'pt'
                    ? 'Pessoas fazendo tarefas manuais'
                    : 'Personas haciendo tareas repetitivas'}
                </label>
                <span className="font-mono text-sm font-bold text-secondary bg-theme-5 px-2.5 py-0.5 rounded-md border border-theme-9">
                  {teamMembers} {teamMembers === 1 ? 'persona' : 'personas'}
                </span>
              </div>
              <input
                id="roi-team-members"
                type="range"
                min="1"
                max="20"
                step="1"
                value={teamMembers}
                onChange={(e) => setTeamMembers(Number(e.target.value))}
                className="w-full accent-theme-1 cursor-pointer h-2 bg-theme-5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-text font-mono mt-1">
                <span>1</span>
                <span>10</span>
                <span>20+</span>
              </div>
            </div>

            {/* Slider 2: Hours per week */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="roi-hours-week"
                  className="text-xs sm:text-sm font-secondary font-bold text-secondary"
                >
                  {lang === 'en'
                    ? 'Weekly hours spent manually (per person)'
                    : lang === 'pt'
                    ? 'Horas semanais manuais (por pessoa)'
                    : 'Horas semanales manuales (por persona)'}
                </label>
                <span className="font-mono text-sm font-bold text-secondary bg-theme-5 px-2.5 py-0.5 rounded-md border border-theme-9">
                  {hoursPerWeek} hrs / sem
                </span>
              </div>
              <input
                id="roi-hours-week"
                type="range"
                min="2"
                max="30"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-theme-1 cursor-pointer h-2 bg-theme-5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-text font-mono mt-1">
                <span>2 hrs</span>
                <span>15 hrs</span>
                <span>30 hrs</span>
              </div>
            </div>

            {/* Slider 3: Hourly Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="roi-hourly-rate"
                  className="text-xs sm:text-sm font-secondary font-bold text-secondary"
                >
                  {lang === 'en'
                    ? 'Average team hourly rate'
                    : lang === 'pt'
                    ? 'Custo médio por hora da equipe'
                    : 'Tarifa promedio por hora del equipo'}
                </label>
                <span className="font-mono text-sm font-bold text-secondary bg-theme-5 px-2.5 py-0.5 rounded-md border border-theme-9">
                  ${hourlyRate} USD / hr
                </span>
              </div>
              <input
                id="roi-hourly-rate"
                type="range"
                min="10"
                max="60"
                step="2"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-theme-1 cursor-pointer h-2 bg-theme-5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-text font-mono mt-1">
                <span>$10 USD</span>
                <span>$35 USD</span>
                <span>$60 USD</span>
              </div>
            </div>
          </div>

          {/* Results Projection Card */}
          <div className="lg:col-span-5 bg-secondary text-primary rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-primary/70 block mb-1">
                {lang === 'en'
                  ? 'Projected Annual Recovery'
                  : lang === 'pt'
                  ? 'Recuperação Anual Projetada'
                  : 'Recuperación Anual Estimada'}
              </span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-heading font-bold text-theme-1">
                  ${calculation.yearlyDollarsSaved.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-primary/80">USD / año</span>
              </div>

              <div className="space-y-3.5 border-t border-white/10 pt-4 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary/80 inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-theme-1" />
                    {lang === 'en' ? 'Hours saved / month' : lang === 'pt' ? 'Horas salvas / mês' : 'Horas ahorradas / mes'}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    +{calculation.monthlyHoursSaved} hrs
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary/80 inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === 'en' ? 'Annual time recovered' : lang === 'pt' ? 'Tempo anual recuperado' : 'Tiempo anual recuperado'}
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    +{calculation.yearlyHoursSaved} hrs/año
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary/80 inline-flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    {lang === 'en' ? 'Efficiency improvement' : lang === 'pt' ? 'Ganho de eficiência' : 'Eficiencia operativa'}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    ~{calculation.efficiencyPct}%
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`${CALENDAR_BOOKING_URL}?notes=ROI-Estimated-Save-${calculation.yearlyDollarsSaved}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold text-xs sm:text-sm shadow-md transition-all group"
            >
              <span>
                {lang === 'en'
                  ? 'Reclaim this time with AI'
                  : lang === 'pt'
                  ? 'Recuperar esse tempo com IA'
                  : 'Recuperar este tiempo con IA'}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
