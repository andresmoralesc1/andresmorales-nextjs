"use client"

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Plane, Sphere } from "@react-three/drei"
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
} from "lucide-react"
import { ALL_BOCETOS_CARDS, type ArtworkCard } from "@/lib/artworks-data"

export type Card = ArtworkCard

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  hoveredCardId: string | null
  setHoveredCardId: (id: string | null) => void
  cards: Card[]
  allCards: Card[]
  activeBatch: string
  setActiveBatch: (batch: string) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  goToNextCard: () => void
  goToPrevCard: () => void
}

const CardContext = createContext<CardContextType | undefined>(undefined)

export function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("useCard must be used within CardProvider")
  return ctx
}

export function CardProvider({
  children,
  initialCards,
}: {
  children: React.ReactNode
  initialCards?: Card[]
}) {
  const allCards = useMemo(() => {
    return initialCards && initialCards.length > 0 ? initialCards : ALL_BOCETOS_CARDS
  }, [initialCards])

  const [activeBatch, setActiveBatch] = useState<string>("all")
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  // Load favorites from localStorage if available
  useEffect(() => {
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

  const cards = useMemo(() => {
    if (activeBatch === "batch1") return allCards.slice(0, 50)
    if (activeBatch === "batch2") return allCards.slice(50, 100)
    if (activeBatch === "batch3") return allCards.slice(100)
    if (activeBatch === "favorites") {
      const favs = allCards.filter((c) => favorites.has(c.id))
      return favs.length > 0 ? favs : allCards
    }
    return allCards // "all"
  }, [allCards, activeBatch, favorites])

  const goToNextCard = useCallback(() => {
    if (!selectedCard) return
    const currentIndex = cards.findIndex((c) => c.id === selectedCard.id)
    if (currentIndex === -1) return
    const nextIndex = (currentIndex + 1) % cards.length
    setSelectedCard(cards[nextIndex])
  }, [cards, selectedCard])

  const goToPrevCard = useCallback(() => {
    if (!selectedCard) return
    const currentIndex = cards.findIndex((c) => c.id === selectedCard.id)
    if (currentIndex === -1) return
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length
    setSelectedCard(cards[prevIndex])
  }, [cards, selectedCard])

  return (
    <CardContext.Provider
      value={{
        selectedCard,
        setSelectedCard,
        hoveredCardId,
        setHoveredCardId,
        cards,
        allCards,
        activeBatch,
        setActiveBatch,
        favorites,
        toggleFavorite,
        goToNextCard,
        goToPrevCard,
      }}
    >
      {children}
    </CardContext.Provider>
  )
}

/* =========================
   Starfield Background
   ========================= */

export function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 12000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2400
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2400
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2400
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.00008
      stars.rotation.x += 0.00004
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      starsGeometry.dispose()
      starsMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 bg-black pointer-events-none" />
}

/* =========================
   Floating Card
   ========================= */

export function FloatingCard({
  card,
  position,
}: {
  card: Card
  position: { x: number; y: number; z: number; rotationX: number; rotationY: number; rotationZ: number }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null)
  const { setSelectedCard, setHoveredCardId } = useCard()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  // Three.js 3D plane fallback click
  const handlePlaneClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }
  const handlePlanePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredCardId(card.id)
    document.body.style.cursor = "pointer"
  }
  const handlePlanePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    setHoveredCardId(null)
    document.body.style.cursor = "auto"
  }

  // DOM direct click & touch handlers (guaranteed to trigger even if R3F delta suppresses clicks)
  const handleCardPointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() }
  }

  const handleCardPointerUp = (e: React.PointerEvent) => {
    if (!pointerDownPos.current) return
    const dx = Math.abs(e.clientX - pointerDownPos.current.x)
    const dy = Math.abs(e.clientY - pointerDownPos.current.y)
    const dt = Date.now() - pointerDownPos.current.time
    pointerDownPos.current = null
    // If movement < 12px and duration < 500ms, it is a deliberate tap/click
    if (dx < 12 && dy < 12 && dt < 500) {
      e.stopPropagation()
      setSelectedCard(card)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCard(card)
  }

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
      setSelectedCard(card)
    }
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* 3D Invisible Hit Plane for raycasting fallback */}
      <Plane
        ref={meshRef}
        args={[4.8, 6.4]}
        onClick={handlePlaneClick}
        onPointerOver={handlePlanePointerOver}
        onPointerOut={handlePlanePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </Plane>

      <Html
        transform
        distanceFactor={11}
        position={[0, 0, 0.01]}
        pointerEvents="none"
        style={{
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease",
          transform: hovered ? "scale(1.18)" : "scale(1)",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onPointerDown={handleCardPointerDown}
          onPointerUp={handleCardPointerUp}
          onKeyDown={handleCardKeyDown}
          onPointerEnter={() => {
            setHovered(true)
            setHoveredCardId(card.id)
          }}
          onPointerLeave={() => {
            setHovered(false)
            setHoveredCardId(null)
          }}
          className="w-36 h-48 rounded-xl overflow-hidden shadow-2xl bg-[#0f1115] p-2 select-none transition-all duration-300 backdrop-blur-sm pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#31b8c6]"
          style={{
            pointerEvents: "auto",
            touchAction: "manipulation",
            boxShadow: hovered
              ? "0 25px 50px rgba(49, 184, 198, 0.65), 0 0 35px rgba(49, 184, 198, 0.45)"
              : "0 15px 30px rgba(0, 0, 0, 0.75)",
            border: hovered ? "2px solid rgba(49, 184, 198, 0.9)" : "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="relative w-full h-[150px] overflow-hidden rounded-lg bg-black/60 pointer-events-none">
            <img
              src={card.imageUrl || "/placeholder.svg"}
              alt={card.alt}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className="mt-1 text-center px-0.5 pointer-events-none">
            <p className="text-white text-[10px] font-medium tracking-wide truncate">{card.title}</p>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* =========================
   Card Modal (High-Res Viewer & Controls)
   ========================= */

export function CardModal() {
  const { selectedCard, setSelectedCard, favorites, toggleFavorite, goToNextCard, goToPrevCard } = useCard()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCard(null)
      if (e.key === "ArrowRight") goToNextCard()
      if (e.key === "ArrowLeft") goToPrevCard()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setSelectedCard, goToNextCard, goToPrevCard])

  if (!selectedCard) return null

  const isFav = favorites.has(selectedCard.id)

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 18
    const rotateY = (centerX - x) / 18
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const handleClose = () => setSelectedCard(null)
  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedCard) return
    const fileUrl = selectedCard.downloadUrl || selectedCard.imageUrl
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = `${selectedCard.title.toLowerCase().replace(/[\s\W]+/g, "-")}.jpg`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(selectedCard.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300 select-none p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToPrevCard()
        }}
        aria-label="Obra anterior"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-[#31b8c6] text-white/80 hover:text-black border border-white/20 transition-all z-30 cursor-pointer shadow-xl backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          goToNextCard()
        }}
        aria-label="Siguiente obra"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-[#31b8c6] text-white/80 hover:text-black border border-white/20 transition-all z-30 cursor-pointer shadow-xl backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div
        className="relative max-w-sm sm:max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desktop Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          aria-label="Cerrar modal"
          className="hidden sm:inline-flex items-center gap-1.5 absolute -top-11 right-0 text-white/70 hover:text-white transition-colors z-20 px-2 py-1 cursor-pointer font-mono text-xs rounded-full bg-white/5 hover:bg-white/10"
        >
          <span>Cerrar</span>
          <X className="w-4 h-4" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative rounded-2xl bg-[#121418] border border-white/10 p-4 sm:p-5 transition-all duration-500 ease-out w-full shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(49, 184, 198, 0.25)",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Mobile In-Card Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              aria-label="Cerrar modal"
              className="sm:hidden absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-white border border-white/20 z-30 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-full mb-3 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "3 / 4" }}>
              <img
                loading="eager"
                className="absolute inset-0 h-full w-full rounded-xl object-contain bg-black/60 transition-transform duration-500 hover:scale-105"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl || "/placeholder.svg"}
              />
            </div>

            <div className="text-center mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#31b8c6] mb-0.5 inline-block">
                Andrés Morales • Bocetos de Piel
              </span>
              <h3 className="text-white text-lg sm:text-xl font-serif font-medium tracking-tight">{selectedCard.title}</h3>
              <p className="text-white/40 text-[11px] font-mono mt-0.5">
                Dibujo #{selectedCard.id} de 149
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg text-xs sm:text-sm font-semibold text-black outline-none transition duration-300 ease-out hover:opacity-90 active:scale-[0.98] shadow-md cursor-pointer"
                  style={{ backgroundColor: "#31b8c6" }}
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" strokeWidth={2} />
                    <span>Descargar Original</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFav}
                  aria-label="Guardar en favoritos"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-black outline-none transition duration-300 ease-out hover:opacity-90 active:scale-[0.98] shadow-md cursor-pointer"
                  style={{ backgroundColor: "#31b8c6" }}
                >
                  <Heart
                    className="h-4 w-4"
                    strokeWidth={2}
                    fill={isFav ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  `Hola Andrés, vi la obra "${selectedCard.title}" (Dibujo #${selectedCard.id} de Bocetos de Piel) en amart y me gustaría consultar adquisición/detalles.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#31b8c6]" />
                <span>Consultar o Adquirir Esta Obra</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Card Galaxy (149 Works Fibonacci Sphere)
   ========================= */

export function CardGalaxy() {
  const { cards } = useCard()

  const cardPositions = useMemo(() => {
    const numCards = cards.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const positions: {
      x: number
      y: number
      z: number
      rotationX: number
      rotationY: number
      rotationZ: number
    }[] = []

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1 || 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      // Distribute evenly across 5 concentric orbital shells
      const layerRadius = 18 + (i % 5) * 5.5

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      })
    }
    return positions
  }, [cards])

  return (
    <>
      <Sphere raycast={() => null} args={[3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere raycast={() => null} args={[18, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.035} wireframe />
      </Sphere>
      <Sphere raycast={() => null} args={[24, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.025} wireframe />
      </Sphere>
      <Sphere raycast={() => null} args={[30, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>
      <Sphere raycast={() => null} args={[36, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.015} wireframe />
      </Sphere>
      <Sphere raycast={() => null} args={[42, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.01} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  )
}

/* =========================
   Full Collection Grid Catalog (Drawer Modal)
   ========================= */

function CatalogDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { allCards, setSelectedCard } = useCard()
  const [search, setSearch] = useState("")

  const filteredCards = useMemo(() => {
    if (!search.trim()) return allCards
    const q = search.toLowerCase()
    return allCards.filter(
      (c) => c.title.toLowerCase().includes(q) || c.id.includes(q) || (c.alt && c.alt.toLowerCase().includes(q))
    )
  }, [allCards, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-[#0c0e12] border-l border-white/10 flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-serif font-bold text-white">Catálogo Completo</h2>
            <p className="text-xs font-mono text-[#31b8c6] mt-0.5">
              149 Bocetos de Piel • Andrés Morales
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar catálogo"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o palabra clave (ej. 42, 105)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#31b8c6] transition-colors"
          />
        </div>

        {/* Artwork Grid */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCard(card)
                  onClose()
                }}
                className="group relative rounded-lg overflow-hidden bg-black/40 border border-white/10 hover:border-[#31b8c6] transition-all duration-300 text-left cursor-pointer"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/60">
                  <img
                    src={card.imageUrl}
                    alt={card.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-[#31b8c6]" />
                  </div>
                </div>
                <div className="p-2 bg-[#121418]">
                  <p className="text-[11px] font-medium text-white truncate group-hover:text-[#31b8c6] transition-colors">
                    {card.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-center text-xs font-mono text-white/40">
          Mostrando {filteredCards.length} de {allCards.length} dibujos
        </div>
      </div>
    </div>
  )
}

/* =========================
   Page/Component Export
   ========================= */

export default function StellarCardGallerySingle({ cards }: { cards?: Card[] }) {
  const [mounted, setMounted] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#31b8c6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#31b8c6]/80">Cargando 149 Bocetos de Piel...</p>
        </div>
      </div>
    )
  }

  return (
    <CardProvider initialCards={cards}>
      <GalleryContent catalogOpen={catalogOpen} setCatalogOpen={setCatalogOpen} />
    </CardProvider>
  )
}

function GalleryContent({
  catalogOpen,
  setCatalogOpen,
}: {
  catalogOpen: boolean
  setCatalogOpen: (v: boolean) => void
}) {
  const { allCards, cards, activeBatch, setActiveBatch, favorites, selectedCard, hoveredCardId } = useCard()

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      <StarfieldBackground />

      <Canvas
        camera={{ position: [0, 0, 36], fov: 60 }}
        className="absolute inset-0 z-10"
        onCreated={({ gl }) => {
          gl.domElement.style.pointerEvents = "auto"
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <ambientLight intensity={0.55} />
          <pointLight position={[15, 15, 15]} intensity={0.8} />
          <pointLight position={[-15, -15, -15]} intensity={0.5} />
          <CardGalaxy />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={8}
            maxDistance={85}
            autoRotate={!selectedCard && !catalogOpen && !hoveredCardId}
            autoRotateSpeed={0.25}
            rotateSpeed={0.5}
            zoomSpeed={1.2}
            panSpeed={0.8}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      <CardModal />
      <CatalogDrawer isOpen={catalogOpen} onClose={() => setCatalogOpen(false)} />

      {/* Top Header Overlay */}
      <header className="absolute top-4 left-4 z-20 text-white pointer-events-auto max-w-sm sm:max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#31b8c6] animate-pulse" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#31b8c6]">
            Andrés Morales • AM Art
          </p>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
          Bocetos de Piel
        </h1>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
          Galaxia 3D con las 149 obras originales • Arrastra para rotar • Scroll para zoom • Clic en cualquier obra
        </p>

        {/* Filter / Constellation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <button
            onClick={() => setActiveBatch("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeBatch === "all"
                ? "bg-[#31b8c6] text-black font-semibold shadow-md"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            Todas ({allCards.length})
          </button>
          <button
            onClick={() => setActiveBatch("batch1")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeBatch === "batch1"
                ? "bg-[#31b8c6] text-black font-semibold shadow-md"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            1–50
          </button>
          <button
            onClick={() => setActiveBatch("batch2")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeBatch === "batch2"
                ? "bg-[#31b8c6] text-black font-semibold shadow-md"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            51–100
          </button>
          <button
            onClick={() => setActiveBatch("batch3")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeBatch === "batch3"
                ? "bg-[#31b8c6] text-black font-semibold shadow-md"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            101–149
          </button>
          {favorites.size > 0 && (
            <button
              onClick={() => setActiveBatch("favorites")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                activeBatch === "favorites"
                  ? "bg-[#31b8c6] text-black font-semibold shadow-md"
                  : "bg-white/10 hover:bg-white/15 text-white/70"
              }`}
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Favoritos ({favorites.size})</span>
            </button>
          )}
        </div>
      </header>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setCatalogOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#31b8c6]" />
          <span>Ver Catálogo (149)</span>
        </button>
        <a
          href="https://andresmorales.com.co"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200"
        >
          <span>Portafolio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://wa.me/573161482507?text=Hola%20Andr%C3%A9s,%20vi%20tu%20galer%C3%ADa%20Bocetos%20de%20Piel%20en%20amart%20y%20me%20gustar%C3%ADa%20cotizar%20una%20obra"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#31b8c6] hover:bg-[#289fae] text-black shadow-lg transition-all duration-200"
        >
          <Sparkles className="w-3 h-3" />
          <span>Encargar Obra</span>
        </a>
      </div>

      {/* Bottom Legend */}
      <footer className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-white/40 pointer-events-none">
        <span>{cards.length} Obras en esta constelación</span>
        <span>© {new Date().getFullYear()} Andrés Morales • Bocetos de Piel</span>
      </footer>
    </div>
  )
}
