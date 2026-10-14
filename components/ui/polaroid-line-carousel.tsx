"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react"

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist"

export type Slide = {
  id?: string
  image?: string
  downloadUrl?: string
  title?: string
  caption?: string
  technique?: string
  collection?: string
  collectionLabel?: string
  alt?: string
  palette?: LandPalette
  seed?: number
}

export type PolaroidLineCarouselProps = {
  slides?: Slide[]
  /** Any CSS length. Default 100svh. */
  height?: number | string
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number
  /** How far the string sags in the middle, px. */
  sag?: number
  /** How much the prints swing; 0 holds them still. */
  swing?: number
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number
  /** Colour of the string and pegs. */
  string?: string
  background?: string
  ink?: string
  onChange?: (index: number) => void
  onSelect?: (slide: Slide, index: number) => void
  onOrderInquire?: (slide: Slide) => void
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  const t = clamp(x / w, 0, 1)
  return y0 + 4 * sag * t * (1 - t)
}

/** One step of a critically damped spring toward target. */
export function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k)
  const nv = v + (k * (target - x) - c * v) * dt
  return [x + nv * dt, nv]
}

/** One step of a print's swing. lineVel is the prints' on-screen speed (px/s, + = moving right); a print lags behind the motion, is pulled back by gravity and damped. */
export function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt
  return [clamp(a + nw * dt, -0.6, 0.6), nw]
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1))
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n)
}
// #endregion logic

const PL_CSS = `
.pl-root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--pl-bg);color:var(--pl-ink);user-select:none;-webkit-user-select:none;touch-action:none;outline:none;cursor:grab}
.pl-root[data-drag='1']{cursor:grabbing}
.pl-root:focus-visible{box-shadow:inset 0 0 0 2px var(--pl-ink)}
.pl-string{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.pl-card{position:absolute;left:0;top:0;width:var(--pl-cw);transform-origin:50% 0;will-change:transform;cursor:pointer}
.pl-print{margin-top:10px;background:#fcfbf8;padding:8px 8px 0;border-radius:4px;box-shadow:0 3px 6px rgba(0,0,0,.35),0 20px 35px -14px rgba(0,0,0,.65);transition:transform .4s cubic-bezier(.2,.7,.2,1),filter .4s ease,box-shadow .4s ease;border:1px solid rgba(255,255,255,.08)}
.pl-card[data-on='0'] .pl-print{transform:scale(.88);filter:saturate(.65) brightness(.88);opacity:.8}
.pl-card[data-on='1'] .pl-print{transform:scale(1.02);box-shadow:0 6px 12px rgba(0,0,0,.45),0 25px 48px -12px rgba(249,110,3,.25),0 0 20px rgba(249,110,3,.15);border:1px solid rgba(249,110,3,.3)}
.pl-shot{position:relative;aspect-ratio:3/4;overflow:hidden;background:#181512;border-radius:2px}
.pl-shot img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none}
.pl-tag{position:absolute;top:6px;left:6px;z-index:2;font:700 9px/1 ui-monospace,monospace;color:#f96e03;background:rgba(12,10,8,.85);padding:2px 5px;border-radius:3px;border:1px solid rgba(249,110,3,.3);letter-spacing:.05em;text-transform:uppercase}
.pl-note{height:38px;display:flex;align-items:center;justify-content:center;padding:0 6px;font:italic 500 12px/1.2 ui-serif,Georgia,'Times New Roman',serif;color:#1e1810;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-peg{position:absolute;left:50%;top:-2px;width:11px;height:26px;margin-left:-5.5px;border-radius:2px;background:linear-gradient(90deg,#b38e5c,#ddbf90 45%,#997345);box-shadow:0 2px 4px rgba(0,0,0,.45);z-index:4}
.pl-peg::after{content:'';position:absolute;left:4.5px;top:8px;width:2px;height:7px;background:rgba(50,35,15,.6);border-radius:1px}
.pl-bar{position:absolute;left:0;right:0;bottom:0;padding:10px clamp(12px,4vw,36px) max(12px,calc(env(safe-area-inset-bottom,0px) + 8px));display:flex;flex-direction:column;gap:8px;cursor:default;z-index:25;pointer-events:none;background:linear-gradient(to top, rgba(12,10,8,0.96) 0%, rgba(12,10,8,0.7) 65%, transparent 100%)}
.pl-bar-top{display:flex;align-items:center;justify-content:space-between;gap:clamp(10px,2vw,20px);pointer-events:auto}
.pl-cap{flex:1;min-width:0;overflow:hidden}
.pl-title{font:600 clamp(15px,2vw,20px)/1.2 ui-serif,Georgia,'Times New Roman',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ffffff}
.pl-sub{margin-top:2px;font:400 11px/1.3 ui-sans-serif,system-ui,sans-serif;color:var(--pl-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-actions{display:flex;align-items:center;gap:8px;pointer-events:auto}
.pl-count{font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:var(--pl-muted);white-space:nowrap}
.pl-count b{color:#f96e03;font-weight:700}
.pl-btn{appearance:none;width:34px;height:34px;border-radius:50%;border:1px solid var(--pl-line);background:rgba(255,255,255,.08);color:inherit;display:grid;place-items:center;cursor:pointer;transition:all .2s ease;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:auto}
.pl-btn:hover{background:#f96e03;color:#1e1810;border-color:#f96e03}
.pl-btn:focus-visible{outline:2px solid #f96e03;outline-offset:2px}
.pl-action-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:9999px;font-size:11px;font-weight:600;font-family:ui-monospace,monospace;transition:all .2s ease;cursor:pointer;pointer-events:auto}
.pl-scrubber{display:flex;align-items:center;gap:12px;width:100%;max-width:520px;margin:0 auto;pointer-events:auto;touch-action:pan-x;background:rgba(22,18,14,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.14);border-radius:9999px;padding:6px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.12)}
.pl-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:4px;background:rgba(255,255,255,0.18);outline:none;cursor:pointer;touch-action:pan-x;transition:background .2s}
.pl-range:hover{background:rgba(255,255,255,0.26)}
.pl-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#f96e03;border:2px solid #ffffff;cursor:grab;box-shadow:0 0 14px rgba(249,110,3,0.8),0 2px 5px rgba(0,0,0,0.5);transition:transform .15s ease,box-shadow .15s ease}
.pl-range::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.25);box-shadow:0 0 20px rgba(249,110,3,1),0 2px 8px rgba(0,0,0,0.6)}
.pl-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#f96e03;border:2px solid #ffffff;cursor:grab;box-shadow:0 0 14px rgba(249,110,3,0.8),0 2px 5px rgba(0,0,0,0.5);transition:transform .15s ease}
.pl-range::-moz-range-thumb:active{cursor:grabbing;transform:scale(1.25)}
.pl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`

