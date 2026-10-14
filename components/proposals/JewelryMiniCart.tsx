'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  Lock,
  Gem,
  Award,
  CreditCard,
  Building2,
} from 'lucide-react';
import { track } from '@/lib/analytics';
import type { JewelryModel } from './JewelryHeroShowcase';

export interface JewelryMiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  model: JewelryModel;
  metal: string;
  size?: string;
  lang?: string;
}

type PaymentMethod = 'addi' | 'wompi' | 'bank' | 'armored';

export function JewelryMiniCart({
  isOpen,
  onClose,
  model,
  metal,
  size,
  lang = 'es',
}: JewelryMiniCartProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('addi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);

  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const unitPrice =
    parseInt(model.priceCop.replace(/[^0-9]/g, ''), 10) || 8950000;
  const subtotal = unitPrice * quantity;
  const addiInstallment = Math.round(subtotal / 3);

  const formatCop = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getMetalLabel = (m: string) => {
    if (m === 'yellow-gold') return isEs ? 'Oro Amarillo 18k' : isPt ? 'Ouro Amarelo 18k' : '18k Yellow Gold';
    if (m === 'rose-gold') return isEs ? 'Oro Rosa 18k' : isPt ? 'Ouro Rosé 18k' : '18k Rose Gold';
    if (m === 'platinum') return isEs ? 'Platino 950' : isPt ? 'Platina 950' : '950 Platinum';
    return isEs ? 'Oro Blanco 18k' : isPt ? 'Ouro Branco 18k' : '18k White Gold';
  };

  const getWhatsAppMessage = () => {
    const text = isEs
      ? `Hola Andrés, acabo de probar la demo del cofre interactivo de alta joyería (${model.name}). Me interesa cotizar una tienda online de joyería en Next.js con esta experiencia y pasarelas seguras.`
      : isPt
        ? `Olá Andrés, acabei de testar a demo do porta-joias de luxo (${model.name}). Gostaria de orçar uma loja virtual de joalheria em Next.js com essa experiência e checkout seguro.`
        : `Hi Andrés, I just tested your luxury jewelry interactive cart demo (${model.name}). I'd like to get a quote for a fine jewelry boutique on Next.js with this technology.`;
    return `https://wa.me/573161482507?text=${encodeURIComponent(text)}`;
  };

  const handleSimulateCheckout = () => {
    setIsProcessing(true);
    track('jewelry_added_to_cart', {
      action: 'simulate_checkout_start',
      piece_id: model.id,
      payment_method: paymentMethod,
      quantity,
      subtotal,
    });

    setTimeout(() => {
      setIsProcessing(false);
      setIsOrderPlaced(true);
      track('jewelry_added_to_cart', {
        action: 'simulate_checkout_success',
        piece_id: model.id,
        payment_method: paymentMethod,
      });
    }, 1200);
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
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-[#12100E] text-[#FAF7F2] h-full flex flex-col shadow-2xl z-10 overflow-hidden border-l border-amber-400/20"
          >
            {/* 1. Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-stone-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-xs shadow-inner">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold leading-tight text-amber-100 uppercase tracking-wider">
                    {isEs ? 'Tu Cofre Privado' : isPt ? 'Seu Porta-Joias' : 'Your Bespoke Bag'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {isEs
                        ? 'Reserva en Bóveda Central'
                        : isPt
                          ? 'Reserva no Cofre Central'
                          : 'Central Vault Reservation'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={isEs ? 'Cerrar cofre' : isPt ? 'Fechar' : 'Close bag'}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center transition-colors text-white/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Armored Courier Bar */}
            <div className="px-4 py-2.5 bg-amber-400/10 border-b border-amber-400/20 text-amber-200 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-amber-400" />
                {isEs
                  ? 'Transporte Blindado 100% Asegurado'
                  : isPt
                    ? 'Transporte Blindado 100% Segurado'
                    : '100% Insured Armored Transit'}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                {isEs ? 'Sin costo' : isPt ? 'Grátis' : 'Complimentary'}
              </span>
            </div>

            {/* 3. Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {!isOrderPlaced ? (
                <>
                  {/* Selected Piece Card */}
                  <div className="rounded-2xl p-4 bg-white/5 border border-white/10 flex gap-3.5 items-center relative">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-amber-400/20">
                      <Image
                        src={model.image}
                        alt={model.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-[#FAF7F2] truncate">
                        {model.name}
                      </h4>
                      <p className="text-[11px] text-amber-300/80 truncate mb-1">
                        {model.edition}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-900 text-[10px] font-mono text-amber-300 border border-amber-400/30">
                          {getMetalLabel(metal)}
                        </span>
                        {model.id === 'diamond-ring' && size && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-900 text-[10px] font-mono text-white/80 border border-white/10">
                            Talla US {size}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="font-mono font-black text-sm text-amber-300">
                          {formatCop(unitPrice)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-white/15 bg-black/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Disminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-amber-300">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(3, q + 1))}
                            disabled={quantity >= 3}
                            className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High Jewelry Packaging & Certification Preview */}
                  <div className="rounded-2xl p-3.5 bg-gradient-to-br from-amber-400/5 to-transparent border border-amber-400/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{isEs ? 'Incluido con tu Creación' : isPt ? 'Incluso com sua Peça' : 'Included with your Piece'}</span>
                    </div>
                    <ul className="text-[11px] font-mono text-[#E2DDD5]/80 space-y-1.5 pl-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{isEs ? 'Certificado GIA físico foliado & QR transferible' : isPt ? 'Certificado GIA original e QR transferível' : 'Official physical GIA cert & transferable QR'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{isEs ? 'Estuche de Nogal artesanal con terciopelo negro' : isPt ? 'Estojo de nogueira nobre com veludo' : 'Handcrafted walnut & black velvet vault case'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{isEs ? 'Póliza de seguro durante todo el trayecto blindado' : isPt ? 'Apólice de seguro total durante o trajeto' : 'Full transit insurance policy in armored vehicle'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Payment Methods Simulation */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#E2DDD5]/70 block mb-2 font-bold">
                      {isEs ? 'Forma de Pago de Alta Gama' : isPt ? 'Forma de Pagamento' : 'Luxury Payment Method'}
                    </label>

                    <div className="space-y-2">
                      {/* Addi */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('addi')}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          paymentMethod === 'addi'
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
                            A
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>Addi (3 cuotas sin interés)</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                0% Tasa
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-amber-300">
                              3 pagos mensuales de {formatCop(addiInstallment)}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'addi'
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/30'
                          }`}
                        >
                          {paymentMethod === 'addi' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                          )}
                        </div>
                      </button>

                      {/* Wompi / Credit Cards */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wompi')}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          paymentMethod === 'wompi'
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Tarjetas VIP & Wompi (Bancolombia)
                            </div>
                            <div className="text-[11px] font-mono text-[#E2DDD5]/70">
                              Visa, MasterCard, Amex Black & Apple Pay
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'wompi'
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/30'
                          }`}
                        >
                          {paymentMethod === 'wompi' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                          )}
                        </div>
                      </button>

                      {/* Bank Wire */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          paymentMethod === 'bank'
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/20 text-amber-300 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Transferencia Directa Bóveda
                            </div>
                            <div className="text-[11px] font-mono text-[#E2DDD5]/70">
                              Bancolombia, Davivienda o ACH corporativo
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'bank'
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/30'
                          }`}
                        >
                          {paymentMethod === 'bank' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Order Confirmation Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block mb-1">
                      {isEs ? 'Simulación de Reserva Exitosa' : isPt ? 'Simulação de Reserva Concluída' : 'Reservation Simulation Completed'}
                    </span>
                    <h3 className="font-heading text-2xl font-bold text-white">
                      {isEs ? '¡Pieza Bloqueada en Bóveda!' : isPt ? 'Peça Reservada no Cofre!' : 'Piece Secured in Central Vault!'}
                    </h3>
                    <p className="text-xs font-mono text-emerald-400 mt-1">
                      ID: #RES-GIA-{Math.floor(100000 + Math.random() * 900000)}
                    </p>
                  </div>

                  <p className="text-xs text-[#E2DDD5]/80 max-w-xs mx-auto leading-relaxed">
                    {isEs
                      ? 'Así experimentarán tus clientes el checkout: validación instantánea con Addi, emisión automática del certificado de bóveda y notificación de despacho blindado.'
                      : isPt
                        ? 'Assim seus clientes vivenciarão o checkout: parcelamento Addi, emissão de certificado e despacho blindado.'
                        : 'This is the exact high-trust checkout your clients will experience: instant financing, official vault certificate emission, and armored dispatch notifications.'}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/20 text-left font-mono text-xs space-y-2">
                    <div className="flex justify-between text-[#E2DDD5]/70">
                      <span>Pieza:</span>
                      <span className="text-white font-bold">{model.name}</span>
                    </div>
                    <div className="flex justify-between text-[#E2DDD5]/70">
                      <span>Metal:</span>
                      <span className="text-amber-300">{getMetalLabel(metal)}</span>
                    </div>
                    <div className="flex justify-between text-[#E2DDD5]/70">
                      <span>Total simulado:</span>
                      <span className="text-white font-bold">{formatCop(subtotal)}</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <a
                      href={getWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-secondary font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isEs ? 'Cotizar esta Tienda con Andrés' : isPt ? 'Cotar esta Loja com Andrés' : 'Quote this Store with Andrés'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="w-full py-2.5 text-xs font-mono text-[#E2DDD5]/60 hover:text-white transition-colors"
                    >
                      {isEs ? '← Probar otra simulación' : isPt ? '← Testar outra simulação' : '← Try another simulation'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 4. Footer Summary & Action */}
            {!isOrderPlaced && (
              <div className="p-4 sm:p-5 border-t border-white/10 bg-stone-900/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#E2DDD5]/70">{isEs ? 'Inversión en Pieza' : isPt ? 'Subtotal' : 'Subtotal'}</span>
                  <span className="font-bold text-white text-base">{formatCop(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#E2DDD5]/70">{isEs ? 'Transporte Blindado' : isPt ? 'Frete Blindado' : 'Armored Courier'}</span>
                  <span className="text-emerald-400 font-bold uppercase">{isEs ? 'Gratis / Asegurado' : isPt ? 'Grátis' : 'Complimentary'}</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-sm uppercase text-[#E2DDD5]/90 font-bold">Total</span>
                  <span className="font-mono text-xl font-black text-amber-300">{formatCop(subtotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-secondary font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>{isEs ? 'Verificando con Bóveda...' : isPt ? 'Verificando com o Cofre...' : 'Securing in Vault...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{isEs ? 'Simular Reserva de Lujo' : isPt ? 'Simular Reserva de Luxo' : 'Simulate Vault Checkout'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
