"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import {
  Download,
  Heart,
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Search,
  Maximize2,
  Columns,
  Grid,
} from "lucide-react"
import {
  ALL_BOCETOS_CARDS,
  COLLECTIONS_CONFIG,
  type ArtworkCard,
  type CollectionKey,
} from "@/lib/artworks-data"
import PolaroidLineCarousel, { type Slide } from "@/components/ui/polaroid-line-carousel"

export type ViewMode = "string" | "grid"

export default function PolaroidArtGallery({
  initialCards,
}: {
  initialCards?: ArtworkCard[]
}) {
  const allCards = useMemo(() => {
    return initialCards && initialCards.length > 0 ? initialCards : ALL_BOCETOS_CARDS
  }, [initialCards])

  const [activeCollection, setActiveCollection] = useState<CollectionKey>("all")
  const [selectedCard, setSelectedCard] = useState<ArtworkCard | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("string")
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [mounted, setMounted] = useState(false)

  // Load favorites from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("amart_favorites")
      if (saved) setFavorites(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem("amart_favorites", JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }, [])

  const collectionCounts = useMemo(() => {
    const counts: Record<CollectionKey, number> = {
      all: allCards.length,
      yoga: 0,
      shibari: 0,
      "anatomia-botanica": 0,
      pregnant: 0,
      "figura-humana": 0,
      favorites: favorites.size,
    }
    allCards.forEach((c) => {
      if (counts[c.collection] !== undefined) {
        counts[c.collection]++
      }
    })
    return counts
  }, [allCards, favorites])

  // Filter cards by collection
  const filteredCards = useMemo(() => {
    let list = allCards
    if (activeCollection === "favorites") {
      const favs = allCards.filter((c) => favorites.has(c.id))
      list = favs.length > 0 ? favs : allCards
    } else if (activeCollection !== "all") {
      list = allCards.filter((c) => c.collection === activeCollection)
    }

    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        c.collectionLabel.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.technique && c.technique.toLowerCase().includes(q)) ||
        (c.alt && c.alt.toLowerCase().includes(q))
    )
  }, [allCards, activeCollection, favorites, search])

  // Convert cards to Polaroid slides
  const slides: Slide[] = useMemo(() => {
    return filteredCards.map((c) => ({
      id: c.id,
      image: c.imageUrl,
      downloadUrl: c.downloadUrl,
      title: c.title,
      caption: c.description || c.technique || `Serie ${c.collectionLabel}`,
      technique: c.technique,
      collection: c.collection,
      collectionLabel: c.collectionLabel,
      alt: c.alt,
    }))
  }, [filteredCards])

  // Navigation inside modal
  const goToNextCard = useCallback(() => {
    if (!selectedCard) return
    const currentIndex = filteredCards.findIndex((c) => c.id === selectedCard.id)
    if (currentIndex === -1) return
    const nextIndex = (currentIndex + 1) % filteredCards.length
    setSelectedCard(filteredCards[nextIndex])
  }, [filteredCards, selectedCard])

  const goToPrevCard = useCallback(() => {
    if (!selectedCard) return
    const currentIndex = filteredCards.findIndex((c) => c.id === selectedCard.id)
    if (currentIndex === -1) return
    const prevIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length
    setSelectedCard(filteredCards[prevIndex])
  }, [filteredCards, selectedCard])

  const collectionList: Array<{ id: CollectionKey; label: string }> = [
    { id: "all", label: `Todas (${collectionCounts.all})` },
    { id: "yoga", label: `Yoga (${collectionCounts.yoga})` },
    { id: "shibari", label: `Shibari (${collectionCounts.shibari})` },
    { id: "anatomia-botanica", label: `Anatomía Botánica (${collectionCounts["anatomia-botanica"]})` },
    { id: "pregnant", label: `Pregnant (${collectionCounts.pregnant})` },
    { id: "figura-humana", label: `Figura Humana (${collectionCounts["figura-humana"]})` },
  ]

  if (!mounted) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] bg-[#0c0a08] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#f96e03] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#f96e03]/90">
            Cargando Bocetos de Piel...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] relative overflow-hidden bg-[#0c0a08] flex flex-col select-none text-white font-sans overscroll-none">
      {/* Background Studio Ambient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #1a1510 0%, #0c0a08 65%, #050403 100%)",
        }}
      />

      {/* Top Header & Navigation */}
      <header className="relative z-30 px-3 sm:px-6 pt-3 sm:pt-4 pb-2 bg-gradient-to-b from-[#0c0a08] via-[#0c0a08]/90 to-transparent shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Collection Title */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#f96e03] shadow-[0_0_8px_#f96e03] animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#f96e03] font-semibold">
                Andrés Morales • Taller de Arte
              </p>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight leading-tight">
              Bocetos de Piel
            </h1>
          </div>

          {/* View Switcher & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("string")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "string"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
                title="Modo Cuerda de Taller (Experiencia física)"
              >
                <span>🧵</span>
                <span className="hidden sm:inline">Cuerda</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
                title="Modo Cuadrícula / Muro (Exploración rápida)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Muro ({filteredCards.length})</span>
              </button>
            </div>

            {/* Portfolio Link */}
            <a
              href="https://andresmorales.com.co"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white/85 hover:text-white border border-white/15 backdrop-blur-md transition-all"
            >
              <span>Portafolio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Inquire CTA */}
            <a
              href="https://wa.me/573161482507?text=Hola%20Andr%C3%A9s,%20vi%20tu%20galer%C3%ADa%20Bocetos%20de%20Piel%20en%20amart%20y%20me%20gustar%C3%ADa%20cotizar%20una%20obra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_4px_16px_rgba(249,110,3,0.35)] transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Encargar Obra</span>
              <span className="sm:hidden">Cotizar</span>
            </a>
          </div>
        </div>

        {/* Collection Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-1 sm:flex-wrap">
          {collectionList.map((col) => {
            const isActive = activeCollection === col.id
            return (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-[0_0_12px_rgba(249,110,3,0.45)]"
                    : "bg-white/10 hover:bg-white/15 text-white/80 border border-white/10"
                }`}
              >
                {col.label}
              </button>
            )
          })}
          {favorites.size > 0 && (
            <button
              onClick={() => setActiveCollection("favorites")}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeCollection === "favorites"
                  ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-[0_0_12px_rgba(249,110,3,0.45)]"
                  : "bg-white/10 hover:bg-white/15 text-white/80 border border-white/10"
              }`}
            >
              <Heart className="w-3 h-3 fill-current text-[#f96e03]" />
              <span>Favoritos ({favorites.size})</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 min-h-0 w-full overflow-hidden z-10 flex flex-col">
        {viewMode === "string" ? (
          /* ======================================================== */
          /* MODE A: POLAROID SAGGING STRING CAROUSEL (PHYSICS)       */
          /* ======================================================== */
          <div className="relative w-full h-full flex-1 min-h-0">
            <PolaroidLineCarousel
              slides={slides}
              height="100%"
              cardWidth={270}
              sag={46}
              swing={1.1}
              string="#9e856e"
              background="transparent"
              ink="#f5eee6"
              onSelect={(slide) => {
                const found = allCards.find((c) => c.id === slide.id)
                if (found) setSelectedCard(found)
              }}
            />
          </div>
        ) : (
          /* ======================================================== */
          /* MODE B: WALL / GRID VIEW (RAPID SCAN & SEARCH)           */
          /* ======================================================== */
          <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-4 scrollbar-thin scrollbar-thumb-white/20">
            {/* Search Input Bar */}
            <div className="max-w-xl mx-auto mb-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, título o descripción (ej. 108, shibari, asana, loto)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-[#f96e03] focus:ring-1 focus:ring-[#f96e03]/40 transition-colors shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto pb-12">
              {filteredCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="group relative rounded-xl overflow-hidden bg-[#14110e] border border-white/10 hover:border-[#f96e03] transition-all duration-300 text-left cursor-pointer shadow-lg hover:shadow-[0_12px_28px_rgba(249,110,3,0.25)] hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/60">
                    <img
                      src={card.imageUrl}
                      alt={card.alt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/15 text-[9px] font-mono text-[#f96e03] font-bold">
                      {card.collectionLabel}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-[#f96e03]" />
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#181410]">
                    <p className="text-xs font-medium text-white truncate group-hover:text-[#f96e03] transition-colors">
                      <span className="text-[#f96e03] font-mono mr-1.5 font-bold">
                        #{card.id}
                      </span>
                      {card.title}
                    </p>
                    {card.description && (
                      <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5 font-sans leading-tight">
                        {card.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-16 text-white/40">
                <p className="text-sm">No se encontraron bocetos con esa búsqueda.</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-mono text-[#f96e03] hover:underline cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* STATIC FULLSCREEN EXHIBITION LIGHTBOX                     */}
      {/* ======================================================== */}
      {selectedCard && (
        <StaticExhibitionModal
          selectedCard={selectedCard}
          isFav={favorites.has(selectedCard.id)}
          onClose={() => setSelectedCard(null)}
          onToggleFav={() => toggleFavorite(selectedCard.id)}
          onNext={goToNextCard}
          onPrev={goToPrevCard}
        />
      )}
    </div>
  )
}

/* =========================
   Static Fullscreen Lightbox
   ========================= */

function StaticExhibitionModal({
  selectedCard,
  isFav,
  onClose,
  onToggleFav,
  onNext,
  onPrev,
}: {
  selectedCard: ArtworkCard
  isFav: boolean
  onClose: () => void
  onToggleFav: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, onNext, onPrev])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX > 0) onPrev()
      else onNext()
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const fileUrl = selectedCard.downloadUrl || selectedCard.imageUrl
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = `${selectedCard.title.toLowerCase().replace(/[\s\W]+/g, "-")}.jpg`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl transition-opacity duration-200 select-none text-white font-sans"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-[#f96e03] px-2 sm:px-2.5 py-0.5 rounded-full bg-[#f96e03]/10 border border-[#f96e03]/30 font-bold truncate max-w-[140px] sm:max-w-none">
            Serie {selectedCard.collectionLabel}
          </span>
          <span className="text-white/40 font-mono text-xs hidden sm:inline">
            Obra #{selectedCard.id} de 149
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Favorite */}
          <button
            type="button"
            onClick={onToggleFav}
            aria-label="Guardar en favoritos"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Heart
              className="h-4 w-4 text-[#f96e03]"
              strokeWidth={2.2}
              fill={isFav ? "#f96e03" : "none"}
            />
            <span className="hidden md:inline">{isFav ? "Favorito" : "Guardar"}</span>
          </button>

          {/* Download Original HD */}
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Descargar original"
            className="p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-mono text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#f96e03]" strokeWidth={2.2} />
            <span className="hidden sm:inline">Descargar HD</span>
          </button>

          {/* WhatsApp Inquire */}
          <a
            href={`https://wa.me/573161482507?text=${encodeURIComponent(
              `Hola Andrés, vi tu obra "${selectedCard.title}" (Dibujo #${selectedCard.id}, Serie ${selectedCard.collectionLabel}) en amart y me gustaría consultar su adquisición o detalles.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_2px_12px_rgba(249,110,3,0.35)] transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Consultar Obra</span>
            <span className="sm:hidden">Cotizar</span>
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Cerrar (Esc)"
            className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5 sm:ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Stage: Completely Static Artwork with Swipe */}
      <main
        className="flex-1 flex items-center justify-center relative p-2 sm:p-6 md:p-8 overflow-hidden touch-pan-y"
        onClick={handleBackdropClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label="Obra anterior (Flecha Izquierda)"
          className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full bg-black/60 hover:bg-[#f96e03] text-white/80 hover:text-[#1E1810] border border-white/15 transition-all z-20 cursor-pointer shadow-2xl backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label="Siguiente obra (Flecha Derecha)"
          className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full bg-black/60 hover:bg-[#f96e03] text-white/80 hover:text-[#1E1810] border border-white/15 transition-all z-20 cursor-pointer shadow-2xl backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        {/* 100% Static High-Resolution Artwork */}
        <div
          className="relative max-h-full max-w-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={selectedCard.id}
            src={selectedCard.downloadUrl || selectedCard.imageUrl}
            alt={selectedCard.alt}
            loading="eager"
            draggable={false}
            className="max-h-[calc(100dvh-170px)] sm:max-h-[calc(100dvh-185px)] max-w-[94vw] sm:max-w-[85vw] w-auto h-auto object-contain rounded shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/10 select-none animate-in fade-in duration-200"
          />
        </div>
      </main>

      {/* Bottom Curatorial Caption */}
      <footer
        className="px-4 py-2.5 sm:py-3.5 border-t border-white/10 bg-black/70 backdrop-blur-md z-30 shrink-0 text-center pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
          <h2 className="text-white text-base sm:text-xl font-serif font-medium tracking-tight">
            <span className="text-[#f96e03] font-mono mr-2 text-sm sm:text-base font-bold">
              #{selectedCard.id}
            </span>
            {selectedCard.title}
          </h2>

          {selectedCard.description && (
            <p className="text-white/80 text-xs sm:text-sm font-sans leading-relaxed mt-1 max-w-2xl mx-auto">
              {selectedCard.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-1 text-[11px] font-mono text-white/45">
            {selectedCard.technique && <span>{selectedCard.technique}</span>}
            <span>•</span>
            <span>Andrés Morales • Bocetos de Piel</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
