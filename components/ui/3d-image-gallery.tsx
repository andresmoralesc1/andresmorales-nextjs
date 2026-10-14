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
import {
  ALL_BOCETOS_CARDS,
  COLLECTIONS_CONFIG,
  type ArtworkCard,
  type CollectionKey,
} from "@/lib/artworks-data"

export type Card = ArtworkCard

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  hoveredCardId: string | null
  setHoveredCardId: (id: string | null) => void
  cards: Card[]
  allCards: Card[]
  activeCollection: CollectionKey
  setActiveCollection: (c: CollectionKey) => void
  collectionCounts: Record<CollectionKey, number>
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

  const [activeCollection, setActiveCollection] = useState<CollectionKey>("all")
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

  const cards = useMemo(() => {
    if (activeCollection === "all") return allCards
    if (activeCollection === "favorites") {
      const favs = allCards.filter((c) => favorites.has(c.id))
      return favs.length > 0 ? favs : allCards
    }
    return allCards.filter((c) => c.collection === activeCollection)
  }, [allCards, activeCollection, favorites])

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
        activeCollection,
        setActiveCollection,
        collectionCounts,
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
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    const colors = new Float32Array(starsCount * 3)

    // Palette: diamond white, warm ivory, and subtle amber/gold
    const starColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#fff4e6"),
      new THREE.Color("#fedeb8"),
      new THREE.Color("#f96e03"),
    ]

    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2200

      const c = starColors[Math.floor(Math.random() * (i % 6 === 0 ? 4 : 3))]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const starsGeometry = new THREE.BufferGeometry()
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.75,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.00006
      stars.rotation.x += 0.00003
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

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, #14110e 0%, #0c0a08 55%, #050403 100%)",
      }}
    />
  )
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
          className="w-36 h-48 rounded-xl overflow-hidden shadow-2xl bg-[#14110e] p-2 select-none transition-all duration-300 backdrop-blur-sm pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f96e03]"
          style={{
            pointerEvents: "auto",
            touchAction: "manipulation",
            boxShadow: hovered
              ? "0 22px 48px rgba(249, 110, 3, 0.55), 0 0 30px rgba(249, 110, 3, 0.35)"
              : "0 14px 28px rgba(0, 0, 0, 0.85)",
            border: hovered ? "2px solid #f96e03" : "1px solid rgba(255, 240, 225, 0.12)",
          }}
        >
          <div className="relative w-full h-[150px] overflow-hidden rounded-lg bg-black/70 pointer-events-none">
            <img
              src={card.imageUrl || "/placeholder.svg"}
              alt={card.alt}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className="mt-1 text-center px-0.5 pointer-events-none">
            <p className="text-[#F8F5F4] text-[10px] font-medium tracking-wide truncate">
              <span className="text-[#f96e03] font-mono mr-1 font-bold">#{card.id}</span>
              {card.title}
            </p>
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
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-[#f96e03] text-white/90 hover:text-[#1E1810] border border-white/20 transition-all z-30 cursor-pointer shadow-xl backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          goToNextCard()
        }}
        aria-label="Siguiente obra"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-[#f96e03] text-white/90 hover:text-[#1E1810] border border-white/20 transition-all z-30 cursor-pointer shadow-xl backdrop-blur-sm"
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
          className="hidden sm:inline-flex items-center gap-1.5 absolute -top-11 right-0 text-white/70 hover:text-[#f96e03] transition-colors z-20 px-2.5 py-1 cursor-pointer font-mono text-xs rounded-full bg-white/5 hover:bg-white/10"
        >
          <span>Cerrar</span>
          <X className="w-4 h-4" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative rounded-2xl bg-[#14110e] border border-white/15 p-4 sm:p-5 transition-all duration-500 ease-out w-full shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(249, 110, 3, 0.25)",
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
              className="sm:hidden absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-[#f96e03] border border-white/20 z-30 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-full mb-3 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "3 / 4" }}>
              <img
                loading="eager"
                className="absolute inset-0 h-full w-full rounded-xl object-contain bg-black/70 transition-transform duration-500 hover:scale-105"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl || "/placeholder.svg"}
              />
            </div>

            <div className="text-center mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#f96e03] px-2.5 py-0.5 rounded-full bg-[#f96e03]/10 border border-[#f96e03]/25 font-bold mb-1.5 inline-block">
                Serie {selectedCard.collectionLabel}
              </span>
              <h3 className="text-white text-lg sm:text-xl font-serif font-medium tracking-tight">
                {selectedCard.title}
              </h3>
              {selectedCard.description && (
                <p className="text-white/80 text-xs sm:text-[13px] font-sans leading-relaxed mt-2 max-w-sm mx-auto">
                  {selectedCard.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-mono text-white/40">
                <span>Dibujo #{selectedCard.id} de 149</span>
                {selectedCard.technique && (
                  <>
                    <span>•</span>
                    <span>{selectedCard.technique}</span>
                  </>
                )}
                <span>•</span>
                <span>Andrés Morales</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-[#1E1810] outline-none transition duration-300 ease-out bg-[#f96e03] hover:bg-[#ff5100] active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" strokeWidth={2.2} />
                    <span>Descargar Original</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFav}
                  aria-label="Guardar en favoritos"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#1E1810] outline-none transition duration-300 ease-out bg-[#f96e03] hover:bg-[#ff5100] active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <Heart
                    className="h-4 w-4"
                    strokeWidth={2.2}
                    fill={isFav ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  `Hola Andrés, vi tu obra "${selectedCard.title}" (Dibujo #${selectedCard.id}, Serie ${selectedCard.collectionLabel}) en amart y me gustaría consultar su adquisición o detalles.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold bg-[#f96e03]/10 hover:bg-[#f96e03]/20 text-[#f96e03] border border-[#f96e03]/30 hover:border-[#f96e03] transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#f96e03]" />
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

    // Base radius dynamically adapts so collections with 5-13 cards, 68 cards, or all 149 cards look beautifully proportioned
    const baseRadius = numCards <= 15 ? 17 : numCards <= 70 ? 22 : 27

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1 || 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      // Subtle depth variation (±1.5 units) for organic depth without overlapping
      const layerRadius = baseRadius + (numCards > 20 ? ((i % 3) - 1) * 1.5 : 0)

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.1,
      })
    }
    return positions
  }, [cards])

  const coreRadius = cards.length <= 15 ? 10 : cards.length <= 70 ? 15 : 19
  const ringRadius = cards.length <= 15 ? 18 : cards.length <= 70 ? 23 : 28.5

  return (
    <>
      {/* Soft atmospheric core: veils far-side cards so foreground artworks stand out with crystal clarity */}
      <Sphere raycast={() => null} args={[coreRadius, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#0b0907" transparent opacity={0.72} depthWrite={false} />
      </Sphere>

      {/* Two delicate armillary celestial rings in brand gold/orange */}
      <mesh raycast={() => null} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius, ringRadius + 0.15, 64]} />
        <meshBasicMaterial color="#f96e03" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh raycast={() => null} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <ringGeometry args={[ringRadius, ringRadius + 0.15, 64]} />
        <meshBasicMaterial color="#f96e03" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

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
  const { allCards, setSelectedCard, activeCollection, setActiveCollection, collectionCounts } = useCard()
  const [search, setSearch] = useState("")

  const filteredCards = useMemo(() => {
    let list = allCards
    if (activeCollection !== "all") {
      if (activeCollection === "favorites") {
        // ...
      } else {
        list = list.filter((c) => c.collection === activeCollection)
      }
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
  }, [allCards, activeCollection, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-[#14110e] border-l border-white/15 flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-serif font-bold text-white">Catálogo de Obras</h2>
            <p className="text-xs font-mono text-[#f96e03] mt-0.5 font-semibold">
              Bocetos de Piel • Andrés Morales
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar catálogo"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#f96e03] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          <button
            onClick={() => setActiveCollection("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "all"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            Todas ({collectionCounts.all})
          </button>
          <button
            onClick={() => setActiveCollection("yoga")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "yoga"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            🧘 Yoga ({collectionCounts.yoga})
          </button>
          <button
            onClick={() => setActiveCollection("shibari")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "shibari"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            🪢 Shibari ({collectionCounts.shibari})
          </button>
          <button
            onClick={() => setActiveCollection("anatomia-botanica")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "anatomia-botanica"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            🌿 Botánica ({collectionCounts["anatomia-botanica"]})
          </button>
          <button
            onClick={() => setActiveCollection("pregnant")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "pregnant"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            🤰 Pregnant ({collectionCounts.pregnant})
          </button>
          <button
            onClick={() => setActiveCollection("figura-humana")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              activeCollection === "figura-humana"
                ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            Figura Humana ({collectionCounts["figura-humana"]})
          </button>
        </div>

        {/* Search */}
        <div className="relative my-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o palabra clave (ej. 108, shibari, loto)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#f96e03] focus:ring-1 focus:ring-[#f96e03]/30 transition-colors"
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
                className="group relative rounded-lg overflow-hidden bg-black/50 border border-white/10 hover:border-[#f96e03] transition-all duration-300 text-left cursor-pointer shadow-md"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/70">
                  <img
                    src={card.imageUrl}
                    alt={card.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-[#f96e03] font-semibold">
                    {card.collectionLabel}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-[#f96e03]" />
                  </div>
                </div>
                <div className="p-2.5 bg-[#1a1613]">
                  <p className="text-[11px] font-medium text-white truncate group-hover:text-[#f96e03] transition-colors">
                    <span className="text-[#f96e03] font-mono mr-1 font-bold">#{card.id}</span>
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
      <div className="w-full h-screen bg-[#0c0a08] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#f96e03] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#f96e03]/90">
            Cargando 149 Bocetos de Piel...
          </p>
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
  const {
    allCards,
    cards,
    activeCollection,
    setActiveCollection,
    collectionCounts,
    favorites,
    selectedCard,
    hoveredCardId,
  } = useCard()

  const collectionList: Array<{ id: CollectionKey; label: string }> = [
    { id: "all", label: `Todas (${collectionCounts.all})` },
    { id: "yoga", label: `Yoga (${collectionCounts.yoga})` },
    { id: "shibari", label: `Shibari (${collectionCounts.shibari})` },
    { id: "anatomia-botanica", label: `Anatomía Botánica (${collectionCounts["anatomia-botanica"]})` },
    { id: "pregnant", label: `Pregnant (${collectionCounts.pregnant})` },
    { id: "figura-humana", label: `Figura Humana (${collectionCounts["figura-humana"]})` },
  ]

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#0c0a08] select-none">
      <StarfieldBackground />

      <Canvas
        camera={{ position: [0, 0, 42], fov: 55 }}
        className="absolute inset-0 z-10"
        onCreated={({ gl }) => {
          gl.domElement.style.pointerEvents = "auto"
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <ambientLight intensity={0.6} />
          <pointLight position={[20, 20, 20]} intensity={0.9} color="#fff4e6" />
          <pointLight position={[-20, -20, -20]} intensity={0.5} color="#fedeb8" />
          <CardGalaxy />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={18}
            maxDistance={72}
            autoRotate={!selectedCard && !catalogOpen && !hoveredCardId}
            autoRotateSpeed={0.22}
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
      <header className="absolute top-4 left-4 z-20 text-white pointer-events-auto max-w-sm sm:max-w-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#f96e03] shadow-[0_0_8px_#f96e03] animate-pulse" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#f96e03] font-semibold">
            Andrés Morales • AM Art
          </p>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
          Bocetos de Piel
        </h1>
        <p className="text-xs text-white/65 mt-0.5 leading-relaxed">
          {COLLECTIONS_CONFIG[activeCollection]?.name || "Bocetos de Piel"} • {cards.length} {cards.length === 1 ? "obra" : "obras"} • Arrastra para orbitar • Clic para ampliar
        </p>

        {/* Filter / Constellation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {collectionList.map((col) => {
            const isActive = activeCollection === col.id
            return (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
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
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setCatalogOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#f96e03]/50 backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#f96e03]" />
          <span>Ver Catálogo ({allCards.length})</span>
        </button>
        <a
          href="https://andresmorales.com.co"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white/85 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200"
        >
          <span>Portafolio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://wa.me/573161482507?text=Hola%20Andr%C3%A9s,%20vi%20tu%20galer%C3%ADa%20Bocetos%20de%20Piel%20en%20amart%20y%20me%20gustar%C3%ADa%20cotizar%20una%20obra"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_4px_16px_rgba(249,110,3,0.35)] transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Encargar Obra</span>
        </a>
      </div>

      {/* Bottom Legend */}
      <footer className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-white/40 pointer-events-none">
        <span>
          {cards.length} {cards.length === 1 ? "Obra" : "Obras"} en constelación • {COLLECTIONS_CONFIG[activeCollection]?.name || "Bocetos de Piel"}
        </span>
        <span>© {new Date().getFullYear()} Andrés Morales • Bocetos de Piel</span>
      </footer>
    </div>
  )
}
