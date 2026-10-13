'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Flame,
  Activity,
  Sparkles,
  Sliders,
  ShoppingBag,
  Heart,
  Search,
  Check,
  ChevronRight,
  X,
  Truck,
  RotateCw,
  Lock,
  ArrowRight,
  Scan,
  Compass,
  Crosshair,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { track } from '@/lib/analytics';
import { SneakerMiniCart } from './SneakerMiniCart';

export type SneakerModel = {
  id: string;
  name: string;
  edition: string;
  desc: string;
  priceCop: string;
  priceUsd: string;
  rating: string;
  reviews: number;
  badge: string;
  colorName: string;
  accentColor?: string;
  image: string;
  thumb: string;
};

interface FeatureMetric {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  detail: string;
  zone: 'cushion' | 'traction' | 'upper' | 'hype';
}

interface SneakerVisualConfig {
  gradient: string;
  glow: string;
  ring: string;
  accentHex: string;
  telemetry: FeatureMetric[];
}

const MODEL_CONFIGS: Record<string, SneakerVisualConfig> = {
  aj1: {
    gradient: 'from-orange-500/25 via-amber-500/10 to-transparent',
    glow: 'bg-[#f96e03]',
    ring: 'border-orange-500/40',
    accentHex: '#f96e03',
    telemetry: [
      { id: 'm1', label: 'Amortiguación Air-Sole Encapsulada', value: 94, icon: Zap, detail: 'Cámara presurizada a 25 PSI', zone: 'cushion' },
      { id: 'm2', label: 'Tracción Suela Pivot Baloncesto', value: 98, icon: ShieldCheck, detail: 'Caucho vulcanizado de alta fricción', zone: 'traction' },
      { id: 'm3', label: 'Cuero Flor Curtido & Resistencia', value: 96, icon: Sparkles, detail: 'Paneles de piel de primera flor OG', zone: 'upper' },
      { id: 'm4', label: 'Hype Index & Demanda Coleccionista', value: 99, icon: Flame, detail: 'Edición de culto internacional', zone: 'hype' },
    ],
  },
  aj12: {
    gradient: 'from-red-600/25 via-rose-600/10 to-transparent',
    glow: 'bg-red-600',
    ring: 'border-red-500/40',
    accentHex: '#dc2626',
    telemetry: [
      { id: 'm1', label: 'Zoom Air Longitud Completa', value: 97, icon: Zap, detail: 'Retorno elástico instantáneo', zone: 'cushion' },
      { id: 'm2', label: 'Placa de Torsión Fibra de Carbono', value: 99, icon: Activity, detail: 'Rigidez y estabilidad estructural', zone: 'traction' },
      { id: 'm3', label: 'Tracción Espina de Pescado Radial', value: 95, icon: ShieldCheck, detail: 'Suela con surcos de agarre dinámico', zone: 'traction' },
      { id: 'm4', label: 'Hype Index & Prestigio Histórico', value: 96, icon: Flame, detail: 'Diseño legendario Tinker Hatfield', zone: 'hype' },
    ],
  },
  am90: {
    gradient: 'from-zinc-700/25 via-zinc-800/10 to-transparent',
    glow: 'bg-zinc-800',
    ring: 'border-zinc-600/40',
    accentHex: '#1E1810',
    telemetry: [
      { id: 'm1', label: 'Unidad Max Air Visible en Talón', value: 93, icon: Zap, detail: 'Ventana de aire presurizada expuesta', zone: 'cushion' },
      { id: 'm2', label: 'Suela Waffle con Surcos Flexibles', value: 94, icon: ShieldCheck, detail: 'Herencia de running para asfalto', zone: 'traction' },
      { id: 'm3', label: 'Capas TPU Reforzadas Antidesgaste', value: 98, icon: Sparkles, detail: 'Estructura plástica de alta resistencia', zone: 'upper' },
      { id: 'm4', label: 'Hype Index & Versatilidad Street', value: 95, icon: Flame, detail: 'Ícono clásico urbano 24/7', zone: 'hype' },
    ],
  },
};

const SIZE_STOCK_DATA: Record<string, { stock: string; urgent: boolean }> = {
  '7.5': { stock: '3 pares disponibles', urgent: false },
  '8.0': { stock: '4 pares en bodega', urgent: false },
  '8.5': { stock: '¡Último par disponible!', urgent: true },
  '9.0': { stock: '2 pares restantes', urgent: false },
  '9.5': { stock: 'Talla más popular (3 pares)', urgent: false },
  '10.0': { stock: '¡Último par disponible!', urgent: true },
  '10.5': { stock: '3 pares disponibles', urgent: false },
  '11.0': { stock: '2 pares restantes', urgent: false },
};

