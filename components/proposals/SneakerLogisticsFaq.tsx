'use client';

import React, { useState } from 'react';
import { Truck, HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface SneakerLogisticsFaqProps {
  lang?: string;
}

export function SneakerLogisticsFaq({ lang = 'es' }: SneakerLogisticsFaqProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const carriers = [
    { name: 'Coordinadora', note: 'Guías automáticas & Contra entrega' },
    { name: 'Inter Rapidísimo', note: 'Cobertura 1.100+ municipios' },
    { name: 'Servientrega', note: 'Logística inversa y cambios' },
    { name: 'Envía', note: 'Fletes económicos con recaudo' },
  ];

  const faqs = [
    {
      q: '¿Cómo actualizo inventario, precios o desactivo tallas agotadas?',
      a: 'Te entregamos un panel administrativo ultra simple optimizado para celular (o sincronización directa con Google Sheets si lo prefieres). En 5 segundos puedes marcar una talla como "Agotada", cambiar un precio o publicar un nuevo par sin saber programar.',
    },
    {
      q: '¿El hosting y el certificado SSL realmente son $0 COP de por vida?',
      a: 'Sí, 100% real. Desarrollamos con arquitectura Headless Serverless en Next.js alojada en la red edge mundial de Vercel/Cloudflare. A diferencia de Shopify (que cobra desde $39 USD/mes + comisiones por venta) o WordPress (que se cae en CyberLunes), tu tienda soporta miles de visitas en tus drops de tenis sin costos mensuales fijos.',
    },
    {
      q: '¿Qué necesito entregarte para arrancar el desarrollo?',
      a: 'Solo 3 cosas: el nombre o logo de tu marca, tu lista de zapatillas con precios/tallas, y fotos tomadas con tu propio celular. Nuestro pipeline de Inteligencia Artificial (Nanobanana y Google Veo) se encarga de aislar el producto, montar el estudio 4K y generar los videos de pauta.',
    },
    {
      q: '¿Cómo entra el dinero de Addi, Wompi y Nequi a mi cuenta?',
      a: 'Directo a tu cuenta bancaria (Bancolombia, Nequi, Davivienda o cualquier banco colombiano). Con Addi recibes el 100% del pago de contado al siguiente día hábil, mientras Addi se encarga del cobro de las cuotas a tu cliente sin ningún riesgo de cartera para ti.',
    },
    {
      q: '¿Puedo ofrecer envíos con Pago Contra Entrega?',
      a: 'Totalmente. La web queda configurada para admitir pedidos contra entrega integrados con plataformas logísticas (Hoko, Dropi o tu convenio directo con Coordinadora/Inter Rapidísimo), generando la guía con código de barras en 1 clic.',
    },
    {
      q: '¿Cuánto tiempo tarda la entrega de la tienda lista para vender?',
      a: 'Entre 2 a 3 semanas hábiles desde la entrega de tus insumos iniciales. Te entregamos la tienda probada en pasarelas, con catálogo cargado, píxeles de Meta/TikTok instalados y una sesión de capacitación en video para tu equipo.',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <section className="space-y-8">
      {/* 1. LOGISTICS CARRIERS BANNER */}
      <div className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-8 shadow-md">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-2">
            <Truck className="w-3.5 h-3.5" /> LOGÍSTICA & DESPACHOS COLOMBIA
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-secondary">
            Integración Lista con Transportadoras Nacionales
          </h3>
          <p className="text-xs sm:text-sm text-secondary/70 mt-1">
            Tu tienda se conecta con las principales redes de envío del país para cálculo de fletes en vivo y generación de guías en 1 clic.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {carriers.map((carrier, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-theme-5 border border-secondary/10 flex flex-col justify-between hover:border-theme-1/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-black text-sm sm:text-base text-secondary">
                  {carrier.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] font-mono text-secondary/70 leading-snug">
                {carrier.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FAQ ACCORDION */}
      <div className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 shadow-lg">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-5 text-secondary border border-secondary/15 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-theme-1" /> RESOLVEMOS TUS DUDAS
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-secondary">
            Preguntas Frecuentes de Dueños de Sneakers
          </h3>
          <p className="text-xs sm:text-sm text-secondary/70 mt-1">
            Claridad total antes de empezar: costos, operación diaria y soporte continuo.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-secondary/15 bg-theme-5 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-secondary hover:text-theme-1 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-theme-1 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-secondary/10 mt-1">
                    <p className="text-xs sm:text-sm text-secondary/80 leading-relaxed font-normal pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
