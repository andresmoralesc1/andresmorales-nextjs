'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  CreditCard,
  Lock,
} from 'lucide-react';
import { track } from '@/lib/analytics';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import type { SneakerModel } from './SneakerHeroShowcase';

export interface SneakerMiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  model: SneakerModel;
  size: string;
  lang?: string;
}

type PaymentMethod = 'addi' | 'nequi' | 'wompi' | 'cod';

const US_TO_COL_SIZES: Record<string, string> = {
  '7.5': '39',
  '8.0': '40',
  '8.5': '40.5',
  '9.0': '41',
  '9.5': '41.5',
  '10.0': '42',
  '10.5': '43',
  '11.0': '44',
};

export function SneakerMiniCart({
  isOpen,
  onClose,
  model,
  size,
  lang = 'es',
}: SneakerMiniCartProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('addi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const unitPrice =
    parseInt(model.priceCop.replace(/[^0-9]/g, ''), 10) || 689900;
  const subtotal = unitPrice * quantity;
  const addiInstallment = Math.round(subtotal / 3);

  const formatCop = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const colSize = US_TO_COL_SIZES[size] || size;
  const briefLink = getLocalizedPath(
    '/brief-web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const getWhatsAppMessage = () => {
    const text = isEs
      ? `Hola Andrés, acabo de probar el mini-cart interactivo con checkout de Addi/Nequi en la propuesta de la tienda de tenis. Me encantó la experiencia. Quiero cotizar la tienda en Next.js por $500.000 COP.`
      : isPt
        ? `Olá Andrés, acabei de testar o mini-cart interativo na proposta da loja de tênis. Gostei muito da experiência. Quero cotar a loja Next.js por $500.000 COP.`
        : `Hi Andrés, I just tried the interactive mini-cart checkout demo on the sneaker store proposal. I loved the flow. I want to build a Next.js store for $500,000 COP (~$125 USD).`;
    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  const handleSimulateCheckout = () => {
    setIsProcessing(true);
    track('proposal_hero_interacted', {
      action: 'simulate_checkout_start',
      model_id: model.id,
      payment_method: paymentMethod,
      quantity,
      subtotal,
    });

    setTimeout(() => {
      setIsProcessing(false);
      setIsOrderPlaced(true);
      track('proposal_hero_interacted', {
        action: 'simulate_checkout_success',
        model_id: model.id,
        payment_method: paymentMethod,
      });
    }, 1100);
  };

  const handleResetSimulation = () => {
    setIsOrderPlaced(false);
    setQuantity(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-primary text-secondary h-full flex flex-col shadow-2xl z-10 overflow-hidden border-l border-secondary/15"
          >
            {/* 1. Header */}
            <div className="p-4 sm:p-5 border-b border-secondary/10 flex items-center justify-between bg-theme-4/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold text-xs">
                  <ShoppingBag className="w-4 h-4 text-theme-1" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold leading-tight">
                    {isEs ? 'Bolsa de Compra' : isPt ? 'Sacola de Compras' : 'Shopping Bag'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      {isEs
                        ? 'Demo en Vivo de Checkout'
                        : isPt
                          ? 'Demo ao Vivo de Checkout'
                          : 'Live Checkout Demo'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={isEs ? 'Cerrar carrito' : isPt ? 'Fechar carrinho' : 'Close cart'}
                className="w-9 h-9 rounded-full bg-theme-5 hover:bg-theme-9 border border-secondary/15 flex items-center justify-center transition-colors text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Free Shipping Bar */}
            <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-950 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                {isEs
                  ? '¡Envío Nacional Gratis Asegurado! 🇨🇴'
                  : isPt
                    ? 'Frete Grátis com Seguro! 🇨🇴'
                    : 'Free Insured Nationwide Shipping! 🇨🇴'}
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {isEs ? '100% Cubierto' : isPt ? '100% Coberto' : '100% Covered'}
              </span>
            </div>

            {/* 3. Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {!isOrderPlaced ? (
                <>
                  {/* Selected Item Card */}
                  <div className="rounded-2xl p-3.5 bg-theme-5 border border-secondary/15 flex gap-3.5 items-center relative">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-secondary/10">
                      <Image
                        src={model.image}
                        alt={model.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading font-bold text-sm text-secondary truncate">
                          {model.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-secondary/70 truncate mb-1">
                        {model.edition}
                      </p>

                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary text-[10px] font-mono font-bold text-secondary border border-secondary/15 mb-2">
                        <span>{isEs ? 'Talla US' : isPt ? 'Tamanho US' : 'Size US'} {size}</span>
                        <span className="text-secondary/40">•</span>
                        <span>Col {colSize}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="font-mono font-black text-sm text-secondary">
                          {formatCop(unitPrice)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-secondary/20 bg-primary p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center text-secondary/70 hover:text-secondary disabled:opacity-30 transition-colors"
                            aria-label={isEs ? 'Disminuir cantidad' : isPt ? 'Diminuir quantidade' : 'Decrease quantity'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-secondary">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                            disabled={quantity >= 5}
                            className="w-6 h-6 flex items-center justify-center text-secondary/70 hover:text-secondary disabled:opacity-30 transition-colors"
                            aria-label={isEs ? 'Aumentar cantidad' : isPt ? 'Aumentar quantidade' : 'Increase quantity'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Simulation */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary/80 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-theme-1" />
                        {isEs
                          ? 'Método de Pago Preferido:'
                          : isPt
                            ? 'Método de Pagamento Preferido:'
                            : 'Preferred Payment Method:'}
                      </label>
                      <span className="text-[10px] font-mono text-theme-1 font-bold">
                        {isEs ? 'Checkout Colombiano' : isPt ? 'Checkout LATAM' : 'LATAM Checkouts'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* ADDI */}
                      <div
                        onClick={() => setPaymentMethod('addi')}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'addi'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-secondary/15 bg-primary hover:border-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black font-mono">
                            Addi
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-secondary">
                                {isEs
                                  ? 'Addi (3 Cuotas sin Interés)'
                                  : isPt
                                    ? 'Addi (3 Parcelas sem Juros)'
                                    : 'Addi (3 Interest-Free Installments)'}
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                {isEs ? 'Más Usado' : isPt ? 'Mais Usado' : 'Popular'}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-blue-900 font-semibold mt-0.5">
                              {isEs
                                ? `3 cuotas de ${formatCop(addiInstallment)} sin papeleos`
                                : isPt
                                  ? `3 parcelas de ${formatCop(addiInstallment)} sem burocracia`
                                  : `3 installments of ${formatCop(addiInstallment)} with zero paperwork`}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'addi'}
                          onChange={() => setPaymentMethod('addi')}
                          className="accent-blue-600 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {/* NEQUI */}
                      <div
                        onClick={() => setPaymentMethod('nequi')}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'nequi'
                            ? 'border-fuchsia-700 bg-fuchsia-50/60 ring-2 ring-fuchsia-500/20 shadow-xs'
                            : 'border-secondary/15 bg-primary hover:border-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-fuchsia-800 text-white flex items-center justify-center text-xs font-black font-mono">
                            N
                          </div>
                          <div>
                            <span className="text-xs font-bold text-secondary block">
                              {isEs
                                ? 'Nequi Push Directo'
                                : isPt
                                  ? 'Nequi / Carteira Digital'
                                  : 'Nequi Direct Mobile Push'}
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              {isEs
                                ? 'Notificación directa a la app del cliente (0 errores)'
                                : isPt
                                  ? 'Notificação instantânea no celular do cliente'
                                  : 'Direct push notification to shopper app (0 errors)'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'nequi'}
                          onChange={() => setPaymentMethod('nequi')}
                          className="accent-fuchsia-700 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {/* WOMPI / BANCOLOMBIA */}
                      <div
                        onClick={() => setPaymentMethod('wompi')}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'wompi'
                            ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-secondary/15 bg-primary hover:border-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-secondary flex items-center justify-center text-xs font-black font-mono">
                            W
                          </div>
                          <div>
                            <span className="text-xs font-bold text-secondary block">
                              {isEs
                                ? 'Wompi (Bancolombia, QR y PSE)'
                                : isPt
                                  ? 'Wompi (Cartões e Contas)'
                                  : 'Wompi (Credit Cards, QR & Bank Transfers)'}
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              {isEs
                                ? 'Tarjetas y transferencias bancarias en caliente'
                                : isPt
                                  ? 'Cartões de crédito e débito bancário instantâneo'
                                  : 'Credit cards & instant digital account transfers'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'wompi'}
                          onChange={() => setPaymentMethod('wompi')}
                          className="accent-amber-600 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {/* CONTRA ENTREGA */}
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-secondary/15 bg-primary hover:border-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-secondary block">
                              {isEs
                                ? 'Pago Contra Entrega'
                                : isPt
                                  ? 'Pagamento na Entrega'
                                  : 'Cash on Delivery (COD)'}
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              {isEs
                                ? 'El cliente paga en efectivo al recibir en su puerta'
                                : isPt
                                  ? 'O cliente paga em dinheiro ao receber o pedido'
                                  : 'Shopper pays cash upon home delivery arrival'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="rounded-xl bg-theme-5 p-3.5 border border-secondary/10 space-y-2 text-xs">
                    <div className="flex justify-between text-secondary/70">
                      <span>
                        {isEs
                          ? `Subtotal (${quantity} ${quantity === 1 ? 'par' : 'pares'}):`
                          : isPt
                            ? `Subtotal (${quantity} ${quantity === 1 ? 'par' : 'pares'}):`
                            : `Subtotal (${quantity} ${quantity === 1 ? 'pair' : 'pairs'}):`}
                      </span>
                      <span className="font-mono font-bold text-secondary">{formatCop(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>
                        {isEs ? 'Envío nacional:' : isPt ? 'Envio nacional:' : 'Nationwide shipping:'}
                      </span>
                      <span className="font-mono font-bold">
                        {isEs ? 'GRATIS ($0 COP)' : isPt ? 'GRÁTIS ($0)' : 'FREE ($0)'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-secondary/15 flex justify-between text-sm font-bold text-secondary">
                      <span>
                        {isEs ? 'Total a pagar:' : isPt ? 'Total a pagar:' : 'Total due:'}
                      </span>
                      <span className="font-mono text-base font-black text-theme-1">
                        {formatCop(subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Streetwear shop owner educational insight */}
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-secondary/90 flex gap-2.5 items-start">
                    <Sparkles className="w-4 h-4 text-theme-1 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>
                        {isEs
                          ? 'Para dueños de tiendas:'
                          : isPt
                            ? 'Para lojistas:'
                            : 'For store owners:'}
                      </strong>{' '}
                      {isEs
                        ? 'Addi permite que prospectos que no tienen $600.000 COP hoy compren en 3 cuotas. Tú recibes el 100% de tu dinero de contado y Addi asume el riesgo de cobro.'
                        : isPt
                          ? 'O parcelamento permite que clientes que não têm o valor à vista comprem sem atrito. Você recebe 100% à vista e o gateway assume o risco.'
                          : 'Installment gateways allow shoppers without upfront cash to convert in 3 installments. You receive 100% upfront and the platform takes the collection risk.'}
                    </p>
                  </div>
                </>
              ) : (
                /* Order Confirmation View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-2"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border-2 border-emerald-300">
                    <Check className="w-8 h-8 animate-bounce" />
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      ● {isEs ? 'Compra Simulada Exitosa' : isPt ? 'Compra Simulada com Sucesso' : 'Test Checkout Completed'}
                    </span>
                    <h4 className="font-heading text-xl font-bold text-secondary mt-2">
                      {isEs ? '¡Orden #KL-9482 Aprobada!' : isPt ? 'Pedido #KL-9482 Aprovado!' : 'Order #KL-9482 Approved!'}
                    </h4>
                    <p className="text-xs text-secondary/70 mt-1 max-w-xs mx-auto">
                      {isEs
                        ? 'Así de rápido y sin intermediarios tus clientes compran desde su celular en menos de 40 segundos.'
                        : isPt
                          ? 'É assim que seus clientes compram pelo celular em menos de 40 segundos sem fricção.'
                          : 'This is how smoothly your shoppers convert from their smartphone in under 40 seconds.'}
                    </p>
                  </div>

                  {/* Order Details Receipt Box */}
                  <div className="rounded-2xl bg-theme-5 border-2 border-dashed border-secondary/20 p-4 text-left text-xs font-mono space-y-2">
                    <div className="flex justify-between pb-2 border-b border-secondary/10">
                      <span className="text-secondary/60">
                        {isEs ? 'Producto:' : isPt ? 'Produto:' : 'Product:'}
                      </span>
                      <span className="font-bold text-secondary">{model.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">
                        {isEs ? 'Talla & Cantidad:' : isPt ? 'Tamanho & Quantidade:' : 'Size & Quantity:'}
                      </span>
                      <span className="font-bold text-secondary">
                        US {size} ({quantity} {quantity === 1 ? (isEs ? 'par' : isPt ? 'par' : 'pair') : (isEs ? 'pares' : isPt ? 'pares' : 'pairs')})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">
                        {isEs ? 'Pasarela:' : isPt ? 'Gateway:' : 'Gateway:'}
                      </span>
                      <span className="font-bold text-theme-1 uppercase">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">
                        {isEs ? 'Guía Automática:' : isPt ? 'Rastreio Automático:' : 'Carrier Tracking:'}
                      </span>
                      <span className="font-bold text-emerald-700">Coordinadora #98421087</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-secondary/10 text-sm">
                      <span className="font-bold">
                        {isEs ? 'Total Facturado:' : isPt ? 'Total Faturado:' : 'Total Cleared:'}
                      </span>
                      <span className="font-black text-secondary">{formatCop(subtotal)}</span>
                    </div>
                  </div>

                  {/* Contrast Callout */}
                  <div className="p-4 rounded-2xl bg-secondary text-primary text-left space-y-2 shadow-lg">
                    <div className="flex items-center gap-2 text-theme-1 text-xs font-bold uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      <span>{isEs ? 'Cero Fricción en Ventas' : isPt ? 'Zero Fricção nas Vendas' : 'Zero Sales Friction'}</span>
                    </div>
                    <p className="text-xs text-primary/85 leading-relaxed">
                      {isEs ? (
                        <>
                          El stock de la talla <strong>US {size}</strong> se redujo automáticamente en la base de datos, el cliente recibió su confirmación y la transportadora generó la etiqueta. <strong>Sin que nadie tuviera que responder un chat manual.</strong>
                        </>
                      ) : isPt ? (
                        <>
                          O estoque do tamanho <strong>US {size}</strong> foi reduzido automaticamente, o cliente recebeu confirmação e a transportadora gerou a etiqueta. <strong>Sem ninguém precisar responder no chat manual.</strong>
                        </>
                      ) : (
                        <>
                          Inventory for size <strong>US {size}</strong> was automatically decremented in the database, the shopper received confirmation, and the carrier generated the tracking label. <strong>Without anyone having to answer a manual chat.</strong>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <a
                      href={getWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        track('proposal_whatsapp_clicked', {
                          source: 'mini_cart_order_success',
                          model_id: model.id,
                        });
                      }}
                      className="btn-theme w-full py-3.5 rounded-full text-xs font-secondary font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <span>
                        {isEs
                          ? '💬 Quiero esta tienda para mi marca'
                          : isPt
                            ? '💬 Quero essa loja para minha marca'
                            : '💬 I Want This Store for My Brand'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <Link
                      href={briefLink}
                      onClick={() => {
                        track('proposal_brief_clicked', {
                          source: 'mini_cart_order_success',
                        });
                      }}
                      className="w-full py-2.5 rounded-full text-xs font-secondary font-bold text-secondary/80 hover:text-secondary hover:bg-theme-1/10 transition-colors text-center flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {isEs
                          ? '📋 Configurar en Brief Web (3 min)'
                          : isPt
                            ? '📋 Configurar no Brief Web (3 min)'
                            : '📋 Configure in Web Brief (3 min)'}
                      </span>
                      <span aria-hidden="true">→</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="text-[11px] font-mono text-secondary/60 hover:text-secondary underline flex items-center justify-center gap-1 mx-auto mt-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>
                        {isEs
                          ? 'Volver a probar el simulador'
                          : isPt
                            ? 'Testar o simulador novamente'
                            : 'Try simulation again'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 4. Footer CTA (Only when order not placed) */}
            {!isOrderPlaced && (
              <div className="p-4 sm:p-5 border-t border-secondary/15 bg-theme-4/40 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSimulateCheckout}
                  disabled={isProcessing}
                  className="btn-theme w-full py-4 rounded-full text-xs font-secondary font-bold uppercase tracking-wider shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-75 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <span>
                        {isEs
                          ? 'Procesando pasarela en vivo...'
                          : isPt
                            ? 'Processando gateway ao vivo...'
                            : 'Processing live gateway...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {isEs
                          ? '🚀 Probar Compra en 1-Clic'
                          : isPt
                            ? '🚀 Simular Compra em 1-Clique'
                            : '🚀 Simulate 1-Click Purchase'}
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({formatCop(subtotal)})
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] font-mono text-center text-secondary/60 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isEs
                      ? 'Simulación de pasarela SSL 256-bit sin cobro real'
                      : isPt
                        ? 'Simulação de gateway SSL 256-bit sem cobrança real'
                        : '256-bit SSL gateway demo simulation with zero real charges'}
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
