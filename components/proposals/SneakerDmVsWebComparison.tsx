'use client';

import React from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { XCircle, CheckCircle, Zap } from 'lucide-react';

interface SneakerDmVsWebComparisonProps {
  lang: string;
}

export function SneakerDmVsWebComparison({ lang }: SneakerDmVsWebComparisonProps) {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';
  const briefLink = getLocalizedPath(
    '/brief-web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const dmPains = [
    {
      title: isEs
        ? 'Atención lenta = Ventas que se van'
        : isPt
          ? 'Atendimento lento = Vendas perdidas'
          : 'Slow replies = Lost sales',
      desc: isEs
        ? 'El cliente pregunta "¿Precio y qué tallas tienes?" a las 11:30 PM y compra en otra tienda porque tardaste 10 minutos en responder.'
        : isPt
          ? 'O cliente pergunta preço e tamanho à noite e compra em outra loja porque demorou para responder.'
          : 'Shopper asks "Price and available sizes?" at 11:30 PM and buys elsewhere because you took 10 minutes to reply.',
    },
    {
      title: isEs
        ? 'Mandar 20 fotos a mano una por una'
        : isPt
          ? 'Enviar 20 fotos manualmente'
          : 'Sending 20 photos one by one',
      desc: isEs
        ? 'Saturando la memoria de tu teléfono y perdiendo hasta 4 horas al día repitiendo la misma información a 50 prospectos que no compran.'
        : isPt
          ? 'Lotando a memória do celular e gastando horas do seu dia repetindo as mesmas informações.'
          : 'Clogging your phone storage and wasting 4 hours a day repeating the same information to 50 tire-kickers.',
    },
    {
      title: isEs
        ? 'Riesgo de comprobantes falsos'
        : isPt
          ? 'Risco de comprovantes falsos'
          : 'Risk of fake payment receipts',
      desc: isEs
        ? 'Verificar comprobantes de Nequi o transferencias editadas con Photoshop para no despachar mercancía sin pago real.'
        : isPt
          ? 'Ter que conferir cada comprovante no app do banco para não enviar produto sem pagamento real.'
          : 'Constantly verifying edited transfer screenshots to avoid dispatching products without cleared funds.',
    },
    {
      title: isEs
        ? 'Descontrol de tallas agotadas'
        : isPt
          ? 'Descontrole de estoque'
          : 'Overselling out-of-stock sizes',
      desc: isEs
        ? 'Tallas que se sobrevenden por accidente en WhatsApp, obligándote a cancelar el pedido y pasar la vergüenza con el cliente.'
        : isPt
          ? 'Tamanhos que vendem duas vezes por engano, gerando cancelamentos e reclamações.'
          : 'Sizes double-sold by mistake via WhatsApp, forcing awkward cancellations and damaged credibility.',
    },
    {
      title: isEs
        ? 'Dependencia 100% de tu tiempo'
        : isPt
          ? 'Dependência total do seu tempo'
          : '100% tied to your personal time',
      desc: isEs
        ? 'Si tú o tu asesor se enferman, viajan o se desconectan del celular, las ventas de tu negocio se detienen en seco.'
        : isPt
          ? 'Se você não estiver com o celular na mão, sua loja simplesmente não vende nada.'
          : 'If you or your team get sick, travel, or go offline, your store revenue grinds to a complete halt.',
    },
  ];

  const webBenefits = [
    {
      title: isEs
        ? 'Catálogo ultra-rápido (<0.8s en 4G)'
        : isPt
          ? 'Catálogo ultra-rápido (<0.8s)'
          : 'Ultra-fast catalog (<0.8s on 4G)',
      desc: isEs
        ? 'El cliente filtra por su talla exacta (US 8 a 11.5) y silueta en su celular, agrega al carrito y compra en menos de 30 segundos.'
        : isPt
          ? 'O comprador filtra pelo tamanho exato no celular, coloca no carrinho e fecha a compra em 30 segundos.'
          : 'Shopper filters by their exact size and silhouette on mobile, adds to cart, and checks out in under 30 seconds.',
    },
    {
      title: isEs
        ? 'Cobro en caliente con pasarelas locales'
        : isPt
          ? 'Pagamento imediato sem fricção'
          : 'Instant frictionless checkout',
      desc: isEs
        ? 'Aprovecha las compras por impulso ofreciendo Addi a 3 cuotas sin interés, tarjetas, Nequi y pago contra entrega oficial.'
        : isPt
          ? 'Venda por impulso com cartão, parcelamento e pagamento na entrega integrado.'
          : 'Capitalize on impulse buyers with 0% interest installments, credit cards, digital wallets, and cash on delivery.',
    },
    {
      title: isEs
        ? 'Pagos 100% seguros y verificados'
        : isPt
          ? 'Pagamentos 100% verificados'
          : '100% verified automated payments',
      desc: isEs
        ? 'El dinero entra en automático a tu cuenta bancaria. La plataforma te genera la orden limpia con datos de envío exactos.'
        : isPt
          ? 'O dinheiro entra direto na sua conta bancária e você recebe o pedido pronto para despacho.'
          : 'Funds clear directly into your bank account. The system generates a clean dispatch-ready order with shipping info.',
    },
    {
      title: isEs
        ? 'Inventario sincronizado en tiempo real'
        : isPt
          ? 'Estoque sincronizado em tempo real'
          : 'Real-time inventory synchronization',
      desc: isEs
        ? 'Cuando se vende el último par en talla 9.5 US, el botón cambia de inmediato a "Agotado", protegiendo tu reputación.'
        : isPt
          ? 'Quando acaba o último par daquele tamanho, o botão muda sozinho para "Esgotado".'
          : 'When the last pair in size 9.5 sells out, the button instantly updates to "Sold Out", protecting your brand reputation.',
    },
    {
      title: isEs
        ? 'Tu tienda factura mientras duermes'
        : isPt
          ? 'Sua loja fatura enquanto você dorme'
          : 'Your store sells while you sleep',
      desc: isEs
        ? 'Te levantas por la mañana con pedidos listos para rotular y despachar con transportadoras nacionales.'
        : isPt
          ? 'Você acorda de manhã com pedidos pagos e prontos para embalar e enviar pelos Correios/transportadoras.'
          : 'Wake up to verified paid orders ready to print labels and dispatch with courier tracking.',
    },
  ];

  return (
    <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
      {/* Eyebrow & Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-3">
          <Zap className="w-3.5 h-3.5 text-secondary fill-secondary" />
          {isEs
            ? 'COMPARATIVA REAL // EL CUELLO DE BOTELLA'
            : isPt
              ? 'COMPARATIVO // O GARGALO OPERACIONAL'
              : 'REAL COMPARISON // THE OPERATIONAL BOTTLENECK'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary tracking-tight mb-3">
          {isEs
            ? 'Vender por DM de Instagram vs. Tu Tienda Next.js'
            : isPt
              ? 'Vender pelo Instagram vs. Sua Loja Next.js'
              : 'Selling via Instagram DM vs. Your Headless Next.js Store'}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-secondary/80 leading-relaxed font-normal">
          {isEs
            ? 'Si hoy vendes zapatillas únicamente por mensajes directos, estás perdiendo hasta el 40% de los clientes que llegan por tu pauta publicitaria. Mira la diferencia:'
            : isPt
              ? 'Vender apenas por mensagens diretas faz você perder clientes todos os dias. Veja o contraste:'
              : 'If you sell sneakers exclusively through DMs today, you lose up to 40% of ad traffic. Here is the operational contrast:'}
        </p>
      </div>

      {/* Side by side comparison grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-8">
        {/* Left Card: El dolor del DM */}
        <div className="rounded-2xl bg-red-50/40 border-2 border-red-200/80 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-red-200/60">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                  ✕
                </span>
                <span className="font-heading text-lg sm:text-xl font-bold text-red-950">
                  {isEs
                    ? 'Vender por DM / WhatsApp'
                    : isPt
                      ? 'Vender só por DM'
                      : 'Selling via DM / WhatsApp'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 px-2.5 py-1 rounded-md bg-red-100/80">
                {isEs
                  ? 'Manual & Lento'
                  : isPt
                    ? 'Manual & Lento'
                    : 'Manual & Slow'}
              </span>
            </div>

            <ul className="space-y-4">
              {dmPains.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-none mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-red-950 mb-0.5">{item.title}</p>
                    <p className="text-[11px] sm:text-xs text-red-900/80 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-red-200/60 flex items-center gap-2 text-xs font-mono font-bold text-red-800">
            <span>{isEs ? '⚠️ Conclusión:' : isPt ? '⚠️ Conclusão:' : '⚠️ Takeaway:'}</span>
            <span>
              {isEs
                ? 'Te vuelves esclavo del chat y pierdes ventas a medianoche.'
                : isPt
                  ? 'Você vira refém do chat e perde vendas na madrugada.'
                  : 'You stay chained to customer chat and bleed midnight sales.'}
            </span>
          </div>
        </div>

        {/* Right Card: La solución con Next.js */}
        <div className="rounded-2xl bg-secondary text-primary border-2 border-theme-1 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-theme-1/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-theme-1 text-secondary flex items-center justify-center font-bold text-sm shadow-xs">
                  ✓
                </span>
                <span className="font-heading text-lg sm:text-xl font-bold text-primary">
                  {isEs
                    ? 'Tu Tienda Next.js Headless'
                    : isPt
                      ? 'Sua Loja Next.js'
                      : 'Your Headless Next.js Store'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary px-2.5 py-1 rounded-md bg-theme-1">
                {isEs
                  ? 'Automático 24/7'
                  : isPt
                    ? 'Automático 24/7'
                    : 'Automated 24/7'}
              </span>
            </div>

            <ul className="space-y-4">
              {webBenefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-none mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-primary mb-0.5 flex items-center gap-1.5">
                      <span>{item.title}</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-primary/80 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono font-bold text-theme-1">
            <span>{isEs ? '🚀 Conclusión:' : isPt ? '🚀 Conclusão:' : '🚀 Takeaway:'}</span>
            <span className="text-white">
              {isEs
                ? 'Escalas tus ventas sin multiplicar las horas de trabajo.'
                : isPt
                  ? 'Você escala suas vendas sem multiplicar suas horas.'
                  : 'Scale your revenue without multiplying working hours.'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom KPI Banner */}
      <div className="rounded-2xl bg-theme-5 border border-secondary/15 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-center md:text-left">
          <div>
            <div className="font-mono text-2xl font-black text-secondary">
              {isEs ? '+25 Horas' : isPt ? '+25 Horas' : '+25 Hours'}
            </div>
            <p className="text-[11px] text-secondary/70 font-medium">
              {isEs
                ? 'Ahorradas al mes en chat'
                : isPt
                  ? 'Economizadas por mês no chat'
                  : 'Saved monthly in manual chat'}
            </p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-theme-9" />
          <div>
            <div className="font-mono text-2xl font-black text-theme-1">+35% a 60%</div>
            <p className="text-[11px] text-secondary/70 font-medium">
              {isEs
                ? 'Mayor conversión en Ads'
                : isPt
                  ? 'Maior conversão em Ads'
                  : 'Higher ad conversion rate'}
            </p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-theme-9" />
          <div>
            <div className="font-mono text-2xl font-black text-emerald-700">
              {isEs ? '$0 COP' : isPt ? '$0' : '$0 / mo'}
            </div>
            <p className="text-[11px] text-secondary/70 font-medium">
              {isEs
                ? 'Costos mensuales de servidor'
                : isPt
                  ? 'Custo mensal de servidor'
                  : 'Monthly server hosting bills'}
            </p>
          </div>
        </div>

        <Link
          href={briefLink}
          onClick={() => {
            track('cta_clicked', { source: 'dm_vs_web_brief_cta' });
          }}
          className="btn-theme px-5 py-3 rounded-xl text-xs font-secondary font-bold uppercase tracking-wider text-center inline-flex items-center gap-2 shadow-md hover:shadow-lg flex-none"
        >
          <span>
            {isEs
              ? 'Quiero mi tienda en Next.js →'
              : isPt
                ? 'Quero minha loja Next.js →'
                : 'Build My Next.js Store →'}
          </span>
        </Link>
      </div>
    </section>
  );
}
