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
  Smartphone,
  Lock,
  ExternalLink,
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

  // Parse numeric price from COP string (e.g. '$689.900 COP' -> 689900)
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
    '/brief?type=web',
    (['en', 'es', 'pt'].includes(lang) ? lang : 'es') as Locale
  );

  const getWhatsAppMessage = () => {
    const text = `Hola Andrés, acabo de probar el mini-cart interactivo con checkout de Addi/Nequi en la propuesta de la tienda de tenis. Me encantó la experiencia. Quiero cotizar la tienda en Next.js por $500.000 COP.`;
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
                    Bolsa de Compra
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Demo en Vivo de Checkout</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="w-9 h-9 rounded-full bg-theme-5 hover:bg-theme-9 border border-secondary/15 flex items-center justify-center transition-colors text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Free Shipping Bar */}
            <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-950 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                ¡Envío Nacional Gratis Asegurado! 🇨🇴
              </span>
              <span className="text-[11px] font-bold text-emerald-800">100% Cubierto</span>
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
                        <span>Talla US {size}</span>
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
                            aria-label="Disminuir cantidad"
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
                            aria-label="Aumentar cantidad"
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
                        Método de Pago Preferido:
                      </label>
                      <span className="text-[10px] font-mono text-theme-1 font-bold">
                        Checkout Colombiano
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
                                Addi (3 Cuotas sin Interés)
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                Más Usado
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-blue-900 font-semibold mt-0.5">
                              3 cuotas de {formatCop(addiInstallment)} sin papeleos
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
                              Nequi Push Directo
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              Notificación directa a la app del cliente (0 errores)
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
                              Wompi (Bancolombia, QR y PSE)
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              Tarjetas y transferencias bancarias en caliente
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
                              Pago Contra Entrega
                            </span>
                            <p className="text-[11px] text-secondary/70">
                              El cliente paga en efectivo al recibir en su puerta
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
                      <span>Subtotal ({quantity} {quantity === 1 ? 'par' : 'pares'}):</span>
                      <span className="font-mono font-bold text-secondary">{formatCop(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Envío nacional:</span>
                      <span className="font-mono font-bold">GRATIS ($0 COP)</span>
                    </div>
                    <div className="pt-2 border-t border-secondary/15 flex justify-between text-sm font-bold text-secondary">
                      <span>Total a pagar:</span>
                      <span className="font-mono text-base font-black text-theme-1">
                        {formatCop(subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Streetwear shop owner educational insight */}
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-secondary/90 flex gap-2.5 items-start">
                    <Sparkles className="w-4 h-4 text-theme-1 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>Para dueños de tiendas:</strong> Addi permite que prospectos que no tienen $600.000 COP hoy compren en 3 cuotas. Tú recibes el 100% de tu dinero de contado y Addi asume el riesgo de cobro.
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
                      ● Compra Simulada Exitosa
                    </span>
                    <h4 className="font-heading text-xl font-bold text-secondary mt-2">
                      ¡Orden #KL-9482 Aprobada!
                    </h4>
                    <p className="text-xs text-secondary/70 mt-1 max-w-xs mx-auto">
                      Así de rápido y sin intermediarios tus clientes compran desde su celular en menos de 40 segundos.
                    </p>
                  </div>

                  {/* Order Details Receipt Box */}
                  <div className="rounded-2xl bg-theme-5 border-2 border-dashed border-secondary/20 p-4 text-left text-xs font-mono space-y-2">
                    <div className="flex justify-between pb-2 border-b border-secondary/10">
                      <span className="text-secondary/60">Producto:</span>
                      <span className="font-bold text-secondary">{model.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">Talla & Cantidad:</span>
                      <span className="font-bold text-secondary">US {size} ({quantity} par)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">Pasarela:</span>
                      <span className="font-bold text-theme-1 uppercase">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60">Guía Automática:</span>
                      <span className="font-bold text-emerald-700">Coordinadora #98421087</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-secondary/10 text-sm">
                      <span className="font-bold">Total Facturado:</span>
                      <span className="font-black text-secondary">{formatCop(subtotal)}</span>
                    </div>
                  </div>

                  {/* Contrast Callout */}
                  <div className="p-4 rounded-2xl bg-secondary text-primary text-left space-y-2 shadow-lg">
                    <div className="flex items-center gap-2 text-theme-1 text-xs font-bold uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      <span>Cero Fricción en Ventas</span>
                    </div>
                    <p className="text-xs text-primary/85 leading-relaxed">
                      El stock de la talla <strong>US {size}</strong> se redujo automáticamente en la base de datos, el cliente recibió su confirmación por WhatsApp y la transportadora generó la etiqueta. <strong>Sin que nadie tuviera que responder un chat manual.</strong>
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
                      <span>💬 Quiero esta tienda para mi marca</span>
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
                      <span>📋 Configurar en Brief Web (3 min)</span>
                      <span aria-hidden="true">→</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="text-[11px] font-mono text-secondary/60 hover:text-secondary underline flex items-center justify-center gap-1 mx-auto mt-2"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Volver a probar el simulador</span>
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
                  className="btn-theme w-full py-4 rounded-full text-xs font-secondary font-bold uppercase tracking-wider shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-75"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <span>Procesando pasarela en vivo...</span>
                    </div>
                  ) : (
                    <>
                      <span>🚀 Probar Compra en 1-Clic</span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({formatCop(subtotal)})
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] font-mono text-center text-secondary/60 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Simulación de pasarela SSL 256-bit sin cobro real</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
