'use client';

import React, { useState } from 'react';
import { Truck, ChevronDown, CheckCircle2 } from 'lucide-react';

interface SneakerLogisticsFaqProps {
  lang?: string;
}

export function SneakerLogisticsFaq({ lang = 'es' }: SneakerLogisticsFaqProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const carriers = [
    {
      name: 'Coordinadora',
      note: isEs
        ? 'Guías automáticas & Contra entrega'
        : isPt
          ? 'Guias automáticas & Entrega'
          : 'Automated labels & COD',
    },
    {
      name: 'Inter Rapidísimo',
      note: isEs
        ? 'Cobertura 1.100+ municipios'
        : isPt
          ? 'Cobertura em 1.100+ cidades'
          : '1,100+ cities coverage',
    },
    {
      name: 'Servientrega',
      note: isEs
        ? 'Logística inversa y cambios'
        : isPt
          ? 'Logística reversa e trocas'
          : 'Reverse logistics & exchanges',
    },
    {
      name: 'Envía',
      note: isEs
        ? 'Fletes económicos con recaudo'
        : isPt
          ? 'Fretes competitivos com cobrança'
          : 'Competitive shipping with collection',
    },
  ];

  const faqs = [
    {
      q: isEs
        ? '¿Cómo actualizo inventario, precios o desactivo tallas agotadas?'
        : isPt
          ? 'Como atualizo estoque, preços ou desativo tamanhos esgotados?'
          : 'How do I update inventory, prices, or disable out-of-stock sizes?',
      a: isEs
        ? 'Te entregamos un panel administrativo ultra simple optimizado para celular (o sincronización directa con Google Sheets si lo prefieres). En 5 segundos puedes marcar una talla como "Agotada", cambiar un precio o publicar un nuevo par sin saber programar.'
        : isPt
          ? 'Entregamos um painel administrativo super simples otimizado para celular (ou sincronização direta com Google Sheets). Em 5 segundos você marca um tamanho como "Esgotado", altera um preço ou publica um novo par sem precisar programar.'
          : 'We deliver an ultra-simple mobile-first admin panel (or direct live sync with Google Sheets if preferred). In 5 seconds you can mark a size as "Sold Out", update pricing, or publish a new drop with zero coding knowledge.',
    },
    {
      q: isEs
        ? '¿El hosting y el certificado SSL realmente son $0 COP de por vida?'
        : isPt
          ? 'A hospedagem e o certificado SSL realmente custam $0 para sempre?'
          : 'Are cloud hosting and SSL certificates truly $0 lifetime?',
      a: isEs
        ? 'Sí, 100% real. Desarrollamos con arquitectura Headless Serverless en Next.js alojada en la red edge mundial de Vercel/Cloudflare. A diferencia de Shopify (que cobra desde $39 USD/mes + comisiones por venta) o WordPress (que se cae en CyberLunes), tu tienda soporta miles de visitas en tus drops de tenis sin costos mensuales fijos.'
        : isPt
          ? 'Sim, 100% real. Desenvolvemos com arquitetura Headless Serverless em Next.js hospedada na rede edge global da Vercel/Cloudflare. Diferente da Shopify (que cobra mensalidades em dólar + taxas sobre vendas), sua loja suporta picos de tráfego nos lançamentos sem custo mensal fixo de servidor.'
          : 'Yes, 100% real. We build on Headless Serverless Next.js architecture hosted on Cloudflare/Vercel global Edge. Unlike Shopify (which charges from $39 USD/mo + transaction commissions) or WordPress (which crashes during high-traffic drops), your store effortlessly handles traffic spikes with zero monthly server bills.',
    },
    {
      q: isEs
        ? '¿Qué necesito entregarte para arrancar el desarrollo?'
        : isPt
          ? 'O que preciso te entregar para iniciar o desenvolvimento?'
          : 'What do I need to provide to kick off development?',
      a: isEs
        ? 'Solo 3 cosas: el nombre o logo de tu marca, tu lista de zapatillas con precios/tallas, y fotos tomadas con tu propio celular. Nuestro pipeline de Inteligencia Artificial (Nanobanana y Google Veo) se encarga de aislar el producto, montar el estudio 4K y generar los videos de pauta.'
        : isPt
          ? 'Apenas 3 coisas: o logo da sua marca, a lista de tênis com preços e tamanhos, e fotos tiradas com seu celular. Nosso pipeline de IA generativa cuida de isolar o produto, criar o cenário 4K e gerar os vídeos comerciais.'
          : 'Just 3 things: your brand logo, your sneaker product list with prices/sizes, and photos snapped with your smartphone. Our generative AI pipeline takes care of background isolation, 4K studio rendering, and ad video production.',
    },
    {
      q: isEs
        ? '¿Cómo entra el dinero de Addi, Wompi y Nequi a mi cuenta?'
        : isPt
          ? 'Como recebo o dinheiro das vendas na minha conta bancária?'
          : 'How do customer payments clear into my bank account?',
      a: isEs
        ? 'Directo a tu cuenta bancaria (Bancolombia, Nequi, Davivienda o cualquier banco colombiano). Con pasarelas como Addi recibes el 100% del pago de contado al siguiente día hábil, mientras Addi se encarga del cobro de las cuotas a tu cliente sin ningún riesgo de cartera para ti.'
        : isPt
          ? 'Direto na sua conta bancária. As compras parceladas ou via gateway depositam o valor integral na sua conta, sem riscos de inadimplência para você.'
          : 'Directly into your bank account. Installment platforms and gateway partners deposit the full purchase amount directly to you, managing buyer payments without any credit risk to your business.',
    },
    {
      q: isEs
        ? '¿Puedo ofrecer envíos con Pago Contra Entrega?'
        : isPt
          ? 'Posso oferecer envio com Pagamento na Entrega?'
          : 'Can I offer Cash on Delivery (COD)?',
      a: isEs
        ? 'Totalmente. La web queda configurada para admitir pedidos contra entrega integrados con plataformas logísticas (Hoko, Dropi o tu convenio directo con Coordinadora/Inter Rapidísimo), generando la guía con código de barras en 1 clic.'
        : isPt
          ? 'Totalmente. A loja fica pronta para aceitar pedidos com pagamento na entrega e integrada a transportadoras parceiras, gerando a etiqueta com código de barras em 1 clique.'
          : 'Absolutely. The store is configured for Cash on Delivery integrated with logistics carrier APIs, generating printable barcode shipping labels in 1 click.',
    },
    {
      q: isEs
        ? '¿Cuánto tiempo tarda la entrega de la tienda lista para vender?'
        : isPt
          ? 'Qual o prazo de entrega da loja pronta para vender?'
          : 'What is the delivery timeline for the launch-ready store?',
      a: isEs
        ? 'Entre 2 a 3 semanas hábiles desde la entrega de tus insumos iniciales. Te entregamos la tienda probada en pasarelas, con catálogo cargado, píxeles de Meta/TikTok instalados y una sesión de capacitación en video para tu equipo.'
        : isPt
          ? 'Entre 2 e 3 semanas úteis a partir do envio dos seus materiais. Entregamos a loja testada com gateways, catálogo carregado, pixels de Meta/TikTok instalados e treinamento em vídeo para sua equipe.'
          : 'Between 2 to 3 business weeks from initial asset handover. We deliver your store fully tested with live checkouts, initial catalog populated, Meta/TikTok ad pixels installed, and a custom video walkthrough for your team.',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const getWhatsAppFaqMessage = () => {
    const text = isEs
      ? 'Hola Andrés, tengo una pregunta sobre la propuesta de e-commerce de tenis:'
      : isPt
        ? 'Olá Andrés, tenho uma dúvida sobre a proposta de e-commerce de tênis:'
        : 'Hi Andrés, I have a question regarding the sneaker e-commerce proposal:';
    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="space-y-8">
      {/* 1. LOGISTICS CARRIERS BANNER */}
      <div className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-8 shadow-md">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-2xs mb-2">
            <Truck className="w-3.5 h-3.5" />
            {isEs
              ? 'LOGÍSTICA & DESPACHOS COLOMBIA'
              : isPt
                ? 'LOGÍSTICA & ENVIOS NACIONAIS'
                : 'LOGISTICS & NATIONWIDE SHIPPING'}
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-secondary">
            {isEs
              ? 'Integración Lista con Transportadoras Nacionales'
              : isPt
                ? 'Integração Pronta com Transportadoras'
                : 'Ready Integration with National Carriers'}
          </h3>
          <p className="text-xs sm:text-sm text-secondary/70 mt-1">
            {isEs
              ? 'Tu tienda se conecta con plataformas logísticas para generar guías con código de barras y liquidar fletes en tiempo real.'
              : isPt
                ? 'Sua loja se conecta a plataformas logísticas para gerar etiquetas de envio e calcular fretes em tempo real.'
                : 'Your store connects with carrier platforms to generate barcode shipping labels and calculate live rates.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {carriers.map((carrier, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-theme-5 border border-secondary/10 text-center flex flex-col justify-center items-center hover:border-theme-1/50 transition-colors"
            >
              <span className="font-heading font-black text-sm text-secondary block">
                {carrier.name}
              </span>
              <span className="text-[10px] font-mono text-secondary/60 mt-0.5 leading-tight">
                {carrier.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <div className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 shadow-lg">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-theme-1 block mb-1">
            {isEs ? 'TRANSPARENCIA TOTAL' : isPt ? 'TRANSPARÊNCIA TOTAL' : 'TOTAL TRANSPARENCY'}
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-secondary">
            {isEs
              ? 'Preguntas Frecuentes sobre el Proyecto'
              : isPt
                ? 'Perguntas Frequentes sobre o Projeto'
                : 'Frequently Asked Questions'}
          </h3>
          <p className="text-xs sm:text-sm text-secondary/70 mt-1">
            {isEs
              ? 'Todo lo que necesitas saber antes de dar el sí para tu nueva tienda online.'
              : isPt
                ? 'Tudo o que você precisa saber antes de iniciar sua nova loja online.'
                : 'Everything you need to know before moving forward with your new online store.'}
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border-2 border-secondary/10 overflow-hidden bg-theme-5 transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-secondary hover:text-theme-1 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-theme-1 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-secondary/60 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-theme-1' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-secondary/80 leading-relaxed border-t border-secondary/10 bg-primary/40 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support CTA */}
        <div className="mt-8 text-center pt-6 border-t border-secondary/10">
          <p className="text-xs text-secondary/70 mb-3">
            {isEs
              ? '¿Tienes una pregunta específica sobre tu catálogo o modelo de negocio?'
              : isPt
                ? 'Tem alguma dúvida específica sobre o seu catálogo ou negócio?'
                : 'Have a specific question about your catalog or business model?'}
          </p>
          <a
            href={getWhatsAppFaqMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider bg-theme-5 hover:bg-theme-1 hover:text-secondary border border-secondary/20 transition-all text-secondary"
          >
            <span>
              {isEs
                ? '💬 Resolver Dudas por WhatsApp'
                : isPt
                  ? '💬 Tirar Dúvidas no WhatsApp'
                  : '💬 Ask via WhatsApp'}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
