'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Search,
  Check,
  X,
  Truck,
  RotateCw,
  Lock,
  Compass,
  Crosshair,
  Award,
  Gem,
  Sliders,
  Scan,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { track } from '@/lib/analytics';
import { JewelryMiniCart } from './JewelryMiniCart';

export type JewelryModel = {
  id: string;
  name: string;
  edition: string;
  desc: string;
  priceCop: string;
  priceUsd: string;
  rating: string;
  reviews: number;
  badge: string;
  metal: string;
  carats: string;
  clarity: string;
  cut: string;
  image: string;
  thumb: string;
};

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  icon: LucideIcon;
}

interface GemMetric {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  detail: string;
  zone: 'stone' | 'setting' | 'metal' | 'cert';
}

interface JewelryVisualConfig {
  gradient: string;
  glow: string;
  ring: string;
  accentHex: string;
  telemetry: GemMetric[];
}

function getModelConfigs(lang: string): Record<string, JewelryVisualConfig> {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  return {
    'diamond-ring': {
      gradient: 'from-amber-500/25 via-yellow-400/10 to-transparent',
      glow: 'bg-amber-400',
      ring: 'border-amber-400/35',
      accentHex: '#f59e0b',
      telemetry: [
        {
          id: 'm1',
          label: isEs
            ? 'Pureza / Claridad GIA (VVS1)'
            : isPt
              ? 'Pureza / Clareza GIA (VVS1)'
              : 'GIA Clarity Grade (VVS1)',
          value: 99,
          icon: Gem,
          detail: isEs
            ? 'Sin inclusiones visibles a 10x aumentos'
            : isPt
              ? 'Sem inclusões visíveis sob lupa 10x'
              : 'Eye-clean, microscopically flawless at 10x',
          zone: 'stone',
        },
        {
          id: 'm2',
          label: isEs
            ? 'Grado de Color (Color F)'
            : isPt
              ? 'Grau de Cor (Cor F)'
              : 'Color Grade (Color F)',
          value: 98,
          icon: Sparkles,
          detail: isEs
            ? 'Blanco extra incoloro de alto fuego óptico'
            : isPt
              ? 'Branco incolor com refração intensa'
              : 'Extra colorless white with superior optical fire',
          zone: 'stone',
        },
        {
          id: 'm3',
          label: isEs
            ? 'Corte & Pulido (Triple Excellent)'
            : isPt
              ? 'Lapidação & Polimento (Triple Excellent)'
              : 'Cut & Polish (Triple Excellent)',
          value: 100,
          icon: Award,
          detail: isEs
            ? 'Proporciones ideales de refracción de luz'
            : isPt
              ? 'Proporções perfeitas de refração'
              : 'Mathematical ideal proportions for brilliance',
          zone: 'cert',
        },
        {
          id: 'm4',
          label: isEs
            ? 'Nobleza de Montura (Oro 18k / Platino)'
            : isPt
              ? 'Nobreza da Montagem (Ouro 18k / Platina)'
              : 'Setting Purity (18k Gold / 950 Platinum)',
          value: 97,
          icon: ShieldCheck,
          detail: isEs
            ? 'Ley oficial 750 pulido espejo hipoalergénico'
            : isPt
              ? 'Contraste oficial 750 com polimento espelhado'
              : 'Official 750 hallmark mirror-polish finish',
          zone: 'metal',
        },
      ],
    },
    'emerald-necklace': {
      gradient: 'from-emerald-500/25 via-emerald-600/10 to-transparent',
      glow: 'bg-emerald-500',
      ring: 'border-emerald-500/40',
      accentHex: '#10b981',
      telemetry: [
        {
          id: 'm1',
          label: isEs
            ? 'Origen Certificado (Minas de Muzo)'
            : isPt
              ? 'Origem Certificada (Minas de Muzo)'
              : 'Certified Origin (Muzo Mines)',
          value: 100,
          icon: Gem,
          detail: isEs
            ? 'Fila Muzo, Boyacá — el verde más cotizado'
            : isPt
              ? 'Fila Muzo, Boyacá — o verde mais cobiçado'
              : 'Boyacá, Colombia — world benchmark green',
          zone: 'stone',
        },
        {
          id: 'm2',
          label: isEs
            ? 'Saturación de Cristal (Verde Vívido)'
            : isPt
              ? 'Saturação de Cristal (Verde Vívido)'
              : 'Crystal Saturation (Vivid Green)',
          value: 98,
          icon: Sparkles,
          detail: isEs
            ? 'Color profundo natural sin resinas artificiales'
            : isPt
              ? 'Tom profundo natural sem resinas artificiais'
              : 'Natural deep saturation without artificial resins',
          zone: 'stone',
        },
        {
          id: 'm3',
          label: isEs
            ? 'Halo Micro-Pavé (18 Diamantes F-VS)'
            : isPt
              ? 'Halo Micro-Pavé (18 Diamantes F-VS)'
              : 'Micro-Pavé Halo (18 F-VS Diamonds)',
          value: 96,
          icon: Award,
          detail: isEs
            ? 'Alineación micrométrica engastada a mano'
            : isPt
              ? 'Alinhamento micrométrico cravado à mão'
              : 'Hand-set optical alignment for halo sparkle',
          zone: 'setting',
        },
        {
          id: 'm4',
          label: isEs
            ? 'Cadena & Asa (Oro Amarillo 18k)'
            : isPt
              ? 'Corrente & Elo (Ouro Amarelo 18k)'
              : 'Chain & Bail (18k Solid Yellow Gold)',
          value: 97,
          icon: ShieldCheck,
          detail: isEs
            ? 'Eslabones macizos con contraste oficial 750'
            : isPt
              ? 'Elos maciços com contraste oficial 750'
              : 'Solid gold links with 750 official hallmark',
          zone: 'metal',
        },
      ],
    },
    'tennis-bracelet': {
      gradient: 'from-cyan-400/25 via-sky-500/10 to-transparent',
      glow: 'bg-cyan-400',
      ring: 'border-cyan-400/35',
      accentHex: '#38bdf8',
      telemetry: [
        {
          id: 'm1',
          label: isEs
            ? 'Calibre Total (4.00 Quilates Naturales)'
            : isPt
              ? 'Calibre Total (4.00 Quilates Naturais)'
              : 'Total Carat Weight (4.00 ct Natural)',
          value: 99,
          icon: Gem,
          detail: isEs
            ? '55 diamantes idénticos calibrados 1 a 1'
            : isPt
              ? '55 diamantes calibrados individualmente'
              : '55 round brilliant diamonds matched 1-to-1',
          zone: 'stone',
        },
        {
          id: 'm2',
          label: isEs
            ? 'Consistencia Óptica (Color F / VS1)'
            : isPt
              ? 'Consistência Óptica (Cor F / VS1)'
              : 'Optical Grading (F Color / VS1 Clarity)',
          value: 97,
          icon: Sparkles,
          detail: isEs
            ? 'Uniformidad perfecta en toda la circunferencia'
            : isPt
              ? 'Uniformidade perfeita em todo o aro'
              : 'Seamless optical uniformity across the bracelet',
          zone: 'cert',
        },
        {
          id: 'm3',
          label: isEs
            ? 'Cierre de Bóveda (Doble Traba Oculta)'
            : isPt
              ? 'Fecho do Cofre (Trava Dupla Oculta)'
              : 'Vault Clasp (Dual Concealed Safety)',
          value: 100,
          icon: ShieldCheck,
          detail: isEs
            ? 'Broche patentado anti-apertura accidental'
            : isPt
              ? 'Fecho patenteado anti-abertura acidental'
              : 'Patented accidental-release prevention latch',
          zone: 'setting',
        },
        {
          id: 'm4',
          label: isEs
            ? 'Caída Ergonómica (Articulación Flexible)'
            : isPt
              ? 'Caimento Ergonômico (Articulação Sedosa)'
              : 'Ergonomic Flow (Flexible Articulation)',
          value: 98,
          icon: Award,
          detail: isEs
            ? 'Articulación continua con caída sedosa en muñeca'
            : isPt
              ? 'Articulação contínua com caimento perfeito'
              : 'Velvety fluid drape engineered for comfort',
          zone: 'metal',
        },
      ],
    },
  };
}

