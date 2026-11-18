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
  Search,
  Maximize2,
  Grid,
  Shuffle,
  MessageSquare,
  Share2,
  Settings,
} from "lucide-react"
import {
  ALL_BOCETOS_CARDS,
  COLLECTIONS_CONFIG,
  type ArtworkCard,
  type CollectionKey,
} from "@/lib/artworks-data"
import PolaroidLineCarousel, { type Slide } from "@/components/ui/polaroid-line-carousel"
import ArtNotesModal from "@/components/ui/art-notes-modal"
import { LazyParticles } from "@/components/lazy-particles"
import type { ArtNote } from "@/lib/art-notes"
import type { ReactionType, ReactionsMap, ArtworkReactions } from "@/lib/art-reactions"

export type ViewMode = "string" | "grid"

/** Fisher-Yates shuffle for true random distribution */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export interface GallerySettingsProps {
  title?: string
  subtitle?: string
  tagline?: string
  description?: string
  artist?: string
  instagram?: string
}

const I18N_DICT = {
  es: {
    loading: "Cargando",
    stringMode: "Cuerda",
    gridMode: "Muro",
    shuffle: "Aleatorio",
    notes: "Notas",
    portfolio: "Portafolio",
    exit: "Salir",
    admin: "Admin",
    inquire: "Encargar Obra",
    inquireShort: "Cotizar",
    all: "Todas",
    favorites: "Favoritos",
    searchPlaceholder: "Buscar por número, título o descripción (ej. 108, shibari, asana, loto)...",
    noResults: "No se encontraron bocetos con esa búsqueda.",
    clearSearch: "Limpiar búsqueda",
    heartLabel: "Conmovedor",
    sparklesLabel: "Brillante",
    leafLabel: "Orgánico",
    fireLabel: "Fuerza",
    close: "Cerrar",
    download: "Descargar HD",
    share: "Compartir",
    copylink: "Enlace copiado al portapapeles",
    framedWall: "En Pared",
    seeFramed: "Ver en Pared",
    realScale: "Escala Real 1:1",
    frameFormat: "Formato 30 × 40 cm",
    frameLabel: "Marco:",
    darkWood: "Madera Ébano",
    naturalWood: "Nogal / Roble",
  },
  en: {
    loading: "Loading",
    stringMode: "Hanging Line",
    gridMode: "Wall",
    shuffle: "Shuffle",
    notes: "Notes",
    portfolio: "Portfolio",
    exit: "Exit",
    admin: "Admin",
    inquire: "Commission Artwork",
    inquireShort: "Inquire",
    all: "All",
    favorites: "Favorites",
    searchPlaceholder: "Search by number, title or medium (e.g. 108, shibari, asana, lotus)...",
    noResults: "No sketches found matching that search.",
    clearSearch: "Clear search",
    heartLabel: "Moving",
    sparklesLabel: "Brilliant",
    leafLabel: "Organic",
    fireLabel: "Power",
    close: "Close",
    download: "Download HD",
    share: "Share",
    copylink: "Link copied to clipboard",
    framedWall: "On Wall",
    seeFramed: "View on Wall",
    realScale: "Real Scale 1:1",
    frameFormat: "30 × 40 cm Format",
    frameLabel: "Frame:",
    darkWood: "Ebony Wood",
    naturalWood: "Walnut / Oak",
  },
  pt: {
    loading: "Carregando",
    stringMode: "Corda",
    gridMode: "Mural",
    shuffle: "Aleatório",
    notes: "Notas",
    portfolio: "Portfólio",
    exit: "Sair",
    admin: "Admin",
    inquire: "Encomendar Obra",
    inquireShort: "Cotar",
    all: "Todas",
    favorites: "Favoritos",
    searchPlaceholder: "Buscar por número, título ou descrição (ex. 108, shibari, asana, lótus)...",
    noResults: "Nenhum esboço encontrado para essa busca.",
    clearSearch: "Limpar busca",
    heartLabel: "Comovente",
    sparklesLabel: "Brilhante",
    leafLabel: "Orgânico",
    fireLabel: "Força",
    close: "Fechar",
    download: "Baixar HD",
    share: "Compartilhar",
    copylink: "Link copiado para a área de transferência",
    framedWall: "Na Parede",
    seeFramed: "Ver na Parede",
    realScale: "Escala Real 1:1",
    frameFormat: "Formato 30 × 40 cm",
    frameLabel: "Moldura:",
    darkWood: "Madeira Ébano",
    naturalWood: "Nogueira / Carvalho",
  },
}

