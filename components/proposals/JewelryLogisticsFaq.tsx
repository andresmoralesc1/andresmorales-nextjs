'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, CheckCircle2, Lock, Truck, Award } from 'lucide-react';

interface JewelryLogisticsFaqProps {
  lang?: string;
}

export function JewelryLogisticsFaq({ lang = 'es' }: JewelryLogisticsFaqProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const carriers = [
    {
      name: isEs ? 'Envíos Asegurados' : isPt ? 'Envios Assegurados' : 'Insured Couriers',
      note: isEs
        ? 'Póliza 100% sobre valor declarado'
        : isPt
          ? 'Seguro total sobre valor declarado'
          : '100% Declared value insurance policy',
    },
    {
      name: isEs ? 'Empaque Ciego Antirrobo' : isPt ? 'Embalagem Discreta Blindada' : 'Tamper-Proof Blind Box',
      note: isEs
        ? 'Sin logos ni marcas externas visibles'
        : isPt
          ? 'Sem identificação externa de joalheria'
          : 'Zero external branding or jewelry keywords',
    },
    {
      name: isEs ? 'Entrega Personal en Mano' : isPt ? 'Entrega em Mãos' : 'Hand-to-Hand Delivery',
      note: isEs
        ? 'Firma obligatoria y cotejo de cédula'
        : isPt
          ? 'Assinatura obrigatória e documento'
          : 'Mandatory signature & ID verification',
    },
    {
      name: isEs ? 'Exportación DHL Express' : isPt ? 'Exportação DHL Express' : 'DHL Express Global',
      note: isEs
        ? 'Gemas y esmeraldas al exterior con guía'
        : isPt
          ? 'Gemas para o exterior com rastreio'
          : 'International gemstone export tracking',
    },
  ];

  const faqs = [
    {
      q: isEs
        ? '¿Cómo se protegen los envíos de alta joyería para evitar robos durante el transporte?'
        : isPt
          ? 'Como os envios de joias são protegidos contra extravio e furto durante o transporte?'
          : 'How are fine jewelry shipments protected against theft or loss in transit?',
      a: isEs
        ? 'Se utiliza la modalidad de "empaque ciego": cajas externas neutras sin mención de la palabra joyería, oro o marcas visibles, selladas con precinto de seguridad numerado. El despacho se hace con guía asegurada al 100% del valor de la joya. En caso de siniestro, la póliza de la transportadora cubre la totalidad del valor.'
        : isPt
          ? 'Utiliza-se embalagem discreta neutra, sem qualquer menção à joalheria, ouro ou marcas externas, com fita lacrada numerada e seguro de 100% do valor declarado. Em caso de extravio, a seguradora cobre integralmente o valor da peça.'
          : 'All shipments use blind neutral packaging with zero external mention of jewelry, gold, or brand names, sealed with tamper-evident security tape. Every dispatch carries 100% declared value insurance coverage.',
    },
    {
      q: isEs
        ? '¿Cómo saben los compradores su talla exacta de anillo para evitar devoluciones?'
        : isPt
          ? 'Como os clientes descobrem a medida exata do anel para evitar trocas?'
          : 'How do shoppers determine their exact ring size to prevent returns?',
      a: isEs
        ? 'La tienda incluye el calibrador digital interactivo en mm y la tabla de equivalencias (US, Colombia y milímetros de circunferencia/diámetro). Además, se ofrece una guía descargable en PDF para medir anillos en casa. Esto reduce las solicitudes de reajuste de talla en más de un 70%.'
        : isPt
          ? 'A loja conta com medidor virtual interativo com equivalências em milímetros (aro brasileiro, US e diâmetro). O cliente também pode baixar um guia em PDF para medir anéis que já possui, reduzindo trocas em mais de 70%.'
          : 'The store features an interactive digital ring calibrator and conversion chart (US, international standards, and mm diameter/circumference), plus a printable ring sizer PDF, cutting size adjustments by 70%.',
    },
    {
      q: isEs
        ? '¿Cómo se integran y visualizan los certificados de autenticidad (GIA / Gemológicos)?'
        : isPt
          ? 'Como os laudos e certificados GIA são exibidos e entregues ao cliente?'
          : 'How are authenticity certificates (GIA / Gemological) displayed and delivered?',
      a: isEs
        ? 'Cada joya tiene un visor digital en la ficha de producto donde el cliente puede verificar los 4 Cs (Quilates, Color, Claridad, Corte) y descargar el certificado original en PDF. El certificado físico original se empaca sellado dentro del estuche de lujo con su respectivo número de reporte.'
        : isPt
          ? 'Cada peça possui um módulo na página do produto onde o cliente confere os 4 Cs (Quilates, Cor, Pureza, Lapidação) e pode baixar o laudo em PDF. O laudo físico original segue lacrado dentro da caixa de luxo da joia.'
          : 'Each product detail page includes a certificate preview where buyers inspect the 4 Cs and download high-res authentication PDFs. The physical embossed certificate is sealed inside the luxury jewelry box upon delivery.',
    },
    {
      q: isEs
        ? '¿Cómo se gestionan pagos de alto monto (compras de $3.000.000 a $15.000.000 COP)?'
        : isPt
          ? 'Como funcionam os pagamentos de alto valor (compras de R$ 3.000 a R$ 20.000)?'
          : 'How are high-ticket payments handled (purchases from $800 to $5,000+ USD)?',
      a: isEs
        ? 'La plataforma se integra con Wompi y pasarelas bancarias de alto cupo que aceptan tarjetas de crédito sin bloquearse por montos altos, PSE con verificación bancaria directa, transferencias verificadas y Addi para pagos a cuotas. Los fondos van directamente a tu cuenta bancaria sin comisiones abusivas.'
        : isPt
          ? 'A plataforma opera com gateways bancários preparados para transações de limites altos de cartão de crédito, transferências diretas verificadas e opções de parcelamento bancário seguro.'
          : 'The platform integrates with high-limit payment rails including Wompi, credit card gateways with bank-grade 3D Secure anti-fraud checks, verified wire transfers, and 0% installments via Addi.',
    },
    {
      q: isEs
        ? '¿Puedo cotizar y atender joyas personalizadas o sobre pedido?'
        : isPt
          ? 'Posso atender encomendas e joias personalizadas sob medida?'
          : 'Can I quote bespoke custom jewelry made to order?',
      a: isEs
        ? 'Sí. La tienda incluye un botón de Conserjería VIP de WhatsApp que precarga automáticamente el modelo, el metal elegido (oro amarillo, blanco, rosa, platino) y la talla deseada, permitiéndote cerrar encargos especiales de forma ágil y personalizada.'
        : isPt
          ? 'Sim. A loja inclui um botão de Concierge VIP no WhatsApp que já preenche a referência da joia, o metal e o aro escolhido, permitindo que sua equipe feche encomendas sob medida com atendimento consultivo.'
          : 'Yes. Every piece includes a VIP Concierge WhatsApp link that pre-fills the reference, chosen metal finish, and desired ring size, allowing your team to consult and finalize bespoke commissions seamlessly.',
    },
    {
      q: isEs
        ? '¿Quién es el dueño del código fuente, fotos y base de datos de clientes?'
        : isPt
          ? 'Quem é o proprietário do código, fotos e base de dados de clientes?'
          : 'Who owns the codebase, images, and client customer database?',
      a: isEs
        ? 'El código es 100% de tu propiedad. No hay comisiones sobre tus ventas ni cuotas mensuales forzosas de plataforma. Todos los clientes, historiales de compra y datos te pertenecen a ti desde el primer día.'
        : isPt
          ? 'O código é 100% de sua propriedade. Sem comissões sobre vendas nem cobranças ocultas de plataforma. Toda a base de clientes e históricos de compra pertencem exclusivamente à sua marca.'
          : 'The code is 100% client-owned. Zero sales commissions, zero vendor lock-in, and zero mandatory platform subscription fees. All buyer data and customer records belong exclusively to you.',
    },
  ];

  return (
    <section className="rounded-3xl bg-primary border-2 border-secondary/15 p-6 sm:p-10 md:p-12 shadow-xl">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-theme-1 text-secondary font-bold shadow-xs mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          {isEs
            ? 'SEGURIDAD, LOGÍSTICA & GARANTÍAS // JOYERÍA FINA'
            : isPt
              ? 'SEGURANÇA, LOGÍSTICA & GARANTIAS // JOALHERIA'
              : 'SECURITY, LOGISTICS & GUARANTEES // FINE JEWELRY'}
        </span>
        <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-secondary tracking-tight">
          {isEs
            ? 'Cómo Operan los Envíos Blindados y la Seguridad de Alto Valor'
            : isPt
              ? 'Como Funcionam os Envios Blindados e a Segurança de Alto Valor'
              : 'How Armored Shipping and High-Ticket Security Operate'}
        </h3>
        <p className="text-xs sm:text-sm text-secondary/75 mt-2 leading-relaxed">
          {isEs
            ? 'Resolver la logística y disipar el miedo al fraude es el 80% del éxito en el e-commerce de joyería. Así funciona la infraestructura que implementamos.'
            : isPt
              ? 'Resolver a logística e eliminar o receio de extravio é a chave para o sucesso no e-commerce de joias. Veja como funciona nossa infraestrutura.'
              : 'Solving secure logistics and eliminating fraud friction is key to fine jewelry e-commerce success.'}
        </p>
      </div>

      {/* 4 Pilares de Logística y Seguridad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10">
        {carriers.map((c, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-theme-5 border border-secondary/10 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-theme-1 shrink-0" />
              <h4 className="font-heading font-bold text-xs sm:text-[13px] text-secondary">
                {c.name}
              </h4>
            </div>
            <p className="text-[11px] text-secondary/70 leading-snug">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Acordeón de FAQs */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-secondary/15 bg-theme-5 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className="font-heading font-bold text-xs sm:text-sm text-secondary">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-secondary/60 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-theme-1' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-secondary/80 leading-relaxed border-t border-secondary/10 pt-3 font-normal animate-in fade-in duration-200">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