const JEWELRY_ANIMATIONS: { image: Variants } = {
  image: {
    initial: {
      opacity: 0,
      scale: 0.85,
      filter: 'blur(10px)',
      rotate: -12,
      x: 50,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: 0,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 220, damping: 22 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      filter: 'blur(12px)',
      rotate: 12,
      x: -50,
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

export interface JewelryHeroShowcaseProps {
  t: {
    badge: string;
    title: string;
    description: string;
    toggleClient: string;
    toggleTech: string;
    navRings: string;
    navNecklaces: string;
    navEmeralds: string;
    navBracelets: string;
    navHighJewelry: string;
    brandBadge: string;
    sizeLabel: string;
    sizeGuide: string;
    metalLabel: string;
    metalGold: string;
    metalWhite: string;
    metalRose: string;
    metalPlatinum: string;
    addToCart: string;
    addedToCart: string;
    cartBadge: string;
    stockStatus: string;
    shippingNote: string;
    altTitle: string;
    quickSwitch: string;
    models: JewelryModel[];
  };
  lang?: string;
}

export function JewelryHeroShowcase({ t, lang = 'es' }: JewelryHeroShowcaseProps) {
  const isEs = lang === 'es';
  const isPt = lang === 'pt';

  const models = t.models && t.models.length > 0 ? t.models : [];
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('6.5');
  const [selectedMetal, setSelectedMetal] = useState<string>('white-gold');
  const [cartCount, setCartCount] = useState<number>(1);
  const [wishlistCount, setWishlistCount] = useState<number>(3);
  const [isWishlistActive, setIsWishlistActive] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);

  // Interactive micro-interactions states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSpinning360, setIsSpinning360] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [cartBounce, setCartBounce] = useState<boolean>(false);
  const [scanKey, setScanKey] = useState<number>(0);

  // 3D Mouse Parallax Tilt
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringJewelry, setIsHoveringJewelry] = useState<boolean>(false);
  const jewelryVisualRef = useRef<HTMLDivElement>(null);

  const modelConfigs = useMemo(() => getModelConfigs(lang), [lang]);
  const activeModel = models[selectedModelIndex] || models[0];
  const config = modelConfigs[activeModel.id] || modelConfigs['diamond-ring'];

  // Ring sizes for the clean pill bar
  const primaryRingSizes = ['6.0', '6.5', '7.0', '7.5', '8.0'];

  // Full conversion data for modal
  const ringConversionData = [
    { us: '5.0', col: '10', mmCirc: '49.3', mmDiam: '15.7' },
    { us: '5.5', col: '11', mmCirc: '50.6', mmDiam: '16.1' },
    { us: '6.0', col: '12', mmCirc: '51.9', mmDiam: '16.5' },
    { us: '6.5', col: '13', mmCirc: '53.1', mmDiam: '16.9' },
    { us: '7.0', col: '14', mmCirc: '54.4', mmDiam: '17.3' },
    { us: '7.5', col: '15', mmCirc: '55.7', mmDiam: '17.7' },
    { us: '8.0', col: '16', mmCirc: '57.0', mmDiam: '18.1' },
    { us: '8.5', col: '17', mmCirc: '58.3', mmDiam: '18.5' },
    { us: '9.0', col: '18', mmCirc: '59.5', mmDiam: '19.0' },
  ];

  // Minimal luxury metal swatches
  const metalsList = [
    {
      id: 'white-gold',
      label: t.metalWhite || (isEs ? 'Oro Blanco 18k' : isPt ? 'Ouro Branco 18k' : '18k White Gold'),
      gradient: 'from-slate-200 via-gray-100 to-slate-300',
      border: 'border-slate-300',
    },
    {
      id: 'yellow-gold',
      label: t.metalGold || (isEs ? 'Oro Amarillo 18k' : isPt ? 'Ouro Amarelo 18k' : '18k Yellow Gold'),
      gradient: 'from-amber-300 via-yellow-200 to-amber-500',
      border: 'border-amber-400',
    },
    {
      id: 'rose-gold',
      label: t.metalRose || (isEs ? 'Oro Rosa 18k' : isPt ? 'Ouro Rosé 18k' : '18k Rose Gold'),
      gradient: 'from-rose-300 via-rose-200 to-amber-300',
      border: 'border-rose-400',
    },
    {
      id: 'platinum',
      label: t.metalPlatinum || (isEs ? 'Platino 950' : isPt ? 'Platina 950' : '950 Platinum'),
      gradient: 'from-zinc-100 via-white to-zinc-300',
      border: 'border-zinc-300',
    },
  ];

  const hotspotsByModel: Record<string, Hotspot[]> = {
    'diamond-ring': [
      {
        id: 'diamond-center',
        x: 50,
        y: 28,
        label: isEs ? 'Diamante GIA 1.50ct' : isPt ? 'Diamante GIA 1.50ct' : '1.50ct GIA Diamond',
        detail: isEs
          ? 'Corte brillante ideal con máxima dispersión de fuego prismático y refracción.'
          : isPt
            ? 'Lapidação brilhante ideal com máxima dispersão de fogo óptico e brilho.'
            : 'Ideal round brilliant cut with supreme scintillation and optical fire.',
        icon: Gem,
      },
      {
        id: 'platinum-prongs',
        x: 42,
        y: 44,
        label: isEs ? 'Engaste en 6 Uñas' : isPt ? 'Cravação de 6 Garras' : '6-Prong Platinum Setting',
        detail: isEs
          ? 'Platino 950 sólido para retención vitalicia y máxima seguridad de la gema.'
          : isPt
            ? 'Platina 950 maciça para retenção vitalícia e máxima segurança da gema.'
            : 'Solid 950 platinum prongs for lifetime stone retention and security.',
        icon: ShieldCheck,
      },
      {
        id: 'gold-band',
        x: 68,
        y: 68,
        label: isEs ? 'Aro Oro 18k Confort' : isPt ? 'Aro Ouro 18k Confort' : '18k Comfort Fit Band',
        detail: isEs
          ? 'Acabado pulido espejo con sello oficial de ley 750 grabado en láser.'
          : isPt
            ? 'Acabamento espelhado com contraste oficial 750 gravado a laser.'
            : 'Mirror-polish finish with official 750 hallmark laser engraving.',
        icon: Sparkles,
      },
    ],
    'emerald-necklace': [
      {
        id: 'emerald-center',
        x: 50,
        y: 44,
        label: isEs ? 'Esmeralda Muzo 2.20ct' : isPt ? 'Esmeralda Muzo 2.20ct' : '2.20ct Muzo Emerald',
        detail: isEs
          ? 'Verde vívido profundo de origen colombiano certificado con fuego interior.'
          : isPt
            ? 'Verde vívido profundo de origem colombiana certificada com brilho intenso.'
            : 'Deep vivid green certified authentic Colombian Muzo origin.',
        icon: Gem,
      },
      {
        id: 'diamond-halo',
        x: 58,
        y: 56,
        label: isEs ? 'Halo Micro-Pavé' : isPt ? 'Halo Micro-Pavé' : 'Micro-Pavé Halo',
        detail: isEs
          ? '18 diamantes naturales F-VS que multiplican el resplandor de la lágrima.'
          : isPt
            ? '18 diamantes naturais F-VS que ampliam o brilho da gota central.'
            : '18 natural F-VS diamonds amplifying the central teardrop brilliance.',
        icon: Sparkles,
      },
      {
        id: 'gold-chain',
        x: 50,
        y: 22,
        label: isEs ? 'Cadena Oro 18k' : isPt ? 'Corrente Ouro 18k' : '18k Gold Chain',
        detail: isEs
          ? 'Eslabones macizos en oro de ley 750 con cierre seguro de seguridad.'
          : isPt
            ? 'Elos maciços em ouro de lei 750 com fecho seguro de alta joalheria.'
            : 'Solid 18k gold links with secure luxury clasp mechanism.',
        icon: ShieldCheck,
      },
    ],
    'tennis-bracelet': [
      {
        id: 'tennis-continuous',
        x: 50,
        y: 48,
        label: isEs ? '55 Diamantes Calibrados' : isPt ? '55 Diamantes Calibrados' : '55 Calibrated Diamonds',
        detail: isEs
          ? '4.00 quilates totales graduados individualmente en color F y pureza VS1.'
          : isPt
            ? '4.00 quilates totais graduados individualmente em cor F e pureza VS1.'
            : '4.00 total carats individually graded F color and VS1 clarity.',
        icon: Gem,
      },
      {
        id: 'safety-clasp',
        x: 74,
        y: 64,
        label: isEs ? 'Broche Doble Seguridad' : isPt ? 'Fecho Duplo de Segurança' : 'Concealed Double Clasp',
        detail: isEs
          ? 'Cierre invisible integrado con traba lateral de seguridad anti-apertura.'
          : isPt
            ? 'Fecho invisível com trava lateral de segurança anti-abertura.'
            : 'Integrated concealed clasp with dual side safety catch.',
        icon: ShieldCheck,
      },
      {
        id: 'articulated-links',
        x: 28,
        y: 55,
        label: isEs ? 'Eslabones Flexibles' : isPt ? 'Elos Articulados' : 'Articulated Links',
        detail: isEs
          ? 'Diseño ergonómico continuo con caída natural y sedosa sobre la muñeca.'
          : isPt
            ? 'Design ergonômico contínuo com caimento sedoso sobre o pulso.'
            : 'Continuous ergonomic design with a fluid silky drape around the wrist.',
        icon: Award,
      },
    ],
  };

  const activeHotspots = hotspotsByModel[activeModel.id] || hotspotsByModel['diamond-ring'];

  const handleSelectModel = (index: number) => {
    setSelectedModelIndex(index);
    triggerLaserScan();
    track('proposal_hero_interacted', {
      action: 'switch_jewelry_model',
      model_id: models[index]?.id,
      model_name: models[index]?.name,
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
    if (!jewelryVisualRef.current) return;
    const rect = jewelryVisualRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    setCartCount((prev) => prev + 1);
    setCartBounce(true);
    setIsMiniCartOpen(true);
    const addedText = isEs
      ? `✓ ${activeModel.name} añadido a tu cofre privado`
      : isPt
        ? `✓ ${activeModel.name} adicionado ao seu porta-joias`
        : `✓ ${activeModel.name} secured in your bespoke bag`;
    setToastMessage(addedText);

    track('jewelry_added_to_cart', {
      piece_id: activeModel.id,
      piece_name: activeModel.name,
      metal: selectedMetal,
      size: selectedSize,
      price: activeModel.priceCop,
    });

    setTimeout(() => setCartBounce(false), 800);
    setTimeout(() => setIsAdded(false), 2200);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <header className="w-full relative overflow-hidden bg-[#0a0908] text-[#FAF7F2] border-b border-amber-400/15 select-none">
      {/* 1. TOP ANNOUNCEMENT TICKER (Luxury Haute Joaillerie Bar) */}
      <div className="w-full bg-[#12100E] text-[#FAF7F2] py-2 px-4 text-xs font-mono border-b border-white/10">
        <div className="w-full max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-bold tracking-wider text-amber-300 uppercase text-[11px] sm:text-xs">
              {t.badge || (isEs ? 'DEMO EN VIVO // ALTA JOYERÍA' : isPt ? 'DEMO AO VIVO // ALTA JOALHERIA' : 'LIVE DEMO // HAUTE JOAILLERIE')}
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="text-[#E2DDD5]/80 hidden sm:inline text-xs">
              {isEs
                ? 'Bóveda central activa — Transporte blindado de valores 100% asegurado'
                : isPt
                  ? 'Cofre central ativo — Transporte blindado de valores 100% segurado'
                  : 'Active central vault — 100% insured armored courier transit'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium text-[#E2DDD5]/80">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isEs ? 'Certificado GIA & Laudo' : isPt ? 'Certificado GIA & Laudo' : 'GIA Certified'}
            </span>
            <span className="text-white/20 hidden md:inline">|</span>
            <span className="text-emerald-400 hidden md:inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {isEs ? 'Empaque Ciego Lacrado' : isPt ? 'Embalagem Discreta Lacrada' : 'Tamper-Proof Vault Case'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FULL-WIDTH LUXURY NAVBAR */}
      <nav className="w-full border-b border-white/10 bg-[#0F0D0C]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-6">
          {/* Brand Monogram & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black text-sm tracking-tighter shadow-md border border-amber-300/40">
              MM
            </div>
            <div>
              <span className="font-heading font-black tracking-wider text-amber-100 text-xl sm:text-2xl leading-none block">
                MAISON MORALES
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 hidden sm:block font-bold">
                HAUTE JOAILLERIE // BOGOTÁ
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-secondary font-bold tracking-wider uppercase text-[#E2DDD5]/80">
            <span className="text-amber-300 hover:text-amber-200 cursor-pointer transition-colors flex items-center gap-1.5 font-black underline decoration-amber-400 decoration-2 underline-offset-4">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              {t.navRings || 'Solitarios GIA'}
            </span>
            <span className="hover:text-amber-200 cursor-pointer transition-colors text-emerald-400 font-bold">
              {t.navEmeralds || 'Esmeraldas Muzo 💎'}
            </span>
            <span className="hover:text-amber-200 cursor-pointer transition-colors">
              {t.navNecklaces || 'Collares & Gargantillas'}
            </span>
            <span className="hover:text-amber-200 cursor-pointer transition-colors">
              {t.navBracelets || 'Pulseras Tennis'}
            </span>
            <span className="hover:text-amber-200 cursor-pointer transition-colors">
              {t.navHighJewelry || 'Alta Joyería'}
            </span>
          </div>

          {/* Action Icons: Search, Wishlist, Bespoke Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              aria-label="Buscar creación"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#FAF7F2] border border-white/15 transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4 text-amber-300" />
            </button>

            {/* Wishlist Button with Heart Burst Micro-interaction */}
            <motion.button
              type="button"
              onClick={handleToggleWishlist}
              whileTap={{ scale: 0.85 }}
              aria-label="Favoritos"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-2xs hover:scale-105 active:scale-95 relative ${
                isWishlistActive
                  ? 'bg-rose-950/80 text-rose-400 border-rose-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
              }`}
            >
              <motion.div
                animate={isWishlistActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isWishlistActive ? 'fill-rose-400' : ''
                  }`}
                />
              </motion.div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 font-mono text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            </motion.button>

            {/* Shopping Bag / Bespoke Cart Button */}
            <motion.button
              type="button"
              onClick={handleAddToCart}
              animate={cartBounce ? { scale: [1, 1.25, 0.95, 1.05, 1], rotate: [-8, 8, -4, 0] } : {}}
              transition={{ duration: 0.5 }}
              aria-label={t.cartBadge || 'Cofre'}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-stone-950 font-bold hover:shadow-amber-400/20 hover:shadow-lg transition-all shadow-md group hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-1.5 font-secondary font-black text-xs uppercase tracking-wider">
                <span className="font-mono text-xs">{cartCount}</span>
                <span className="hidden sm:inline">
                  {t.cartBadge || (isEs ? 'Cofre' : isPt ? 'Porta-Joias' : 'Bag')}
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
              activeModel.id === 'emerald-necklace'
                ? 'radial-gradient(circle at 55% 45%, rgba(16, 185, 129, 0.18), transparent 60%)'
                : activeModel.id === 'tennis-bracelet'
                ? 'radial-gradient(circle at 55% 45%, rgba(56, 189, 248, 0.16), transparent 60%)'
                : 'radial-gradient(circle at 55% 45%, rgba(245, 158, 11, 0.16), transparent 60%)',
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        />
        {/* Diamond subtle dust/grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* 4. MAIN HERO SHOWCASE BODY (Edge-to-Edge Grid) */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-28 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* COLUMN 1: PRODUCT DETAILS & BUYING MECHANICS (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            {/* Category / Drop Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-secondary font-bold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-xs">
                {activeModel.badge}
              </span>
              <span className="text-xs font-mono tracking-wider uppercase text-amber-300/80 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${config.glow}`} />
                {metalsList.find((m) => m.id === selectedMetal)?.label}
              </span>
            </div>

            {/* Jewelry Piece Title */}
            <h1 className="font-heading text-3xl sm:text-5xl xl:text-6xl font-black text-[#FAF7F2] tracking-tight leading-[1.05] mb-2 uppercase">
              {activeModel.name}
            </h1>
            <p className="text-sm sm:text-base font-secondary font-bold text-amber-300 tracking-wider uppercase mb-3">
              {activeModel.edition}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#E2DDD5]/80 max-w-xl leading-relaxed mb-5 font-normal">
              {activeModel.desc}
            </p>

            {/* Price & Financing Row */}
            <div className="flex flex-wrap items-baseline gap-3 mb-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
                  {activeModel.priceCop}
                </span>
                <span className="text-xs font-bold text-[#E2DDD5]/60 font-mono">
                  ({activeModel.priceUsd})
                </span>
              </div>
              <div className="w-full sm:w-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 3 cuotas sin interés con Addi
                </span>
              </div>
            </div>

            {/* Minimalist Precious Metal Swatches */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2 max-w-md text-xs font-mono uppercase tracking-wider">
                <span className="text-[#E2DDD5]/70">
                  {t.metalLabel || (isEs ? 'Metal Precioso' : isPt ? 'Metal Precioso' : 'Precious Metal')}
                </span>
                <span className="text-amber-300 font-bold">
                  {metalsList.find((m) => m.id === selectedMetal)?.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {metalsList.map((m) => {
                  const isSelected = selectedMetal === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMetal(m.id)}
                      className={`relative group p-1 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0908] scale-110'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      title={m.label}
                    >
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${m.gradient} border ${m.border} shadow-sm`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector (Clean for rings, dimensions for necklace/bracelet) */}
            <div className="mb-6">
              {activeModel.id === 'diamond-ring' ? (
                <>
                  <div className="flex items-center justify-between mb-2 max-w-md">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2] flex items-center gap-1.5">
                      <span>{t.sizeLabel || (isEs ? 'Talla de Anillo (US)' : isPt ? 'Medida do Anel' : 'Ring Size (US)')}</span>
                      <span className="font-mono text-amber-300 font-bold">[{selectedSize}]</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeModal(true)}
                      className="text-xs text-amber-300 font-bold hover:text-amber-200 underline decoration-amber-400 decoration-2 underline-offset-2 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      {t.sizeGuide || (isEs ? 'Guía de medidas 📏' : isPt ? 'Tabela de aros 📏' : 'Size guide 📏')}
                    </button>
                  </div>

                  {/* Clean 5-pill size bar */}
                  <div className="flex flex-wrap gap-2 max-w-md mb-2">
                    {primaryRingSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <motion.button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.94 }}
                          className={`h-11 min-w-[3.2rem] px-3 rounded-xl text-xs font-mono font-bold transition-all relative cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300 scale-105 font-black'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/15'
                          }`}
                        >
                          {size}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Live Vault Status for Selected Size */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#E2DDD5]/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isEs ? 'Talla US' : isPt ? 'Tamanho US' : 'Size US'} {selectedSize}:</span>
                    <span className="font-bold text-amber-300">
                      {isEs ? 'En Bóveda Central (Despacho Inmediato)' : isPt ? 'No Cofre Central (Envio 24h)' : 'In Central Vault (24h Dispatch)'}
                    </span>
                  </div>
                </>
              ) : activeModel.id === 'emerald-necklace' ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-w-md text-xs font-mono flex items-center justify-between text-[#E2DDD5]/80">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {isEs ? 'Largo de Gargantilla:' : isPt ? 'Comprimento da Gargantilha:' : 'Necklace Length:'}
                  </span>
                  <span className="font-bold text-amber-300">
                    45 cm ({isEs ? 'Ajustable en Oro 18k' : isPt ? 'Ajustável Ouro 18k' : 'Adjustable 18k'})
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-w-md text-xs font-mono flex items-center justify-between text-[#E2DDD5]/80">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {isEs ? 'Longitud Pulsera Tennis:' : isPt ? 'Comprimento Pulseira:' : 'Tennis Bracelet Length:'}
                  </span>
                  <span className="font-bold text-amber-300">
                    17.5 cm ({isEs ? 'Ajuste a muñeca sin costo' : isPt ? 'Ajuste sem custo' : 'Bespoke fit included'})
                  </span>
                </div>
              )}
            </div>

            {/* Add to Cart CTA Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full font-secondary font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-600 text-white scale-105 shadow-lg'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-amber-200 text-stone-950 hover:shadow-amber-400/25 hover:shadow-xl'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    <span>{t.addedToCart || '¡Añadido al cofre!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-stone-950" />
                    <span>{t.addToCart || (isEs ? 'Añadir al cofre' : isPt ? 'Adicionar ao porta-joias' : 'Add to bespoke bag')}</span>
                  </>
                )}
              </motion.button>

              <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-[#E2DDD5] bg-white/5 px-3.5 py-3 rounded-full border border-white/10 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.stockStatus || 'Pieza Única en Bóveda'}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="text-xs text-[#E2DDD5]/80 flex flex-wrap items-center gap-4 pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-amber-400" />
                {t.shippingNote || (isEs ? 'Envío 100% asegurado en camión blindado' : isPt ? 'Envio 100% segurado em transporte blindado' : '100% insured armored transit')}
              </span>
            </div>
          </div>

          {/* COLUMN 2: THE SPATIAL 3D JEWELRY VISUAL WITH MICRO-INTERACTIONS (4 COLS) */}
          <div
            ref={jewelryVisualRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringJewelry(true)}
            onMouseLeave={() => {
              setIsHoveringJewelry(false);
              setMousePosition({ x: 0, y: 0 });
            }}
            className="lg:col-span-4 relative flex flex-col items-center justify-center min-h-[440px] sm:min-h-[500px] xl:min-h-[560px] order-1 lg:order-2 perspective-[1000px] touch-pan-y"
          >
            {/* Animated Rotating Orbit Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              className={`absolute w-[340px] sm:w-[440px] xl:w-[480px] h-[340px] sm:h-[440px] xl:h-[480px] rounded-full border-2 border-dashed pointer-events-none ${config.ring}`}
            />

            {/* Secondary counter-rotating dashed ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[280px] sm:w-[380px] xl:w-[420px] h-[280px] sm:h-[380px] xl:h-[420px] rounded-full border border-dotted border-white/10 pointer-events-none"
            />

            {/* Pulsing Colored Glow */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute w-72 sm:w-96 xl:w-[420px] h-72 sm:h-96 xl:h-[420px] rounded-full bg-gradient-to-br ${config.gradient} blur-3xl pointer-events-none`}
            />

            {/* Jewelry Contact Floor Shadow */}
            <motion.div
              animate={
                isHoveringJewelry
                  ? { scaleX: 1 - mousePosition.y * 0.2, opacity: 0.4 }
                  : { scaleX: [1, 1.05, 1], opacity: [0.35, 0.5, 0.35] }
              }
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-6 sm:bottom-10 w-72 sm:w-96 h-10 sm:h-14 bg-black/60 rounded-full blur-2xl transform scale-y-50 pointer-events-none"
            />

            {/* Interactive Control Pill (360 Spin & Hotspots Toggle) */}
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-[#12100E]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/20 shadow-sm text-[11px] font-mono">
              <button
                type="button"
                onClick={triggerSpin360}
                className="flex items-center gap-1 text-[#FAF7F2] hover:text-amber-300 transition-colors font-bold px-1.5 py-0.5 rounded-md hover:bg-white/5 cursor-pointer"
                title={isEs ? 'Girar pieza 360 grados' : isPt ? 'Girar peça 360°' : 'Spin piece 360°'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinning360 ? 'animate-spin' : ''}`} />
                <span>360°</span>
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                onClick={() => setShowHotspots((prev) => !prev)}
                className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  showHotspots ? 'text-amber-300 bg-amber-400/10' : 'text-[#E2DDD5]/70 hover:text-white'
                }`}
                title={isEs ? 'Mostrar/ocultar puntos de inspección' : isPt ? 'Pontos de inspeção' : 'Toggle inspection pins'}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{isEs ? 'Puntos' : isPt ? 'Pontos' : 'Pins'}</span>
              </button>
            </div>

            {/* Floating Jewelry Container with Parallax Tilt */}
            <div className="relative z-10 w-[300px] sm:w-[420px] md:w-[460px] lg:w-[420px] xl:w-[480px]">
              <motion.div
                animate={
                  isSpinning360
                    ? { rotateY: 360, rotateZ: 0, scale: 1.05 }
                    : isHoveringJewelry
                    ? {
                        y: mousePosition.y * -16,
                        x: mousePosition.x * 18,
                        rotateY: mousePosition.x * 22,
                        rotateX: mousePosition.y * -18,
                        scale: 1.05,
                      }
                    : { y: [-8, 8, -8], rotateY: 0, rotateX: 0, scale: 1 }
                }
                transition={
                  isSpinning360
                    ? { duration: 1.1, ease: 'easeInOut' }
                    : isHoveringJewelry
                    ? { type: 'spring', stiffness: 280, damping: 22 }
                    : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
                }
                className="relative cursor-grab active:cursor-grabbing select-none"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModel.id}
                    variants={JEWELRY_ANIMATIONS.image}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative flex items-center justify-center"
                  >
                    <Image
                      src={activeModel.image}
                      alt={activeModel.name}
                      width={800}
                      height={800}
                      priority
                      className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] select-none pointer-events-none"
                    />

                    {/* LASER SCANNER LINE EFFECT */}
                    {isScanning && (
                      <motion.div
                        key={scanKey}
                        initial={{ top: '0%', opacity: 0 }}
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.6, ease: 'easeInOut' }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_#f59e0b] pointer-events-none z-30"
                      >
                        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-amber-400/20 pointer-events-none" />
                      </motion.div>
                    )}

                    {/* INTERACTIVE HOTSPOT PINS OVER THE JEWELRY */}
                    {showHotspots && (
                      <>
                        {activeHotspots.map((hs) => {
                          const Icon = hs.icon;
                          const isActive = activeHotspot === hs.id;
                          return (
                            <div
                              key={hs.id}
                              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                              onMouseEnter={() => setActiveHotspot(hs.id)}
                              onMouseLeave={() => setActiveHotspot(null)}
                            >
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveHotspot((prev) => (prev === hs.id ? null : hs.id));
                                }}
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={hs.label}
                                className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-[10px] font-bold shadow-xl transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/40 scale-110'
                                    : 'bg-stone-950/90 text-amber-300 border border-amber-400/40 backdrop-blur-md'
                                }`}
                              >
                                +
                              </motion.button>

                              {/* Tooltip Card */}
                              {isActive && (
                                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-48 sm:w-56 bg-stone-950/95 text-[#FAF7F2] p-3 rounded-2xl shadow-2xl text-left border border-amber-400/40 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                                  <div className="flex items-center gap-1.5 text-[11px] font-bold font-secondary uppercase text-amber-300 mb-1">
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{hs.label}</span>
                                  </div>
                                  <p className="text-[10px] text-[#E2DDD5]/80 leading-relaxed font-normal">
                                    {hs.detail}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Floating Review Badge */}
              <div className="absolute -top-2 right-2 sm:right-4 bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/15 flex items-center gap-1.5 text-xs font-bold text-[#FAF7F2]">
                <span className="text-amber-400 text-sm">★</span>
                <span>{activeModel.rating}</span>
                <span className="text-[#E2DDD5]/60 font-normal font-mono">({activeModel.reviews} reviews)</span>
              </div>

              {/* GIA Authenticity Pill */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono font-bold text-[#FAF7F2] bg-stone-950/95 px-4 py-1.5 rounded-full border border-amber-400/30 shadow-md backdrop-blur-md">
                  <span className={`h-2 w-2 rounded-full ${config.glow} animate-pulse`} />
                  <span>
                    {isEs
                      ? 'GIA VERIFIED // 100% NATURAL & CONFLICT-FREE'
                      : isPt
                        ? 'GIA VERIFIED // 100% NATURAL'
                        : 'GIA VERIFIED // 100% NATURAL & CONFLICT-FREE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Model Quick Switcher Dock (Visible directly under the piece on mobile < lg) */}
            <div className="flex lg:hidden justify-center mt-8 mb-1 z-30 px-2 w-full">
              <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-stone-950 text-white backdrop-blur-xl border border-amber-400/30 shadow-xl max-w-full overflow-x-auto">
                {models.map((model, idx) => {
                  const isActive = selectedModelIndex === idx;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleSelectModel(idx)}
                      className={`relative px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-secondary font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        isActive ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-[#E2DDD5]/70 hover:text-white'
                      }`}
                    >
                      <div className="relative w-5 h-5 rounded-full overflow-hidden bg-black/50 shrink-0 border border-white/20">
                        <Image
                          src={model.thumb}
                          alt={model.name}
                          fill
                          sizes="20px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <span className="text-[11px] leading-none font-bold">
                        {model.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 3: PERFORMANCE GEMOLOGICAL TELEMETRY & SPECS PANEL (3 COLS) */}
          <div className="lg:col-span-3 flex flex-col justify-center order-3">
            <div className="bg-stone-950/85 rounded-3xl p-5 sm:p-6 border border-amber-400/25 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-secondary font-bold uppercase tracking-wider text-amber-100">
                    {isEs ? 'Telemetría Gemológica' : isPt ? 'Telemetria Gemológica' : 'Gemological Telemetry'}
                  </span>
                </div>

                {/* Re-scan button trigger */}
                <button
                  type="button"
                  onClick={triggerLaserScan}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-1 rounded-full transition-colors cursor-pointer"
                  title={isEs ? 'Re-escanear gemología' : isPt ? 'Re-escanear gema' : 'Rescan gemology'}
                >
                  <Scan className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>
                    {isScanning
                      ? (isEs ? 'Graduando...' : isPt ? 'Avaliando...' : 'Grading...')
                      : (isEs ? 'Escanear' : isPt ? 'Escanear' : 'Scan')}
                  </span>
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
                        isHovered ? 'bg-white/10 scale-[1.02]' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#FAF7F2]">
                          <Icon className={`w-3.5 h-3.5 transition-transform ${isHovered ? 'text-amber-300 scale-125' : 'text-amber-400'}`} />
                          <span className="truncate max-w-[170px]">{metric.label}</span>
                        </div>
                        <span className="font-mono font-black text-amber-300 text-xs">
                          <AnimatedCounter value={metric.value} duration={800} />
                        </span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-400 relative overflow-hidden"
                        >
                          {/* Shimmer sweep animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#E2DDD5]/60 mt-1">
                        <span>{metric.detail}</span>
                        {isHovered && (
                          <span className="text-amber-300 font-bold animate-in fade-in duration-150">
                            {isEs ? 'Certificado ↗' : isPt ? 'Certificado ↗' : 'Inspect ↗'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tech Spec Footer Note */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E2DDD5]/80">
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  {isEs ? 'Certificado GIA Físico & QR' : isPt ? 'Laudo Pericial GIA' : 'Official GIA Cert'}
                </span>
                <span className="font-mono text-[10px] text-[#E2DDD5]/60">
                  ID: #JM-{activeModel.id.toUpperCase()}-BOG
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING JEWELRY ISLAND SWITCHER (Desktop dock style) */}
      <div className="hidden lg:flex absolute bottom-4 sm:bottom-6 inset-x-0 justify-center z-30 pointer-events-none px-4">
        <motion.div
          layout
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-stone-950/95 text-[#FAF7F2] backdrop-blur-xl border border-amber-400/30 shadow-2xl ring-1 ring-black/40"
        >
          {models.map((model, idx) => {
            const isActive = selectedModelIndex === idx;
            return (
              <motion.button
                key={model.id}
                type="button"
                onClick={() => handleSelectModel(idx)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 sm:gap-3 text-xs font-secondary font-bold uppercase tracking-wider transition-all focus:outline-hidden cursor-pointer ${
                  isActive ? 'text-stone-950 font-black' : 'text-[#E2DDD5]/70 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-jewelry-island"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 shadow-md"
                    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  />
                )}

                {/* Thumbnail */}
                <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-black/50 shrink-0 border border-white/20">
                  <Image
                    src={model.thumb}
                    alt={model.name}
                    fill
                    sizes="28px"
                    className="object-contain p-0.5"
                  />
                </div>

                <div className="relative z-10 flex flex-col items-start text-left leading-none">
                  <span className="text-[11px] sm:text-xs">
                    {model.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-stone-950/80 font-bold' : 'text-amber-300/80'}`}>
                    {model.priceCop}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Ring Size Conversion Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-stone-950 border border-amber-400/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-300">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading text-lg font-bold">
                  {isEs ? 'Tabla de Tallas de Anillo' : isPt ? 'Tabela de Medidas de Anel' : 'Ring Size Conversion Chart'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#E2DDD5]/80 leading-relaxed font-normal">
              {isEs
                ? 'Para medir tu dedo en casa: pasa un hilo alrededor del nudillo más ancho, marca el cruce y mide los milímetros en una regla (Circunferencia).'
                : isPt
                  ? 'Para medir seu dedo em casa: passe uma linha em volta do dedo, marque o ponto de encontro e meça em milímetros (Circunferência).'
                  : 'To measure your finger at home: wrap a string around your knuckle, mark the overlap and measure the millimeters against a ruler (Circumference).'}
            </p>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-white/5 text-[#E2DDD5]/70 border-b border-white/10">
                  <tr>
                    <th className="p-2.5">US</th>
                    <th className="p-2.5">{isEs ? 'Col / Latam' : isPt ? 'Aro BR' : 'UK / EU'}</th>
                    <th className="p-2.5">Circunferencia (mm)</th>
                    <th className="p-2.5">Diámetro (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/90">
                  {ringConversionData.map((row) => (
                    <tr
                      key={row.us}
                      onClick={() => {
                        setSelectedSize(row.us);
                        setShowSizeModal(false);
                      }}
                      className="hover:bg-amber-400/10 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-bold text-amber-300">{row.us}</td>
                      <td className="p-2.5">{row.col}</td>
                      <td className="p-2.5">{row.mmCirc} mm</td>
                      <td className="p-2.5">{row.mmDiam} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 font-secondary font-bold text-xs uppercase tracking-wider hover:from-amber-300 hover:to-amber-200 transition-colors cursor-pointer"
              >
                {isEs ? 'Entendido y Cerrar' : isPt ? 'Entendido e Fechar' : 'Got it, Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bespoke Jewelry MiniCart Drawer */}
      <JewelryMiniCart
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        model={activeModel}
        metal={selectedMetal}
        size={selectedSize}
        lang={lang}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-amber-400 text-stone-950 font-secondary font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