export default function PolaroidLineCarousel({
  slides = [],
  height = "100svh",
  cardWidth = 260,
  sag = 42,
  swing = 1,
  autoplay = 0,
  string = "#8a7056",
  background = "#0c0a08",
  ink = "#f5eee6",
  onChange,
  onSelect,
  onOrderInquire,
  className,
  style,
  ariaLabel = "Carrusel de Bocetos de Piel",
}: PolaroidLineCarouselProps) {
  const n = slides.length
  const [active, setActive] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [size, setSize] = React.useState({ w: 1200, h: 800, cw: cardWidth })
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const pathRef = React.useRef<SVGPathElement | null>(null)
  const cards = React.useRef<(HTMLDivElement | null)[]>([])
  const sim = React.useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] })
  const drag = React.useRef<null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean }>(null)
  const lastTouch = React.useRef(0)
  const activeRef = React.useRef(0)
  const opts = React.useRef({ sag, swing })
  opts.current = { sag, swing }

  // Spacing between card centres
  const spacing = size.cw * 1.12

  const goTo = React.useCallback(
    (i: number) => {
      const targetIdx = clamp(i, 0, Math.max(0, n - 1))
      sim.current.target = targetIdx * spacing
    },
    [n, spacing]
  )

  // Measure container and adapt card width responsively
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      // Max card height reservation: leave ≥165px for bottom bar + clearance
      const maxAvailableH = Math.max(160, r.height - 165)
      // Card height is approx cw * 1.33 + 48px, so max cw from height is (maxAvailableH - 48) * 0.72
      const maxCwFromH = Math.max(120, (maxAvailableH - 48) * 0.72)
      // Responsive card width: compact on mobile, generous on desktop
      const cw = Math.round(Math.max(130, Math.min(cardWidth, r.width * 0.62, maxCwFromH)))
      setSize({ w: r.width, h: r.height, cw })
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [cardWidth])

  // Keep target synchronized when spacing or slides change
  React.useEffect(() => {
    const safeActive = clamp(activeRef.current, 0, Math.max(0, n - 1))
    sim.current.target = safeActive * spacing
    sim.current.off = safeActive * spacing
  }, [spacing, n])

  React.useEffect(() => {
    onChange?.(active)
  }, [active, onChange])

  // Main physics simulation written directly to DOM elements
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || n === 0) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let visible = true
    let raf = 0
    let prev = performance.now()
    const S = sim.current

    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now
      const { w, h, cw } = size
      const isMobile = w < 640
      // Raise string anchor higher so prints occupy upper-mid portion of viewport
      const y0 = Math.max(26, Math.min(48, h * 0.08))
      const o = opts.current
      const currentSag = isMobile ? Math.min(o.sag, 32) : o.sag
      const d = drag.current
      let lineVel: number

      if (d && d.moved) {
        lineVel = d.v * 1000
      } else {
        const before = S.off
        ;[S.off, S.vel] = springStep(S.off, S.vel, S.target, dt)
        lineVel = -(S.off - before) / Math.max(dt, 1e-3)
      }

      const g = reduce ? 0 : o.swing
      const near = nearestAt(S.off, spacing, n)

      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const x = w / 2 + i * spacing - S.off

        // Fast Culling: only simulate & display polaroids near the viewport
        if (x < -cw * 1.8 || x > w + cw * 1.8) {
          el.style.visibility = "hidden"
          continue
        }
        el.style.visibility = "visible"

        let a = S.a[i] || 0
        let av = S.w[i] || 0
        ;[a, av] = swingStep(a, av, lineVel, dt, g)
        if (g) a += Math.sin(now / 1400 + i * 1.7) * 0.0008 * g
        S.a[i] = a
        S.w[i] = av

        const y = stringY(x, w, y0, currentSag) - 8
        el.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(4)}rad)`
        el.style.zIndex = String(i === near ? n + 2 : n - Math.abs(i - near))
      }

      // Update sagging SVG string path
      pathRef.current?.setAttribute(
        "d",
        `M0 ${y0} Q${w / 2} ${y0 + 2 * currentSag} ${w} ${y0}`
      )

      if (near !== activeRef.current) {
        activeRef.current = near
        setActive(near)
      }

      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) {
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(root)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [size, spacing, n])

  // Optional autoplay
  React.useEffect(() => {
    if (!autoplay || n < 2) return
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || performance.now() - lastTouch.current < autoplay) return
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1)
    }, autoplay)
    return () => window.clearInterval(t)
  }, [autoplay, n, goTo])

  // Pointer & Drag handlers with inertia
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".pl-bar")) return
    lastTouch.current = performance.now()
    drag.current = {
      x: e.clientX,
      off: sim.current.off,
      lx: e.clientX,
      lt: e.timeStamp,
      v: 0,
      moved: false,
    }
  }

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
      rootRef.current?.setPointerCapture(e.pointerId)
    }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lt)
    // Smoothing velocity tracking for fling/momentum release
    d.v = 0.65 * ((e.clientX - d.lx) / dt) + 0.35 * d.v
    d.lx = e.clientX
    d.lt = e.timeStamp

    const max = Math.max(0, (n - 1) * spacing)
    let off = d.off - dx
    // Over-drag resistance elasticity at edges
    if (off < 0) off *= 0.35
    if (off > max) off = max + (off - max) * 0.35
    sim.current.off = off
  }

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    lastTouch.current = performance.now()
    if (!d) return

    if (d.moved) {
      setDragging(false)
      // Momentum flick with inertia: project target based on throw velocity
      sim.current.vel = -d.v * 1000
      const momentumTarget = sim.current.off - d.v * 240
      goTo(nearestAt(momentumTarget, spacing, n))
      return
    }

    // Direct card tap
    const cardEl = (e.target as HTMLElement).closest("[data-i]")
    if (cardEl) {
      const idx = Number(cardEl.getAttribute("data-i"))
      if (idx === activeRef.current) {
        // Tap on active center card: open full screen exhibition view!
        if (slides[idx]) {
          onSelect?.(slides[idx], idx)
        }
      } else {
        // Tap on neighbor card: slide it smoothly to center
        goTo(idx)
      }
    }
  }

  const step = (dir: number) => {
    lastTouch.current = performance.now()
    goTo(clamp(activeRef.current + dir, 0, n - 1))
  }

  const onScrub = (val: number) => {
    lastTouch.current = performance.now()
    const targetIdx = clamp(val, 0, Math.max(0, n - 1))
    sim.current.target = targetIdx * spacing
    sim.current.off = targetIdx * spacing
    sim.current.vel = 0
    activeRef.current = targetIdx
    setActive(targetIdx)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1)
    else if (e.key === "ArrowLeft") step(-1)
    else if (e.key === "Enter" || e.key === " ") {
      if (slides[active]) onSelect?.(slides[active], active)
    } else return
    e.preventDefault()
  }

  const currentSlide = slides[active] || {}

  return (
    <div
      ref={rootRef}
      className={["pl-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--pl-bg" as string]: background,
        ["--pl-ink" as string]: ink,
        ["--pl-muted" as string]: "rgba(255, 255, 255, 0.65)",
        ["--pl-line" as string]: "rgba(255, 255, 255, 0.15)",
        ["--pl-cw" as string]: size.cw + "px",
        ...style,
      }}
      data-drag={dragging ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <style>{PL_CSS}</style>

      {/* Sagging twine string SVG */}
      <svg className="pl-string" aria-hidden="true">
        <path
          ref={pathRef}
          fill="none"
          stroke={string}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Polaroids attached to the line */}
      {slides.map((sl, i) => {
        const isCurrent = i === active
        return (
          <div
            key={sl.id || i}
            className="pl-card"
            data-i={i}
            data-on={isCurrent ? "1" : "0"}
            ref={(el) => {
              cards.current[i] = el
            }}
            aria-hidden={isCurrent ? undefined : true}
          >
            <div className="pl-print">
              <div className="pl-shot">
                {sl.image ? (
                  <img
                    src={sl.image}
                    alt={sl.alt || sl.title || ""}
                    draggable={false}
                    loading={Math.abs(i - active) <= 4 ? "eager" : "lazy"}
                  />
                ) : null}
                {sl.collectionLabel && (
                  <span className="pl-tag">{sl.collectionLabel}</span>
                )}
              </div>
              <div className="pl-note">
                <span className="font-mono text-[#f96e03] not-italic mr-1.5 font-bold">
                  #{sl.id || i + 1}
                </span>
                {sl.title || `Boceto #${i + 1}`}
              </div>
            </div>
            {/* Wooden clothespin peg */}
            <div className="pl-peg" />
          </div>
        )
      })}

      {/* Bottom Bar: Curatorial Info, Timeline Scrubber & Navigation */}
      <div className="pl-bar">
        {/* Caption info & Actions */}
        <div className="pl-bar-top">
          <div className="pl-cap" key={active} aria-hidden="true">
            {currentSlide.title && (
              <div className="flex items-center gap-2">
                <span className="text-[#f96e03] font-mono font-bold text-xs sm:text-sm">
                  #{currentSlide.id || active + 1}
                </span>
                <span className="pl-title">{currentSlide.title}</span>
              </div>
            )}
            {currentSlide.caption && (
              <div className="pl-sub">{currentSlide.caption}</div>
            )}
          </div>

          <div className="pl-actions">
            <span className="pl-count" aria-hidden="true">
              <b>{pad2(active + 1)}</b> / {pad2(n)}
            </span>

            {/* Quick Fullscreen Button */}
            {currentSlide.title && (
              <button
                type="button"
                onClick={() => onSelect?.(currentSlide, active)}
                className="pl-action-btn bg-white/10 hover:bg-[#f96e03] hover:text-[#1E1810] text-white border border-white/20 backdrop-blur-md"
                aria-label="Ver a pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ampliar</span>
              </button>
            )}

            {/* Previous */}
            <button
              type="button"
              className="pl-btn"
              aria-label="Anterior"
              onClick={() => step(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next */}
            <button
              type="button"
              className="pl-btn"
              aria-label="Siguiente"
              onClick={() => step(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Fast Scrubber (Timeline Slider) */}
        {n > 1 && (
          <div className="pl-scrubber">
            <span className="text-[11px] font-mono font-bold text-[#f96e03] min-w-[28px] text-right">
              {pad2(active + 1)}
            </span>
            <input
              type="range"
              min={0}
              max={n - 1}
              value={active}
              onInput={(e) => onScrub(Number((e.target as HTMLInputElement).value))}
              onChange={(e) => onScrub(Number(e.target.value))}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="pl-range"
              aria-label="Deslizar rápidamente por las obras"
            />
            <span className="text-[11px] font-mono text-white/50 min-w-[28px]">
              {pad2(n)}
            </span>
          </div>
        )}
      </div>

      <div className="pl-sr" aria-live="polite">
        {`Obra ${active + 1} de ${n}${currentSlide.title ? ": " + currentSlide.title : ""}`}
      </div>
    </div>
  )
}
