"use client"

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Plane, Sphere } from "@react-three/drei"
import { Download, Heart, X, Sparkles, ExternalLink } from "lucide-react"

/**
 * Single-file Stellar Card Gallery — Bocetos de Piel (Andrés Morales)
 * - Context, Starfield, Galaxy, FloatingCard, Modal, and Page in one.
 */

/* =========================
   Card Context & Types
   ========================= */

export type Card = {
  id: string
  imageUrl: string
  alt: string
  title: string
  downloadUrl?: string
}

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  cards: Card[]
}

const CardContext = createContext<CardContextType | undefined>(undefined)

export function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("useCard must be used within CardProvider")
  return ctx
}

export const DEFAULT_BOCETOS_CARDS: Card[] = [
  { id: "1", imageUrl: "/art/bocetos-de-piel/boceto-01.jpg", alt: "Boceto de Piel I", title: "Boceto de Piel I", downloadUrl: "/art/bocetos-de-piel/full/boceto-01.jpg" },
  { id: "2", imageUrl: "/art/bocetos-de-piel/boceto-02.jpg", alt: "Ecos en Tinta", title: "Ecos en Tinta", downloadUrl: "/art/bocetos-de-piel/full/boceto-02.jpg" },
  { id: "3", imageUrl: "/art/bocetos-de-piel/boceto-03.jpg", alt: "Anatomía Mística", title: "Anatomía Mística", downloadUrl: "/art/bocetos-de-piel/full/boceto-03.jpg" },
  { id: "4", imageUrl: "/art/bocetos-de-piel/boceto-04.jpg", alt: "Trazos de Silencio", title: "Trazos de Silencio", downloadUrl: "/art/bocetos-de-piel/full/boceto-04.jpg" },
  { id: "5", imageUrl: "/art/bocetos-de-piel/boceto-05.jpg", alt: "Metamorfosis", title: "Metamorfosis", downloadUrl: "/art/bocetos-de-piel/full/boceto-05.jpg" },
  { id: "6", imageUrl: "/art/bocetos-de-piel/boceto-06.jpg", alt: "Espíritu Salvaje", title: "Espíritu Salvaje", downloadUrl: "/art/bocetos-de-piel/full/boceto-06.jpg" },
  { id: "7", imageUrl: "/art/bocetos-de-piel/boceto-07.jpg", alt: "Líneas de Vida", title: "Líneas de Vida", downloadUrl: "/art/bocetos-de-piel/full/boceto-07.jpg" },
  { id: "8", imageUrl: "/art/bocetos-de-piel/boceto-08.jpg", alt: "Geometría Sagrada", title: "Geometría Sagrada", downloadUrl: "/art/bocetos-de-piel/full/boceto-08.jpg" },
  { id: "9", imageUrl: "/art/bocetos-de-piel/boceto-09.jpg", alt: "Fuerza Interior", title: "Fuerza Interior", downloadUrl: "/art/bocetos-de-piel/full/boceto-09.jpg" },
  { id: "10", imageUrl: "/art/bocetos-de-piel/boceto-10.jpg", alt: "Raíces Orgánicas", title: "Raíces Orgánicas", downloadUrl: "/art/bocetos-de-piel/full/boceto-10.jpg" },
  { id: "11", imageUrl: "/art/bocetos-de-piel/boceto-11.jpg", alt: "El Vuelo Interior", title: "El Vuelo Interior", downloadUrl: "/art/bocetos-de-piel/full/boceto-11.jpg" },
  { id: "12", imageUrl: "/art/bocetos-de-piel/boceto-12.jpg", alt: "Sombra & Luz", title: "Sombra & Luz", downloadUrl: "/art/bocetos-de-piel/full/boceto-12.jpg" },
  { id: "13", imageUrl: "/art/bocetos-de-piel/boceto-13.jpg", alt: "Dualidad", title: "Dualidad", downloadUrl: "/art/bocetos-de-piel/full/boceto-13.jpg" },
  { id: "14", imageUrl: "/art/bocetos-de-piel/boceto-14.jpg", alt: "El Guardián", title: "El Guardián", downloadUrl: "/art/bocetos-de-piel/full/boceto-14.jpg" },
  { id: "15", imageUrl: "/art/bocetos-de-piel/boceto-15.jpg", alt: "Renacer", title: "Renacer", downloadUrl: "/art/bocetos-de-piel/full/boceto-15.jpg" },
  { id: "16", imageUrl: "/art/bocetos-de-piel/boceto-16.jpg", alt: "Vórtice Zen", title: "Vórtice Zen", downloadUrl: "/art/bocetos-de-piel/full/boceto-16.jpg" },
  { id: "17", imageUrl: "/art/bocetos-de-piel/boceto-17.jpg", alt: "Huellas del Tiempo", title: "Huellas del Tiempo", downloadUrl: "/art/bocetos-de-piel/full/boceto-17.jpg" },
  { id: "18", imageUrl: "/art/bocetos-de-piel/boceto-18.jpg", alt: "Equilibrio Puro", title: "Equilibrio Puro", downloadUrl: "/art/bocetos-de-piel/full/boceto-18.jpg" },
  { id: "19", imageUrl: "/art/bocetos-de-piel/boceto-19.jpg", alt: "Piel & Grafito", title: "Piel & Grafito", downloadUrl: "/art/bocetos-de-piel/full/boceto-19.jpg" },
  { id: "20", imageUrl: "/art/bocetos-de-piel/boceto-20.jpg", alt: "Serpiente Lunar", title: "Serpiente Lunar", downloadUrl: "/art/bocetos-de-piel/full/boceto-20.jpg" },
  { id: "21", imageUrl: "/art/bocetos-de-piel/boceto-21.jpg", alt: "Tótem Sagrado", title: "Tótem Sagrado", downloadUrl: "/art/bocetos-de-piel/full/boceto-21.jpg" },
  { id: "22", imageUrl: "/art/bocetos-de-piel/boceto-22.jpg", alt: "Frecuencia Oculta", title: "Frecuencia Oculta", downloadUrl: "/art/bocetos-de-piel/full/boceto-22.jpg" },
  { id: "23", imageUrl: "/art/bocetos-de-piel/boceto-23.jpg", alt: "Vanguardia Tribal", title: "Vanguardia Tribal", downloadUrl: "/art/bocetos-de-piel/full/boceto-23.jpg" },
  { id: "24", imageUrl: "/art/bocetos-de-piel/boceto-24.jpg", alt: "Alquimia Corporal", title: "Alquimia Corporal", downloadUrl: "/art/bocetos-de-piel/full/boceto-24.jpg" },
]

