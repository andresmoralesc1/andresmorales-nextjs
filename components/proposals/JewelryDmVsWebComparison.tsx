'use client';

import React from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { XCircle, CheckCircle, Zap } from 'lucide-react';

interface JewelryDmVsWebComparisonProps {
  lang: string;
}

export function JewelryDmVsWebComparison({ lang }: JewelryDmVsWebComparisonProps) {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';
  const briefLink = getLocalizedPath(
    '/brief-web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const dmPains = [
    {
      title: isEs
        ? 'Desconfianza en la autenticidad'
        : isPt
          ? 'Desconfiança na autenticidade'
          : 'Buyer doubts on authenticity',
      desc: isEs
        ? 'Por chat es difícil demostrar que el oro es de 18k o que el diamante es natural certificado. El comprador duda y no se atreve a transferir millones.'
        : isPt
          ? 'Por mensagem é difícil comprovar que o ouro é 18k legítimo ou que o diamante possui certificado GIA.'
          : 'Over chat, it is difficult to prove the gold is genuine 18k or the diamond is certified. Affluent shoppers hesitate to transfer high sums.',
    },
    {
      title: isEs
        ? 'Miedo a equivocarse en la talla'
        : isPt
          ? 'Incerteza na medida do anel'
          : 'Hesitation over ring sizing',
      desc: isEs
        ? 'Clientes buscando anillos de compromiso abandonan porque no saben cómo medir el dedo y temen costosos ajustes posteriores.'
        : isPt
          ? 'Clientes em busca de alianças desistem por não saberem a medida exata do aro e temerem custos de ajuste.'
          : 'Shoppers looking for engagement rings drop off because they cannot calibrate finger sizes over DM.',
    },
    {
      title: isEs
        ? 'Fotos comprimidas que apagan el brillo'
        : isPt
          ? 'Fotos comprimidas sem brilho'
          : 'Compressed photos ruin gem luster',
      desc: isEs
        ? 'La compresión de WhatsApp e Instagram arruina la refracción y el fuego de las gemas, haciendo que joyas de lujo parezcan bisutería barata.'
        : isPt
          ? 'A compressão de imagem do WhatsApp apaga o fogo e a lapidação das gemas, fazendo peças finas parecerem bijuterias.'
          : 'Social media compression ruins diamond scintillation and optical fire, making high jewelry look flat and cheap.',
    },
    {
      title: isEs
        ? 'Riesgo de comprobantes falsos'
        : isPt
          ? 'Risco de comprovantes falsos'
          : 'Risk of fraudulent bank transfer slips',
      desc: isEs
        ? 'Verificar comprobantes editados en Photoshop para no despachar una joya de $4.000.000 COP sin fondos acreditados en tu cuenta.'
        : isPt
          ? 'Conferir extratos bancários manualmente para não despachar uma joia valiosa com comprovante forjado.'
          : 'Manually verifying altered wire transfer slips to avoid shipping a $1,000+ USD piece without cleared funds.',
    },
  ];

  const webBenefits = [
    {
      title: isEs
        ? 'Certificados GIA y Gemológicos a la vista'
        : isPt
          ? 'Laudos e Certificados GIA para download'
          : 'GIA & Gemological Certificates at 1 click',
      desc: isEs
        ? 'La ficha de producto permite descargar el PDF del laudo pericial oficial, generando certeza inmediata para compras de alto valor.'
        : isPt
          ? 'A página do produto permite baixar o laudo em PDF com 1 clique, gerando segurança instantânea para compras de alto ticket.'
          : 'Product detail pages provide immediate downloadable GIA certificates, establishing unshakeable credibility.',
    },
    {
      title: isEs
        ? 'Calibrador digital interactivo de dedos'
        : isPt
          ? 'Medidor virtual interativo de aros'
          : 'Interactive digital ring sizing guide',
      desc: isEs
        ? 'Guía milimétrica con equivalencias entre tallas US, Colombia y milímetros de circunferencia, reduciendo reclamos en un 70%.'
        : isPt
          ? 'Tabela milimétrica com equivalências de aros, reduzindo trocas e custos de ourivesaria em mais de 70%.'
          : 'Millimeter calibration chart with US/local conversions that slashes finger resizing requests by 70%.',
    },
    {
      title: isEs
        ? 'Macro Zoom 4K sin pérdida de calidad'
        : isPt
          ? 'Macro Zoom 4K em alta resolução'
          : 'Lossless 4K Macro Brilliance (AVIF)',
      desc: isEs
        ? 'Imágenes ultra-nítidas en formato AVIF que cargan en 0.8s y resaltan cada faceta del diamante y el pulido del oro.'
        : isPt
          ? 'Imagens ultranítidas em formato AVIF que carregam em 0.8s e destacam cada faceta lapidada da gema.'
          : 'Sub-0.8s AVIF rendering highlighting diamond scintillation and mirror-polished gold hallmarking.',
    },
    {
      title: isEs
        ? 'Pasarelas seguras con antifraude bancario'
        : isPt
          ? 'Checkout blindado com antifraude'
          : 'Bank-grade encrypted checkout & Addi',
      desc: isEs
        ? 'Cobros procesados por Wompi, tarjetas de crédito de alto cupo y Addi a cuotas con acreditación bancaria inmediata.'
        : isPt
          ? 'Transações processadas com validação antifraude, cartões de crédito e parcelamento bancário automático.'
          : 'Secure payment rails (Wompi, credit cards, bank wire validation, Addi installments) with zero manual friction.',
    },
  ];

  return (
    <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 md:p-12 shadow-xl">
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-theme-1 text-secondary font-bold shadow-xs mb-3">
          <Zap className="w-3.5 h-3.5" />
          {isEs
            ? 'COMPARATIVA DE CONVERSIÓN EN JOYERÍA'
            : isPt
              ? 'COMPARATIVO DE CONVERSÃO EM JOIAS'
              : 'LUXURY CONVERSION COMPARISON'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-secondary tracking-tight">
          {isEs
            ? 'Vender Joyas por DM de Instagram vs Tener tu Boutique en Next.js'
            : isPt
              ? 'Vender Joias por Direct no Instagram vs Sua Boutique em Next.js'
              : 'Selling Jewelry via Instagram DM vs Having Your Next.js Boutique'}
        </h3>
        <p className="text-xs sm:text-sm text-secondary/75 mt-2 leading-relaxed">
          {isEs
            ? 'La alta joyería depende de la confianza y la reputación. Mira cómo cambia la experiencia cuando pasas de responder mensajes manuales a una infraestructura de prestigio.'
            : isPt
              ? 'A alta joalheria depende de reputação e credibilidade. Veja a diferença ao migrar de mensagens manuais para uma boutique digital de prestígio.'
              : 'Fine jewelry depends on prestige and trust. Compare manual chatting against a dedicated high-performance boutique.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Lado A: Instagram DM */}
        <div className="rounded-2xl bg-red-50/50 border border-red-200/80 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-red-200/60">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <h4 className="font-heading text-lg font-bold text-red-950">
                {isEs
                  ? 'Venta Manual por DM de Instagram'
                  : isPt
                    ? 'Venda Manual por Mensagem (DM)'
                    : 'Manual Instagram DM Sales'}
              </h4>
            </div>

            <div className="space-y-4">
              {dmPains.map((pain, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-sm mt-0.5">✕</span>
                  <div>
                    <h5 className="text-xs sm:text-[13px] font-bold text-red-950">{pain.title}</h5>
                    <p className="text-[11px] sm:text-xs text-red-900/80 leading-relaxed mt-0.5">
                      {pain.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-red-200/60 text-center">
            <span className="text-xs font-mono font-bold text-red-800 uppercase">
              {isEs ? 'Resultado: Hasta 55% de ventas perdidas' : isPt ? 'Resultado: Até 55% de vendas perdidas' : 'Result: Up to 55% lost sales'}
            </span>
          </div>
        </div>

        {/* Lado B: Boutique Next.js */}
        <div className="rounded-2xl bg-emerald-50/50 border-2 border-emerald-400 p-6 sm:p-7 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="font-heading text-lg font-bold text-emerald-950">
                {isEs
                  ? 'Tu Boutique de Alta Joyería en Next.js'
                  : isPt
                    ? 'Sua Boutique de Joias em Next.js'
                    : 'Your Next.js Fine Jewelry Boutique'}
              </h4>
            </div>

            <div className="space-y-4">
              {webBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-emerald-600 font-black text-sm mt-0.5">✓</span>
                  <div>
                    <h5 className="text-xs sm:text-[13px] font-bold text-emerald-950">{benefit.title}</h5>
                    <p className="text-[11px] sm:text-xs text-emerald-900/80 leading-relaxed mt-0.5">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200 text-center">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase">
              {isEs ? 'Resultado: Ventas de alto ticket 24/7 con prestigio' : isPt ? 'Resultado: Vendas de alto valor 24/7 com prestígio' : 'Result: High-ticket sales 24/7 with authentic prestige'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