export default function PolaroidArtGallery({
  initialCards,
  initialSettings,
  lang = "es",
}: {
  initialCards?: ArtworkCard[]
  initialSettings?: GallerySettingsProps
  lang?: string
}) {
  const dict = I18N_DICT[lang as keyof typeof I18N_DICT] || I18N_DICT.es

  const galleryTitle = initialSettings?.title || "Bocetos de Piel"
  const gallerySubtitle = initialSettings?.subtitle || "Andrés Morales • Taller de Arte"
  const baseCards = useMemo(() => {
    return initialCards && initialCards.length > 0 ? initialCards : ALL_BOCETOS_CARDS
  }, [initialCards])

  const [cards, setCards] = useState<ArtworkCard[]>(baseCards)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [activeCollection, setActiveCollection] = useState<CollectionKey>("all")
  const [selectedCard, setSelectedCard] = useState<ArtworkCard | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("string")
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [mounted, setMounted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Visitor Art Notes
  const [notes, setNotes] = useState<ArtNote[]>([])
  const [notesCounts, setNotesCounts] = useState<Record<string, number>>({})
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [notesModalCard, setNotesModalCard] = useState<ArtworkCard | null>(null)

  // Quick Emoji Reactions
  const [reactions, setReactions] = useState<ReactionsMap>({})

  // Shuffle artworks on entry and load favorites, notes, reactions, and check deep-link
  useEffect(() => {
    const base = initialCards && initialCards.length > 0 ? initialCards : ALL_BOCETOS_CARDS
    const shuffled = shuffleArray(base)
    setCards(shuffled)
    setMounted(true)
    try {
      const saved = localStorage.getItem("amart_favorites")
      if (saved) setFavorites(new Set(JSON.parse(saved)))
    } catch {}

    // Deep link detection: check ?obra=56, ?boceto=56, or ?id=56
    try {
      const params = new URLSearchParams(window.location.search)
      const obraParam = params.get("obra") || params.get("boceto") || params.get("id")
      if (obraParam) {
        const clean = obraParam.trim()
        const target = base.find(
          (c) => c.id === clean || parseInt(c.id, 10) === parseInt(clean, 10)
        )
        if (target) {
          setSelectedCard(target)
        }
      }
    } catch {}

    // Fetch notes from server
    fetch("/api/art-notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notes)) {
          setNotes(data.notes)
          const counts: Record<string, number> = {}
          data.notes.forEach((n: ArtNote) => {
            if (n.artworkId) {
              counts[n.artworkId] = (counts[n.artworkId] || 0) + 1
            }
          })
          setNotesCounts(counts)
        }
      })
      .catch(() => {})

    // Fetch reactions from server
    fetch("/api/art-reactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reactions) {
          setReactions(data.reactions)
        }
      })
      .catch(() => {})
  }, [initialCards])

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        localStorage.setItem("amart_favorites", JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }, [])

  // Add Emoji reaction
  const handleAddReaction = useCallback(
    async (artworkId: string, type: ReactionType) => {
      setReactions((prev) => {
        const current = prev[artworkId] || { heart: 0, sparkles: 0, leaf: 0, fire: 0 }
        return {
          ...prev,
          [artworkId]: {
            ...current,
            [type]: (current[type] || 0) + 1,
          },
        }
      })

      try {
        await fetch("/api/art-reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artworkId, type }),
        })
      } catch {}
    },
    []
  )

  // Handle open notes modal
  const handleOpenNotes = useCallback((card: ArtworkCard | null) => {
    setNotesModalCard(card)
    setIsNotesModalOpen(true)
  }, [])

  // Handle new note created
  const handleNoteAdded = useCallback((newNote: ArtNote) => {
    setNotes((prev) => [newNote, ...prev])
    if (newNote.artworkId) {
      setNotesCounts((prev) => ({
        ...prev,
        [newNote.artworkId!]: (prev[newNote.artworkId!] || 0) + 1,
      }))
    }
  }, [])

  // Share artwork link
  const handleShareArtwork = useCallback(
    async (card: ArtworkCard) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://amart.andresmorales.com.co"
      const shareUrl = `${origin}?obra=${card.id}`
      const shareTitle = `${card.title} • ${galleryTitle}`
      const shareText = `Mira este dibujo original de Andrés Morales (#${card.id} - ${card.title})`

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          })
          return
        } catch {}
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl)
          showToast(dict.copylink)
        } catch {
          showToast(shareUrl)
        }
      }
    },
    [galleryTitle, showToast, dict.copylink]
  )

  // Filter cards by collection and search query
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (activeCollection === "favorites") {
        if (!favorites.has(card.id)) return false
      } else if (activeCollection !== "all" && card.collection !== activeCollection) {
        return false
      }

      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = card.title.toLowerCase().includes(q)
        const matchDesc = card.description?.toLowerCase().includes(q)
        const matchId = card.id === q.replace("#", "").trim()
        const matchCollection = card.collectionLabel?.toLowerCase().includes(q)
        return matchTitle || matchDesc || matchId || matchCollection
      }

      return true
    })
  }, [cards, activeCollection, search, favorites])

  // Count items per collection for badge indicators
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length }
    cards.forEach((c) => {
      counts[c.collection] = (counts[c.collection] || 0) + 1
    })
    return counts
  }, [cards])

  // Re-shuffle cards
  const reshuffleCards = useCallback(() => {
    setCards((prev) => shuffleArray(prev))
    setShuffleKey((k) => k + 1)
  }, [])

  // Build slides for PolaroidLineCarousel
  const slides: Slide[] = useMemo(() => {
    return filteredCards.map((card) => ({
      id: card.id,
      image: card.imageUrl,
      downloadUrl: card.downloadUrl,
      title: card.title,
      caption: card.description || `${card.title} • #${card.id}`,
      technique: card.technique,
      collection: card.collection,
      collectionLabel: card.collectionLabel,
      alt: card.alt,
    }))
  }, [filteredCards])

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
    { id: "all", label: `${dict.all} (${collectionCounts.all})` },
    { id: "yoga", label: `Yoga (${collectionCounts.yoga})` },
    { id: "shibari", label: `Shibari (${collectionCounts.shibari})` },
    { id: "anatomia-botanica", label: `Anatomía Botánica (${collectionCounts["anatomia-botanica"]})` },
    { id: "pregnant", label: `Pregnant (${collectionCounts.pregnant})` },
    { id: "figura-humana", label: `Figura Humana (${collectionCounts["figura-humana"]})` },
  ]

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] relative overflow-hidden bg-[#F8F5F4] flex flex-col select-none text-[#1E1810] font-sans overscroll-none">
      {/* Background Studio Ambient — Warm gallery cream matching andresmorales.com.co */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #FAF7F5 55%, #F0ECE8 100%)",
        }}
      />

      {/* Dynamic Orange Particles from andresmorales.com.co Hero */}
      <LazyParticles id="amart-hero-particles" variant="cream" />

      {/* Top Header & Navigation */}
      <header className="relative z-30 px-3 sm:px-6 pt-3 sm:pt-4 pb-2 bg-gradient-to-b from-[#F8F5F4] via-[#F8F5F4]/90 to-transparent shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Brand & Collection Title */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#f96e03] shadow-[0_0_8px_#f96e03] animate-pulse" />
                <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#f96e03] font-bold">
                  {gallerySubtitle}
                </p>
              </div>
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#1E1810] tracking-tight leading-tight">
                {galleryTitle}
              </h1>
            </div>

            {/* Mobile-only visible Admin button */}
            <a
              href="https://andresmorales.com.co/es/admin/art"
              aria-label="Panel de Administración"
              title="Panel de Administración: Subir fotos y editar galería"
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#1E1810] text-white hover:bg-[#f96e03] hover:text-[#1E1810] shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#f96e03]" />
              <span>Admin</span>
            </a>
          </div>

          {/* View Switcher & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-full bg-white/90 border border-stone-200/90 shadow-sm backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("string")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "string"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-sm"
                    : "text-[#575250] hover:text-[#1E1810]"
                }`}
                title="Modo Cuerda de Taller (Experiencia física)"
              >
                <span>🧵</span>
                <span className="hidden sm:inline">{dict.stringMode}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-sm"
                    : "text-[#575250] hover:text-[#1E1810]"
                }`}
                title="Modo Cuadrícula / Muro (Exploración rápida)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{dict.gridMode} ({filteredCards.length})</span>
              </button>
            </div>

            {/* Re-shuffle / Aleatorio Button */}
            <button
              type="button"
              onClick={reshuffleCards}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/90 hover:bg-white text-[#1E1810] border border-stone-200/90 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Barajar aleatoriamente la colección"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#f96e03]" />
              <span className="hidden sm:inline">{dict.shuffle}</span>
            </button>

            {/* Guestbook / Notes Button */}
            <button
              type="button"
              onClick={() => handleOpenNotes(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/90 hover:bg-white text-[#1E1810] border border-stone-200/90 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Libro de Visitas: ver y dejar notas"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#f96e03]" />
              <span className="hidden sm:inline">{dict.notes}</span>
              {notes.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#f96e03] text-[#1E1810] text-[9px] font-bold rounded-full font-mono">
                  {notes.length}
                </span>
              )}
            </button>

            {/* Portfolio Link / Exit Gallery */}
            <a
              href="https://andresmorales.com.co"
              aria-label="Volver al portafolio principal de Andrés Morales"
              title="Volver al portafolio"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/90 hover:bg-white text-[#1E1810] border border-stone-200/90 backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <X className="w-3.5 h-3.5 text-[#f96e03] sm:hidden" />
              <span className="hidden sm:inline">{dict.portfolio}</span>
              <span className="sm:hidden font-medium">{dict.exit}</span>
              <ExternalLink className="w-3 h-3 hidden sm:inline" />
            </a>

            {/* Admin Management Button (desktop) */}
            <a
              href="https://andresmorales.com.co/es/admin/art"
              aria-label="Panel de Administración (Subir obras y editar textos)"
              title="Panel de Administración: Subir fotos, editar títulos y gestionar obras"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#1E1810] hover:bg-[#f96e03] text-white hover:text-[#1E1810] border border-[#1E1810] backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105"
            >
              <Settings className="w-3.5 h-3.5 text-[#f96e03]" />
              <span>{dict.admin}</span>
            </a>

            {/* Inquire CTA */}
            <a
              href="https://wa.me/573161482507?text=Hola%20Andr%C3%A9s,%20vi%20tu%20galer%C3%ADa%20Bocetos%20de%20Piel%20en%20amart%20y%20me%20gustar%C3%ADa%20cotizar%20una%20obra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_2px_12px_rgba(249,110,3,0.35)] transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{dict.inquire}</span>
              <span className="sm:hidden">{dict.inquireShort}</span>
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
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-[0_2px_10px_rgba(249,110,3,0.35)] border border-[#f96e03]"
                    : "bg-white/90 hover:bg-white text-[#575250] hover:text-[#1E1810] border border-stone-200/90 shadow-sm"
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
                  ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-[0_2px_10px_rgba(249,110,3,0.35)]"
                  : "bg-white/90 hover:bg-white text-[#575250] border border-stone-200/90 shadow-sm"
              }`}
            >
              <Heart className="w-3 h-3 fill-current text-[#f96e03]" />
              <span>{dict.favorites} ({favorites.size})</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 min-h-0 w-full overflow-hidden z-10 flex flex-col">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center text-[#1E1810]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-2 border-[#f96e03] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase font-mono tracking-widest text-[#f96e03] font-bold">
                {dict.loading} {galleryTitle}...
              </p>
            </div>
          </div>
        ) : viewMode === "string" ? (
          /* ======================================================== */
          /* MODE A: POLAROID SAGGING STRING CAROUSEL (PHYSICS)       */
          /* ======================================================== */
          <div className="relative w-full h-full flex-1 min-h-0">
            <PolaroidLineCarousel
              key={shuffleKey}
              slides={slides}
              height="100%"
              cardWidth={400}
              sag={44}
              swing={1.05}
              string="#b89670"
              background="transparent"
              ink="#1E1810"
              theme="light"
              onSelect={(slide) => {
                const found = cards.find((c) => c.id === slide.id)
                if (found) setSelectedCard(found)
              }}
              onOpenNotes={(slide) => {
                const found = cards.find((c) => c.id === slide.id)
                handleOpenNotes(found || null)
              }}
              onShare={(slide) => {
                const found = cards.find((c) => c.id === slide.id)
                if (found) handleShareArtwork(found)
              }}
              notesCounts={notesCounts}
            />
          </div>
        ) : (
          /* ======================================================== */
          /* MODE B: WALL / GRID VIEW (RAPID SCAN & SEARCH)           */
          /* ======================================================== */
          <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-4 scrollbar-thin scrollbar-thumb-stone-300">
            {/* Search Input Bar */}
            <div className="max-w-xl mx-auto mb-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dict.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-[#1E1810] text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#f96e03] focus:ring-1 focus:ring-[#f96e03]/40 transition-colors shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#1E1810]"
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
                  className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 hover:border-[#f96e03] transition-all duration-300 text-left cursor-pointer shadow-sm hover:shadow-[0_12px_28px_rgba(249,110,3,0.18)] hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
                    <img
                      src={card.imageUrl}
                      alt={card.alt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm border border-stone-200 text-[9px] font-mono text-[#f96e03] font-bold shadow-sm">
                      {card.collectionLabel}
                    </div>
                    <div className="absolute inset-0 bg-[#1E1810]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-xs font-semibold text-[#1E1810] truncate group-hover:text-[#f96e03] transition-colors">
                      <span className="text-[#f96e03] font-mono mr-1.5 font-bold">
                        #{card.id}
                      </span>
                      {card.title}
                    </p>
                    {card.description && (
                      <p className="text-[10px] text-[#575250] line-clamp-1 mt-0.5 font-sans leading-tight">
                        {card.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <p className="text-sm">{dict.noResults}</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-mono text-[#f96e03] hover:underline cursor-pointer font-bold"
                >
                  {dict.clearSearch}
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
          galleryTitle={galleryTitle}
          gallerySubtitle={gallerySubtitle}
          dict={dict}
          isFav={favorites.has(selectedCard.id)}
          onClose={() => setSelectedCard(null)}
          onToggleFav={() => toggleFavorite(selectedCard.id)}
          onNext={goToNextCard}
          onPrev={goToPrevCard}
          onOpenNotes={() => handleOpenNotes(selectedCard)}
          notesCount={notesCounts[selectedCard.id] || 0}
          onShare={handleShareArtwork}
          reactions={
            reactions[selectedCard.id] || { heart: 0, sparkles: 0, leaf: 0, fire: 0 }
          }
          onReact={(type) => handleAddReaction(selectedCard.id, type)}
        />
      )}

      {/* ======================================================== */}
      {/* ART NOTES & GUESTBOOK DRAWER MODAL                        */}
      {/* ======================================================== */}
      <ArtNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        activeCard={notesModalCard}
        allCards={cards}
        notes={notes}
        onNoteAdded={handleNoteAdded}
      />

      {/* Discreet Persistent Admin Floating Shortcut */}
      <a
        href="https://andresmorales.com.co/es/admin/art"
        aria-label="Panel Admin Arte"
        title="Acceso directo al panel de administración"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-[#f96e03] text-[#1E1810] border border-stone-300 shadow-[0_4px_20px_rgba(30,24,16,0.15)] backdrop-blur-md transition-all text-xs font-mono font-bold hover:scale-105 cursor-pointer"
      >
        <Settings className="w-3.5 h-3.5 text-[#f96e03]" />
        <span>Admin</span>
      </a>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#1E1810] text-[#f96e03] border border-[#f96e03]/60 shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-md text-xs sm:text-sm font-mono font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

/* =========================
   Static Fullscreen Lightbox (Light Museum Matting)
   ========================= */

function StaticExhibitionModal({
  selectedCard,
  galleryTitle,
  gallerySubtitle,
  dict,
  isFav,
  onClose,
  onToggleFav,
  onNext,
  onPrev,
  onOpenNotes,
  notesCount,
  onShare,
  reactions,
  onReact,
}: {
  selectedCard: ArtworkCard
  galleryTitle: string
  gallerySubtitle: string
  dict: typeof I18N_DICT.es
  isFav: boolean
  onClose: () => void
  onToggleFav: () => void
  onNext: () => void
  onPrev: () => void
  onOpenNotes: () => void
  notesCount: number
  onShare: (card: ArtworkCard) => void
  reactions: ArtworkReactions
  onReact: (type: ReactionType) => void
}) {
  const [isFramed, setIsFramed] = useState(false)
  const [frameStyle, setFrameStyle] = useState<"dark" | "wood">("dark")

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") onNext()
      else if (e.key === "ArrowLeft") onPrev()
      else if (e.key.toLowerCase() === "f") setIsFramed((f) => !f)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onNext, onPrev])

  // Mobile swipe gestures
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

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
    } else if (deltaY > 70 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      onClose()
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
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 select-none text-[#1E1810] font-sans ${
        isFramed
          ? "bg-[#FAF7F5]/98 backdrop-blur-2xl"
          : "bg-[#F8F5F4]/98 backdrop-blur-2xl"
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <header className="h-14 sm:h-16 px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-3 border-b border-stone-200/90 bg-white/90 backdrop-blur-md z-30 shrink-0 select-none">
        {/* Left: Artwork Series & Number Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-[#f96e03] px-2 sm:px-2.5 py-0.5 rounded-full bg-[#f96e03]/10 border border-[#f96e03]/30 font-bold truncate max-w-[105px] xs:max-w-[145px] sm:max-w-none shrink-0">
            Serie {selectedCard.collectionLabel}
          </span>
          <span className="text-[#575250] font-mono text-xs font-bold shrink-0">
            #{selectedCard.id}
            <span className="text-stone-400 font-normal hidden sm:inline"> de 149</span>
          </span>
        </div>

        {/* Right: Actions List + Pinned Close Button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0 justify-end">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 shrink">
            {/* Wall Simulator Frame Toggle */}
            <button
              type="button"
              onClick={() => setIsFramed((f) => !f)}
              aria-label={isFramed ? "Ver dibujo sin marco" : "Ver simulador en pared"}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border shrink-0 ${
                isFramed
                  ? "bg-[#f96e03] text-[#1E1810] border-[#f96e03] font-bold shadow-sm"
                  : "text-[#575250] hover:text-[#1E1810] bg-white border-stone-200"
              }`}
              title="Simular enmarcado de galería en escala real (30×40 cm)"
            >
              <span className="text-sm">🖼️</span>
              <span className="hidden md:inline">{isFramed ? dict.framedWall : dict.seeFramed}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={() => onShare(selectedCard)}
              aria-label="Compartir enlace directo"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono text-[#575250] hover:text-[#1E1810] bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Copiar enlace o compartir"
            >
              <Share2 className="h-4 w-4 text-[#f96e03]" />
              <span className="hidden md:inline">{dict.share}</span>
            </button>

            {/* Favorite */}
            <button
              type="button"
              onClick={onToggleFav}
              aria-label="Guardar en favoritos"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono text-[#575250] hover:text-[#1E1810] bg-white hover:bg-stone-50 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Guardar en favoritos"
            >
              <Heart
                className="h-4 w-4 text-[#f96e03]"
                strokeWidth={2.2}
                fill={isFav ? "#f96e03" : "none"}
              />
              <span className="hidden lg:inline">{isFav ? "Favorito" : "Guardar"}</span>
            </button>

            {/* Download Original HD */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Descargar original"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono text-[#575250] hover:text-[#1E1810] bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Descargar HD"
            >
              <Download className="h-4 w-4 text-[#f96e03]" strokeWidth={2.2} />
              <span className="hidden lg:inline">HD</span>
            </button>

            {/* Notes for this Artwork */}
            <button
              type="button"
              onClick={onOpenNotes}
              aria-label="Ver y dejar notas"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono text-[#575250] hover:text-[#1E1810] bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer group shrink-0"
              title="Libro de notas de visitantes"
            >
              <MessageSquare className="h-4 w-4 text-[#f96e03]" />
              <span className="hidden lg:inline">{dict.notes}</span>
              {notesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#f96e03] text-[#1E1810] text-[10px] font-bold rounded-full font-mono">
                  {notesCount}
                </span>
              )}
            </button>

            {/* WhatsApp Inquire */}
            <a
              href={`https://wa.me/573161482507?text=${encodeURIComponent(
                `Hola Andrés, vi tu obra "${selectedCard.title}" (Dibujo #${selectedCard.id}, Serie ${selectedCard.collectionLabel}) en amart y me gustaría consultar su adquisición o detalles.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_2px_12px_rgba(249,110,3,0.35)] transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{dict.inquire}</span>
              <span className="sm:hidden">{dict.inquireShort}</span>
            </a>
          </div>

          <div className="w-[1px] h-6 bg-stone-200 shrink-0 mx-0.5" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar (Esc)"
            title="Cerrar (Esc)"
            className="p-1.5 sm:p-2 rounded-full text-[#1E1810] bg-stone-100 hover:bg-[#f96e03] border border-stone-300 hover:border-[#f96e03] transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Stage */}
      <main
        className="flex-1 flex items-center justify-center relative p-2 sm:p-6 md:p-8 overflow-hidden touch-pan-y"
        onClick={handleBackdropClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Overhead Museum Gallery Spotlight when Framed */}
        {isFramed && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[700px] h-[380px] bg-[radial-gradient(ellipse_at_top,_rgba(249,110,3,0.08)_0%,_transparent_72%)] pointer-events-none" />
        )}

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label="Obra anterior (Flecha Izquierda)"
          className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full bg-white/90 hover:bg-[#f96e03] text-[#1E1810] border border-stone-300 transition-all z-20 cursor-pointer shadow-xl backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label="Siguiente obra (Flecha Derecha)"
          className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full bg-white/90 hover:bg-[#f96e03] text-[#1E1810] border border-stone-300 transition-all z-20 cursor-pointer shadow-xl backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        {/* Artwork Display Container */}
        {isFramed ? (
          /* ======================================================== */
          /* FRAMED GALLERY WALL SIMULATOR (1:1 MUSEUM PROPORTION)    */
          /* ======================================================== */
          <div
            className="relative max-h-full max-w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Outer Wood Frame */}
            <div
              className={`relative p-3 sm:p-5 rounded-[4px] transition-colors duration-200 ${
                frameStyle === "dark"
                  ? "bg-[#181512] border-2 border-[#2c2620] shadow-[0_25px_60px_rgba(0,0,0,0.35),_0_10px_20px_rgba(0,0,0,0.2)]"
                  : "bg-[#7c4f2e] border-2 border-[#54331b] shadow-[0_25px_60px_rgba(0,0,0,0.35),_0_10px_20px_rgba(0,0,0,0.2)]"
              }`}
            >
              {/* Archival Museum Matboard (Paspartú) */}
              <div className="p-3.5 sm:p-6 md:p-8 bg-[#f5f2eb] rounded-[2px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center relative">
                <img
                  key={selectedCard.id}
                  src={selectedCard.downloadUrl || selectedCard.imageUrl}
                  alt={selectedCard.alt}
                  loading="eager"
                  draggable={false}
                  className="max-h-[calc(100dvh-275px)] sm:max-h-[calc(100dvh-295px)] max-w-[76vw] sm:max-w-[62vw] w-auto h-auto object-contain shadow-[0_4px_12px_rgba(0,0,0,0.18)] select-none"
                />
              </div>
            </div>

            {/* Museum Wall Cartela Plaque */}
            <div className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-white/95 border border-stone-200 text-center backdrop-blur-md shadow-lg flex flex-col items-center max-w-sm">
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#f96e03] font-bold">
                <span>{dict.realScale}</span>
                <span>•</span>
                <span>{dict.frameFormat}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-stone-200 text-[10px] font-mono text-[#575250]">
                <span>{dict.frameLabel}</span>
                <button
                  type="button"
                  onClick={() => setFrameStyle("dark")}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    frameStyle === "dark"
                      ? "bg-[#1E1810] text-white"
                      : "text-stone-500 hover:text-[#1E1810]"
                  }`}
                >
                  {dict.darkWood}
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setFrameStyle("wood")}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    frameStyle === "wood"
                      ? "bg-[#7c4f2e] text-white"
                      : "text-stone-500 hover:text-[#1E1810]"
                  }`}
                >
                  {dict.naturalWood}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PURE STATIC HIGH-RESOLUTION ARTWORK VIEW                 */
          /* ======================================================== */
          <div
            className="relative max-h-full max-w-full flex items-center justify-center animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={selectedCard.id}
              src={selectedCard.downloadUrl || selectedCard.imageUrl}
              alt={selectedCard.alt}
              loading="eager"
              draggable={false}
              className="max-h-[calc(100dvh-185px)] sm:max-h-[calc(100dvh-200px)] max-w-[94vw] sm:max-w-[85vw] w-auto h-auto object-contain rounded-xl shadow-[0_20px_50px_rgba(30,24,16,0.18)] border border-stone-200 select-none bg-white p-2"
            />
          </div>
        )}
      </main>

      {/* Bottom Curatorial Caption & Reactions Bar */}
      <footer
        className="px-4 py-2 sm:py-3 border-t border-stone-200 bg-white/95 backdrop-blur-md z-30 shrink-0 text-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
          <h2 className="text-[#1E1810] text-base sm:text-lg font-serif font-bold tracking-tight">
            <span className="text-[#f96e03] font-mono mr-2 text-sm sm:text-base font-bold">
              #{selectedCard.id}
            </span>
            {selectedCard.title}
          </h2>

          {/* Interactive Emoji Reactions */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-1.5">
            {[
              { type: "heart" as const, emoji: "❤️", label: dict.heartLabel },
              { type: "sparkles" as const, emoji: "✨", label: dict.sparklesLabel },
              { type: "leaf" as const, emoji: "🌿", label: dict.leafLabel },
              { type: "fire" as const, emoji: "🔥", label: dict.fireLabel },
            ].map((item) => {
              const count = reactions[item.type] || 0
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onReact(item.type)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all text-xs font-mono border border-stone-200 cursor-pointer hover:border-[#f96e03] group shadow-sm"
                  title={item.label}
                >
                  <span className="text-sm transition-transform group-hover:scale-125 duration-150">
                    {item.emoji}
                  </span>
                  <span className="text-[11px] font-bold text-[#1E1810] font-mono">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedCard.description && (
            <p className="text-[#575250] text-xs sm:text-sm font-sans leading-relaxed max-w-xl mx-auto hidden sm:block">
              {selectedCard.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] sm:text-[11px] font-mono text-stone-400">
            {selectedCard.technique && <span>{selectedCard.technique}</span>}
            <span>•</span>
            <span>{gallerySubtitle} • {galleryTitle}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