export function CardProvider({
  children,
  initialCards,
}: {
  children: React.ReactNode
  initialCards?: Card[]
}) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const cards = initialCards && initialCards.length > 0 ? initialCards : DEFAULT_BOCETOS_CARDS

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>
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
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.0001
      stars.rotation.x += 0.00005
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
  const { setSelectedCard } = useCard()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }
  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        ref={meshRef}
        args={[4.5, 6]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-40 h-52 rounded-xl overflow-hidden shadow-2xl bg-[#0f1115] p-2.5 select-none transition-all duration-300 backdrop-blur-sm"
          style={{
            boxShadow: hovered
              ? "0 25px 50px rgba(49, 184, 198, 0.5), 0 0 35px rgba(49, 184, 198, 0.35)"
              : "0 15px 30px rgba(0, 0, 0, 0.7)",
            border: hovered ? "2px solid rgba(49, 184, 198, 0.8)" : "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="relative w-full h-[162px] overflow-hidden rounded-lg bg-black/40">
            <img
              src={card.imageUrl || "/placeholder.svg"}
              alt={card.alt}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className="mt-1.5 text-center px-1">
            <p className="text-white text-[11px] font-medium tracking-wide truncate">{card.title}</p>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* =========================
   Card Modal
   ========================= */

export function CardModal() {
  const { selectedCard, setSelectedCard } = useCard()
  const [isFavorited, setIsFavorited] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCard(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setSelectedCard])

  if (!selectedCard) return null

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const toggleFavorite = () => setIsFavorited((v) => !v)
  const handleClose = () => setSelectedCard(null)
  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleDownload = () => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-sm sm:max-w-md w-full mx-4">
        <button
          onClick={handleClose}
          aria-label="Cerrar modal"
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10 p-1"
        >
          <X className="w-8 h-8" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-2xl bg-[#121418] border border-white/10 p-5 transition-all duration-500 ease-out w-full shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(49, 184, 198, 0.15)",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-4 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "3 / 4" }}>
              <img
                loading="eager"
                className="absolute inset-0 h-full w-full rounded-xl object-cover transition-transform duration-500 hover:scale-105"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl || "/placeholder.svg"}
              />
            </div>

            <div className="text-center mb-5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#31b8c6] mb-1 inline-block">
                Andrés Morales • Bocetos de Piel
              </span>
              <h3 className="text-white text-xl font-serif font-medium tracking-tight">{selectedCard.title}</h3>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-black outline-none transition duration-300 ease-out hover:opacity-90 active:scale-[0.98] shadow-md cursor-pointer"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" strokeWidth={2} />
                  <span>Descargar Obra</span>
                </div>
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                aria-label="Guardar en favoritos"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-black outline-none transition duration-300 ease-out hover:opacity-90 active:scale-[0.98] shadow-md cursor-pointer"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <Heart
                  className="h-4 w-4"
                  strokeWidth={2}
                  fill={isFavorited ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Card Galaxy
   ========================= */

export function CardGalaxy() {
  const { cards } = useCard()

  const cardPositions = useMemo(() => {
    const positions: {
      x: number
      y: number
      z: number
      rotationX: number
      rotationY: number
      rotationZ: number
    }[] = []
    const numCards = cards.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1 || 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 12 + (i % 3) * 4

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
  }, [cards.length])

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  )
}

/* =========================
   Page/Component Export
   ========================= */

export default function StellarCardGallerySingle({ cards }: { cards?: Card[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#31b8c6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#31b8c6]/80">Cargando Galería Estelar...</p>
        </div>
      </div>
    )
  }

  return (
    <CardProvider initialCards={cards}>
      <div className="w-full h-screen relative overflow-hidden bg-black select-none">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 16], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = "auto"
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.7} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} />
            <CardGalaxy />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={42}
              autoRotate={true}
              autoRotateSpeed={0.35}
              rotateSpeed={0.5}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <CardModal />

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
            Arrastra para rotar • Scroll para zoom • Clic en cualquier obra para abrir detalles
          </p>
        </header>

        {/* Top Right Quick Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
          <a
            href="https://andresmorales.com.co"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200"
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
          <span>24 Obras Seleccionadas</span>
          <span>© {new Date().getFullYear()} Andrés Morales • Todos los derechos reservados</span>
        </footer>
      </div>
    </CardProvider>
  )
}