const SNEAKER_ANIMATIONS: { image: Variants } = {
  image: {
    initial: {
      opacity: 0,
      scale: 0.85,
      filter: 'blur(10px)',
      rotate: -24,
      x: 60,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: -14,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 220, damping: 22 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      filter: 'blur(12px)',
      rotate: 16,
      x: -60,
      transition: { duration: 0.22 },
    },
  },
};

function AnimatedCounter({ value, duration = 900 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(ease * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}%</span>;
}

interface SneakerHeroShowcaseProps {
  t: {
    badge: string;
    title: string;
    description: string;
    toggleClient: string;
    toggleTech: string;
    navMen: string;
    navWomen: string;
    navDrops: string;
    navSale: string;
    brandBadge: string;
    sizeLabel: string;
    sizeGuide: string;
    addToCart: string;
    addedToCart: string;
    cartBadge: string;
    stockStatus: string;
    shippingNote: string;
    altTitle: string;
    quickSwitch: string;
    models: SneakerModel[];
  };
  lang?: string;
}

export function SneakerHeroShowcase({ t, lang = 'es' }: SneakerHeroShowcaseProps) {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('9.5');
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount, setWishlistCount] = useState(4);
  const [isWishlistActive, setIsWishlistActive] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  
  // Interactive micro-interactions states
  const [isScanning, setIsScanning] = useState(false);
  const [isSpinning360, setIsSpinning360] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [cartBounce, setCartBounce] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  // 3D Mouse Parallax Tilt
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringSneaker, setIsHoveringSneaker] = useState(false);
  const sneakerVisualRef = useRef<HTMLDivElement>(null);

  const activeModel = t.models[selectedModelIndex] || t.models[0];
  const config = MODEL_CONFIGS[activeModel.id] || MODEL_CONFIGS.aj1;
  const sizes = ['7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0'];
  const activeStock = SIZE_STOCK_DATA[selectedSize] || { stock: 'En stock', urgent: false };

  const handleSelectModel = (index: number) => {
    setSelectedModelIndex(index);
    triggerLaserScan();
    track('proposal_hero_interacted', {
      action: 'switch_model',
      model_id: t.models[index]?.id,
      model_name: t.models[index]?.name,
    });
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    track('proposal_hero_interacted', {
      action: 'select_size',
      size,
      model_id: activeModel.id,
    });
  };

  const handleToggleWishlist = () => {
    setIsWishlistActive((prev) => !prev);
    setWishlistCount((prev) => (isWishlistActive ? prev - 1 : prev + 1));
  };

  const triggerLaserScan = () => {
    setIsScanning(true);
    setScanKey((prev) => prev + 1);
    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  const triggerSpin360 = () => {
    if (isSpinning360) return;
    setIsSpinning360(true);
    setTimeout(() => {
      setIsSpinning360(false);
    }, 1200);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sneakerVisualRef.current) return;
    const rect = sneakerVisualRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePosition({ x, y });
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    setCartCount((prev) => prev + 1);
    setCartBounce(true);
    setIsMiniCartOpen(true);
    setToastMessage(`✓ ${activeModel.name} (Talla US ${selectedSize}) añadido a tu carrito`);
    track('proposal_hero_interacted', {
      action: 'add_to_cart',
      model_id: activeModel.id,
      size: selectedSize,
      price: activeModel.priceCop,
    });

    setTimeout(() => {
      setCartBounce(false);
    }, 800);

    setTimeout(() => {
      setIsAdded(false);
    }, 2200);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <header className="w-full relative overflow-hidden bg-background text-secondary border-b border-secondary/15 select-none">
      {/* 1. TOP ANNOUNCEMENT TICKER (High-impact Streetwear Store Bar) */}
      <div className="w-full bg-secondary text-primary py-2 px-4 text-xs font-mono border-b border-secondary/20">
        <div className="w-full max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-theme-1 animate-pulse shrink-0" />
            <span className="font-bold tracking-wider text-theme-1 uppercase text-[11px] sm:text-xs">
              DROP EN VIVO
            </span>
            <span className="text-primary/40 hidden sm:inline">•</span>
            <span className="text-primary/80 hidden sm:inline text-xs">
              Envíos gratis a toda Colombia por compras superiores a $200.000 COP
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Pago contra entrega & Addi
            </span>
            <span className="text-primary/30 hidden md:inline">|</span>
            <span className="text-primary/70 hidden md:inline">
              Autenticidad 100% garantizada
            </span>
          </div>
        </div>
      </div>

      {/* 2. FULL-WIDTH E-COMMERCE NAVBAR */}
      <nav className="w-full border-b border-secondary/10 bg-primary/85 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary font-black text-sm tracking-tighter shadow-md">
              KL
            </div>
            <div>
              <span className="font-heading font-black tracking-tight text-secondary text-2xl leading-none block">
                KICKS LAB
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-secondary/60 hidden sm:block font-bold">
                BOGOTÁ // SNEAKER ARCHIVE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-secondary font-bold tracking-wider uppercase text-secondary/80">
            <span className="text-secondary hover:text-theme-1 cursor-pointer transition-colors flex items-center gap-1.5 font-black underline decoration-theme-1 decoration-2 underline-offset-4">
              <Flame className="w-3.5 h-3.5 text-theme-1 fill-theme-1" />
              {t.navDrops}
            </span>
            <span className="hover:text-secondary cursor-pointer transition-colors">
              {t.navMen}
            </span>
            <span className="hover:text-secondary cursor-pointer transition-colors">
              {t.navWomen}
            </span>
            <span className="hover:text-secondary cursor-pointer transition-colors">
              Retro OG Archive
            </span>
            <span className="text-red-600 hover:text-red-700 cursor-pointer transition-colors font-black flex items-center gap-1">
              {t.navSale}
            </span>
          </div>

          {/* Action Icons: Search, Wishlist, Shopping Bag */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              aria-label="Buscar silueta"
              className="w-10 h-10 rounded-full bg-theme-5 hover:bg-theme-9 flex items-center justify-center text-secondary border border-secondary/15 transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Button with Heart Burst Micro-interaction */}
            <motion.button
              type="button"
              onClick={handleToggleWishlist}
              whileTap={{ scale: 0.85 }}
              aria-label="Favoritos"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-2xs hover:scale-105 active:scale-95 relative ${
                isWishlistActive
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-theme-5 hover:bg-theme-9 text-secondary border-secondary/15'
              }`}
            >
              <motion.div
                animate={isWishlistActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isWishlistActive ? 'fill-rose-600' : ''
                  }`}
                />
              </motion.div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-primary font-mono text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            </motion.button>

            {/* Shopping Bag Pill Button with Spring Bounce Micro-interaction */}
            <motion.button
              type="button"
              onClick={handleAddToCart}
              animate={cartBounce ? { scale: [1, 1.25, 0.95, 1.05, 1], rotate: [-8, 8, -4, 0] } : {}}
              transition={{ duration: 0.5 }}
              aria-label="Carrito de compras"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary text-primary hover:bg-secondary/90 transition-all shadow-md group hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-theme-1 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-primary">{cartCount}</span>
                <span className="text-[11px] font-secondary uppercase tracking-wider text-primary/70 hidden sm:inline">
                  Pares
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* 3. DYNAMIC SPATIAL AMBIENT BACKGROUND GRADIENT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            background:
              activeModel.id === 'aj1'
                ? 'radial-gradient(circle at 55% 45%, rgba(249, 110, 3, 0.16), transparent 60%)'
                : activeModel.id === 'aj12'
                ? 'radial-gradient(circle at 55% 45%, rgba(220, 38, 38, 0.14), transparent 60%)'
                : 'radial-gradient(circle at 55% 45%, rgba(30, 24, 16, 0.12), transparent 60%)',
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1E1810_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* 4. MAIN HERO SHOWCASE BODY (Edge-to-Edge Grid) */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-28 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* COLUMN 1: PRODUCT DETAILS & BUYING MECHANICS (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            {/* Category / Drop Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-secondary font-bold uppercase tracking-wider bg-theme-1 text-secondary shadow-xs">
                {activeModel.badge}
              </span>
              <span className="text-xs font-secondary font-bold tracking-wider uppercase text-secondary/70 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${config.glow}`} />
                {activeModel.colorName}
              </span>
            </div>

            {/* Sneaker Title */}
            <h1 className="font-heading text-3xl sm:text-5xl xl:text-6xl font-black text-secondary tracking-tight leading-[1.05] mb-2 uppercase">
              {activeModel.name}
            </h1>
            <p className="text-sm sm:text-base font-secondary font-bold text-secondary/90 tracking-wider uppercase mb-3">
              {activeModel.edition}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-secondary/80 max-w-xl leading-relaxed mb-5 font-normal">
              {activeModel.desc}
            </p>

            {/* Price & Installments Row */}
            <div className="flex flex-wrap items-baseline gap-3 mb-5 p-4 rounded-2xl bg-primary/70 border border-secondary/15 backdrop-blur-xs shadow-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-secondary tracking-tight">
                  {activeModel.priceCop}
                </span>
                <span className="text-xs font-bold text-secondary/60">
                  ({activeModel.priceUsd})
                </span>
              </div>
              <div className="w-full sm:w-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 3 cuotas sin interés con Addi
                </span>
              </div>
            </div>

            {/* Size Selector with Live Stock Micro-interaction */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 max-w-md">
                <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span>{t.sizeLabel}</span>
                  <span className="font-mono text-theme-1">[{selectedSize}]</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs text-secondary font-bold hover:text-theme-1 underline decoration-theme-1 decoration-2 underline-offset-2 transition-colors flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5 text-theme-1" />
                  {t.sizeGuide}
                </button>
              </div>

              {/* Sizes Grid */}
              <div className="flex flex-wrap gap-2 max-w-md mb-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const isUrgent = SIZE_STOCK_DATA[size]?.urgent;
                  return (
                    <motion.button
                      key={size}
                      type="button"
                      onClick={() => handleSelectSize(size)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      className={`h-11 min-w-[3rem] px-3 rounded-xl text-xs font-mono font-bold transition-all relative ${
                        isSelected
                          ? 'bg-secondary text-primary shadow-md ring-2 ring-theme-1 scale-105'
                          : 'bg-primary hover:bg-theme-9 text-secondary border border-secondary/20 hover:border-secondary'
                      }`}
                    >
                      {size}
                      {isUrgent && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Live Stock Indicator for Selected Size */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-secondary/70">
                <span className={`w-1.5 h-1.5 rounded-full ${activeStock.urgent ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600'}`} />
                <span>Talla US {selectedSize}:</span>
                <span className={`font-bold ${activeStock.urgent ? 'text-rose-600' : 'text-secondary'}`}>
                  {activeStock.stock}
                </span>
              </div>
            </div>

            {/* Add to Cart CTA Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full font-secondary font-bold uppercase tracking-wider text-sm transition-all shadow-md active:scale-95 ${
                  isAdded
                    ? 'bg-emerald-700 text-white scale-105 shadow-lg'
                    : 'bg-theme-1 text-secondary hover:bg-theme-2 hover:shadow-lg'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    <span>{t.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-secondary" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </motion.button>

              <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-secondary bg-primary px-3.5 py-3 rounded-full border border-secondary/15 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{t.stockStatus}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="text-xs text-secondary/80 flex flex-wrap items-center gap-4 pt-3 border-t border-secondary/10">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-theme-1" />
                {t.shippingNote}
              </span>
            </div>
          </div>

          {/* COLUMN 2: THE SPATIAL 3D SNEAKER VISUAL WITH MICRO-INTERACTIONS (4 COLS) */}
          <div
            ref={sneakerVisualRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringSneaker(true)}
            onMouseLeave={() => {
              setIsHoveringSneaker(false);
              setMousePosition({ x: 0, y: 0 });
            }}
            className="lg:col-span-4 relative flex flex-col items-center justify-center min-h-[420px] sm:min-h-[480px] xl:min-h-[540px] order-1 lg:order-2 perspective-[1000px] touch-pan-y"
          >
            {/* Animated Rotating Orbit Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className={`absolute w-[340px] sm:w-[440px] xl:w-[480px] h-[340px] sm:h-[440px] xl:h-[480px] rounded-full border-2 border-dashed border-secondary/15 pointer-events-none ${config.ring}`}
            />

            {/* Secondary counter-rotating dashed ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[280px] sm:w-[380px] xl:w-[420px] h-[280px] sm:h-[380px] xl:h-[420px] rounded-full border border-dotted border-secondary/10 pointer-events-none"
            />

            {/* Pulsing Colored Glow */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute w-72 sm:w-96 xl:w-[420px] h-72 sm:h-96 xl:h-[420px] rounded-full bg-gradient-to-br ${config.gradient} blur-3xl pointer-events-none`}
            />

            {/* Sneaker Contact Floor Shadow */}
            <motion.div
              animate={
                isHoveringSneaker
                  ? { scaleX: 1 - mousePosition.y * 0.2, opacity: 0.35 }
                  : { scaleX: [1, 1.05, 1], opacity: [0.35, 0.45, 0.35] }
              }
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-6 sm:bottom-10 w-72 sm:w-96 h-10 sm:h-14 bg-secondary/40 rounded-full blur-2xl transform scale-y-50 pointer-events-none"
            />

            {/* Interactive Control Pill (360 Spin & Hotspots Toggle) */}
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-secondary/15 shadow-sm text-[11px] font-mono">
              <button
                type="button"
                onClick={triggerSpin360}
                className="flex items-center gap-1 text-secondary hover:text-theme-1 transition-colors font-bold px-1.5 py-0.5 rounded-md hover:bg-theme-5"
                title="Girar silueta 360 grados"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinning360 ? 'animate-spin' : ''}`} />
                <span>360°</span>
              </button>
              <span className="text-secondary/30">|</span>
              <button
                type="button"
                onClick={() => setShowHotspots((prev) => !prev)}
                className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                  showHotspots ? 'text-theme-1 bg-theme-1/10' : 'text-secondary/70 hover:text-secondary'
                }`}
                title="Mostrar/ocultar puntos de inspección técnica"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Puntos</span>
              </button>
            </div>

            {/* Floating Sneaker Container with Parallax Tilt */}
            <div className="relative z-10 w-[320px] sm:w-[440px] md:w-[480px] lg:w-[440px] xl:w-[500px]">
              <motion.div
                animate={
                  isSpinning360
                    ? { rotateY: 360, rotateZ: 0, scale: 1.05 }
                    : isHoveringSneaker
                    ? {
                        y: mousePosition.y * -18,
                        x: mousePosition.x * 20,
                        rotateY: mousePosition.x * 24,
                        rotateX: mousePosition.y * -20,
                        scale: 1.04,
                      }
                    : { y: [-10, 10, -10], rotateY: 0, rotateX: 0, scale: 1 }
                }
                transition={
                  isSpinning360
                    ? { duration: 1.1, ease: 'easeInOut' }
                    : isHoveringSneaker
                    ? { type: 'spring', stiffness: 280, damping: 22 }
                    : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
                }
                className="relative cursor-grab active:cursor-grabbing select-none"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModel.id}
                    variants={SNEAKER_ANIMATIONS.image}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative flex items-center justify-center"
                  >
                    <Image
                      src={activeModel.image}
                      alt={activeModel.name}
                      width={960}
                      height={708}
                      priority
                      className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(30,24,16,0.35)] select-none pointer-events-none"
                    />

                    {/* LASER SCANNER LINE EFFECT */}
                    {isScanning && (
                      <motion.div
                        key={scanKey}
                        initial={{ top: '0%', opacity: 0 }}
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.6, ease: 'easeInOut' }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-theme-1 to-transparent shadow-[0_0_15px_#f96e03] pointer-events-none z-30"
                      >
                        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-theme-1/20 pointer-events-none" />
                      </motion.div>
                    )}

                    {/* INTERACTIVE HOTSPOT PINS OVER THE SNEAKER */}
                    {showHotspots && (
                      <>
                        {/* Hotspot 1: Cushioning / Heel */}
                        <div
                          className="absolute bottom-[28%] left-[24%] z-20"
                          onMouseEnter={() => setActiveHotspot('cushion')}
                          onMouseLeave={() => setActiveHotspot(null)}
                        >
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot((prev) => (prev === 'cushion' ? null : 'cushion'));
                            }}
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Inspeccionar amortiguación Air-Sole"
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-[10px] font-bold shadow-lg transition-colors ${
                              hoveredMetric === 'm1' || activeHotspot === 'cushion'
                                ? 'bg-theme-1 text-secondary ring-4 ring-theme-1/30 scale-110'
                                : 'bg-secondary text-primary border border-primary/30'
                            }`}
                          >
                            +
                          </motion.button>
                          {/* Hotspot Tooltip */}
                          {activeHotspot === 'cushion' && (
                            <div className="absolute bottom-9 left-0 sm:left-1/2 sm:-translate-x-1/2 w-44 sm:w-48 bg-secondary text-primary p-2.5 rounded-xl shadow-xl text-left border border-primary/20 z-40 animate-in fade-in zoom-in-95 duration-150">
                              <p className="text-[11px] font-bold font-secondary uppercase text-theme-1 mb-0.5">
                                Cámara Air-Sole
                              </p>
                              <p className="text-[10px] text-primary/80 leading-tight">
                                Cápsula presurizada a 25 PSI para absorber impactos y reducir fatiga articular.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Hotspot 2: Upper / Leather */}
                        <div
                          className="absolute top-[38%] right-[32%] z-20"
                          onMouseEnter={() => setActiveHotspot('upper')}
                          onMouseLeave={() => setActiveHotspot(null)}
                        >
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot((prev) => (prev === 'upper' ? null : 'upper'));
                            }}
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Inspeccionar cuero flor curtido"
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-[10px] font-bold shadow-lg transition-colors ${
                              hoveredMetric === 'm3' || activeHotspot === 'upper'
                                ? 'bg-theme-1 text-secondary ring-4 ring-theme-1/30 scale-110'
                                : 'bg-secondary text-primary border border-primary/30'
                            }`}
                          >
                            +
                          </motion.button>
                          {activeHotspot === 'upper' && (
                            <div className="absolute top-9 right-0 sm:left-1/2 sm:-translate-x-1/2 w-44 sm:w-48 bg-secondary text-primary p-2.5 rounded-xl shadow-xl text-left border border-primary/20 z-40 animate-in fade-in zoom-in-95 duration-150">
                              <p className="text-[11px] font-bold font-secondary uppercase text-theme-1 mb-0.5">
                                Cuero Flor Curtido
                              </p>
                              <p className="text-[10px] text-primary/80 leading-tight">
                                Capa de 1.4mm curtida al calor con micro-perforaciones para máxima ventilación.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Hotspot 3: Outsole / Traction */}
                        <div
                          className="absolute bottom-[16%] right-[28%] z-20"
                          onMouseEnter={() => setActiveHotspot('traction')}
                          onMouseLeave={() => setActiveHotspot(null)}
                        >
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot((prev) => (prev === 'traction' ? null : 'traction'));
                            }}
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Inspeccionar tracción pivot"
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-[10px] font-bold shadow-lg transition-colors ${
                              hoveredMetric === 'm2' || activeHotspot === 'traction'
                                ? 'bg-theme-1 text-secondary ring-4 ring-theme-1/30 scale-110'
                                : 'bg-secondary text-primary border border-primary/30'
                            }`}
                          >
                            +
                          </motion.button>
                          {activeHotspot === 'traction' && (
                            <div className="absolute bottom-9 right-0 sm:left-1/2 sm:-translate-x-1/2 w-44 sm:w-48 bg-secondary text-primary p-2.5 rounded-xl shadow-xl text-left border border-primary/20 z-40 animate-in fade-in zoom-in-95 duration-150">
                              <p className="text-[11px] font-bold font-secondary uppercase text-theme-1 mb-0.5">
                                Tracción Pivot
                              </p>
                              <p className="text-[10px] text-primary/80 leading-tight">
                                Dibujo concéntrico de goma vulcanizada con 98% de coeficiente de fricción.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Floating Review Badge */}
              <div className="absolute -top-2 right-2 sm:right-6 bg-primary/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-secondary/15 flex items-center gap-1.5 text-xs font-bold text-secondary">
                <span className="text-amber-500 text-sm">★</span>
                <span>{activeModel.rating}</span>
                <span className="text-secondary/60 font-normal">({activeModel.reviews} reviews)</span>
              </div>

              {/* NFC Authentic Pill */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono font-bold text-secondary bg-primary/95 px-4 py-1.5 rounded-full border border-secondary/15 shadow-md backdrop-blur-md">
                  <span className={`h-2 w-2 rounded-full ${config.glow} animate-pulse`} />
                  <span>NFC CHIP VERIFIED // AUTÉNTICO</span>
                </div>
              </div>
            </div>

            {/* Mobile Model Quick Switcher Dock (Visible directly under the shoe on mobile < lg) */}
            <div className="flex lg:hidden justify-center mt-7 mb-1 z-30 px-2 w-full">
              <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-secondary text-primary backdrop-blur-xl border border-primary/20 shadow-xl max-w-full overflow-x-auto">
                {t.models.map((model, idx) => {
                  const isActive = selectedModelIndex === idx;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleSelectModel(idx)}
                      className={`relative px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-secondary font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        isActive ? 'bg-theme-1 text-secondary shadow-md' : 'text-primary/75 hover:text-white'
                      }`}
                    >
                      <div className="relative w-5 h-5 rounded-full overflow-hidden bg-black/30 shrink-0 border border-white/20">
                        <Image
                          src={model.thumb}
                          alt={model.name}
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[11px] leading-none font-bold">
                        {model.name.split(' ').slice(0, 3).join(' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 3: PERFORMANCE TELEMETRY & SPECS PANEL WITH PROGRESSIVE LOADING (3 COLS) */}
          <div className="lg:col-span-3 flex flex-col justify-center order-3">
            <div className="bg-primary/90 rounded-3xl p-5 sm:p-6 border-2 border-secondary/15 shadow-lg backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-secondary/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-theme-1" />
                  <span className="text-xs font-secondary font-bold uppercase tracking-wider text-secondary">
                    Telemetría & Anatomía
                  </span>
                </div>
                
                {/* Re-scan button trigger */}
                <button
                  type="button"
                  onClick={triggerLaserScan}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-theme-1 hover:text-theme-2 bg-theme-1/10 hover:bg-theme-1/20 px-2 py-1 rounded-full transition-colors"
                  title="Re-escanear telemetría de la silueta"
                >
                  <Scan className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Escaneando...' : 'Escanear'}</span>
                </button>
              </div>

              {/* Animated Spec Bars with Real Counter & Shimmer Loading */}
              <div className="space-y-4 mb-5">
                {config.telemetry.map((metric) => {
                  const Icon = metric.icon;
                  const isHovered = hoveredMetric === metric.id;
                  return (
                    <div
                      key={`${activeModel.id}-${metric.id}-${scanKey}`}
                      onClick={() => setHoveredMetric((prev) => (prev === metric.id ? null : metric.id))}
                      onMouseEnter={() => setHoveredMetric(metric.id)}
                      onMouseLeave={() => setHoveredMetric(null)}
                      className={`group p-2 -mx-2 rounded-xl transition-all cursor-pointer ${
                        isHovered ? 'bg-theme-5 scale-[1.02]' : 'hover:bg-theme-5/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-secondary">
                          <Icon className={`w-3.5 h-3.5 transition-transform ${isHovered ? 'text-theme-1 scale-125' : 'text-theme-1'}`} />
                          <span className="truncate max-w-[170px]">{metric.label}</span>
                        </div>
                        <span className="font-mono font-black text-theme-1 text-xs">
                          <AnimatedCounter value={metric.value} duration={800} />
                        </span>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="relative h-2.5 w-full bg-secondary/10 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-theme-1 to-amber-500 relative overflow-hidden"
                        >
                          {/* Shimmer sweep animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-secondary/60 mt-1">
                        <span>{metric.detail}</span>
                        {isHovered && (
                          <span className="text-theme-1 font-bold animate-in fade-in duration-150">
                            Inspeccionar ↗
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tech Spec Footer Note */}
              <div className="pt-3 border-t border-secondary/10 flex items-center justify-between text-[11px] text-secondary/80">
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Certificado OG
                </span>
                <span className="font-mono text-[10px] text-secondary/60">
                  Stock ID: #{activeModel.id.toUpperCase()}-COL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING SNEAKER MODEL ISLAND SWITCHER (Desktop dock style) */}
      <div className="hidden lg:flex absolute bottom-4 sm:bottom-6 inset-x-0 justify-center z-30 pointer-events-none px-4">
        <motion.div
          layout
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-secondary/95 text-primary backdrop-blur-xl border border-primary/20 shadow-2xl ring-1 ring-black/10"
        >
          {t.models.map((model, idx) => {
            const isActive = selectedModelIndex === idx;
            return (
              <motion.button
                key={model.id}
                type="button"
                onClick={() => handleSelectModel(idx)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 sm:gap-3 text-xs font-secondary font-bold uppercase tracking-wider transition-all focus:outline-hidden ${
                  isActive ? 'text-primary' : 'text-primary/70 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sneaker-island"
                    className="absolute inset-0 rounded-full bg-theme-1 shadow-md"
                    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  />
                )}

                {/* Small Sneaker Thumb */}
                <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-black/30 shrink-0 border border-white/20">
                  <Image
                    src={model.thumb}
                    alt={model.name}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>

                <div className="relative z-10 text-left hidden sm:block">
                  <span className={`block text-xs leading-none ${isActive ? 'text-secondary font-black' : 'text-primary'}`}>
                    {model.name.split(' ').slice(0, 3).join(' ')}
                  </span>
                  <span className={`block text-[10px] font-mono leading-tight ${isActive ? 'text-secondary/90 font-bold' : 'text-primary/60'}`}>
                    {model.priceCop}
                  </span>
                </div>

                {isActive && (
                  <span className="relative z-10 text-xs font-black text-secondary sm:hidden">
                    {model.id.toUpperCase()}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* 6. TOAST NOTIFICATION ON ADD TO CART WITH AUTO-DISMISS PROGRESS LINE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-primary px-5 py-4 rounded-2xl shadow-2xl border border-secondary/20 flex flex-col gap-2 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-theme-1 text-secondary flex items-center justify-center font-black shrink-0">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-primary">{toastMessage}</p>
              <p className="text-[11px] text-primary/70">Stock reservado por 15 minutos en tu sesión</p>
            </div>
          </div>
          {/* Animated shrinking progress line */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4.5, ease: 'linear' }}
            className="h-1 bg-theme-1 rounded-full -mb-1"
          />
        </div>
      )}

      {/* 7. SIZE GUIDE MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-secondary/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-primary rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border-2 border-secondary/15 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-secondary/10 mb-4">
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-secondary">
                  Guía Oficial de Tallas de Calzado
                </h3>
                <span className="text-xs font-mono text-secondary/60">
                  Equivalencias US / EU / Colombia / Centímetros
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="w-9 h-9 rounded-full bg-theme-5 hover:bg-theme-9 text-secondary flex items-center justify-center text-sm font-bold border border-secondary/15 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-secondary/80 mb-4 leading-relaxed">
              Esta matriz interactiva se integra en tu e-commerce para que el cliente compruebe su talla exacta en centímetros y seleccione su equivalente nacional, eliminando hasta el 80% de devoluciones por error de horma.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-secondary/15 mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-theme-5 text-secondary font-mono font-bold border-b border-secondary/15">
                  <tr>
                    <th className="p-3">US (Men)</th>
                    <th className="p-3">EU</th>
                    <th className="p-3">Col (Nacional)</th>
                    <th className="p-3">Longitud (CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10 text-secondary font-mono">
                  <tr>
                    <td className="p-3 font-bold">7.5</td>
                    <td className="p-3">40.5</td>
                    <td className="p-3">38.5</td>
                    <td className="p-3">25.5 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">8.0</td>
                    <td className="p-3">41.0</td>
                    <td className="p-3">39.0</td>
                    <td className="p-3">26.0 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">8.5</td>
                    <td className="p-3">42.0</td>
                    <td className="p-3">40.0</td>
                    <td className="p-3">26.5 cm</td>
                  </tr>
                  <tr className="bg-theme-1/15 font-bold">
                    <td className="p-3 text-secondary">9.0</td>
                    <td className="p-3">42.5</td>
                    <td className="p-3">40.5</td>
                    <td className="p-3">27.0 cm</td>
                  </tr>
                  <tr className="bg-theme-1/25 font-bold">
                    <td className="p-3 text-secondary">9.5 (Más vendido)</td>
                    <td className="p-3">43.0</td>
                    <td className="p-3">41.0</td>
                    <td className="p-3">27.5 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">10.0</td>
                    <td className="p-3">44.0</td>
                    <td className="p-3">42.0</td>
                    <td className="p-3">28.0 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">10.5</td>
                    <td className="p-3">44.5</td>
                    <td className="p-3">42.5</td>
                    <td className="p-3">28.5 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">11.0</td>
                    <td className="p-3">45.0</td>
                    <td className="p-3">43.0</td>
                    <td className="p-3">29.0 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Recomendación: Ajuste fiel a la talla (True to Size)
              </span>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="btn-theme text-xs px-6 py-2.5 rounded-full"
              >
                Cerrar guía
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE MINI-CART DEMO DRAWER */}
      <SneakerMiniCart
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        model={activeModel}
        size={selectedSize}
        lang={lang}
      />
    </header>
  );
}
