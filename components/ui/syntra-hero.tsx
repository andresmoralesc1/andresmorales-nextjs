'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent, ReactElement, ReactNode, SVGProps } from 'react'
import { AnimatePresence, LazyMotion, animate, domAnimation, m, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { ArrowRight, Cable, ChartNoAxesColumnIncreasing, FilePen, Menu, MousePointer2, Play, ShieldCheck, Star, Users, Workflow, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Block stylesheet (was components/motionuikit/sections/syntra/index.css). Inlined because a published component is a single file.
const BLOCK_CSS = `
/* components/motionuikit/sections/syntra/index.css */
@import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap');

:root {
  --color-n3-page: #f8f7f3;
  --color-n3-ink: #171717;
  --color-n3-grey: #74716c;
  --color-n3-line: #d9d6d0;
  --color-n3-accent: #ff7a2f;

  /* Onest, loaded from Google Fonts in index.tsx. */
  --font-n3-sans: 'Onest', ui-sans-serif, system-ui, sans-serif;
}

/* Tokens are named for their role, so the markup survives a palette change. */

/* Tailwind v4 class polyfills for Tailwind v3 compatibility */
.n3-root {
  font-family: var(--font-n3-sans) !important;
  color: var(--color-n3-ink);
}

[class*="text-(color:--color-n3-ink)"] { color: var(--color-n3-ink) !important; }
[class*="text-(color:--color-n3-grey)"] { color: var(--color-n3-grey) !important; }
[class*="text-(color:--color-n3-accent)"] { color: var(--color-n3-accent) !important; }
[class*="bg-(color:--color-n3-accent)"] { background-color: var(--color-n3-accent) !important; }
[class*="bg-(color:--color-n3-ink)"] { background-color: var(--color-n3-ink) !important; }
[class*="border-(color:--color-n3-line)"] { border-color: var(--color-n3-line) !important; }
[class*="border-(color:--color-n3-ink)"] { border-color: var(--color-n3-ink) !important; }
[class*="border-(color:--color-n3-ink)/8"] { border-color: rgb(23 23 23 / 0.08) !important; }
[class*="font-(family-name:--font-n3-sans)"] { font-family: var(--font-n3-sans) !important; }
[class*="hover:text-(color:--color-n3-accent)"]:hover { color: var(--color-n3-accent) !important; }
[class*="focus-visible:text-(color:--color-n3-accent)"]:focus-visible { color: var(--color-n3-accent) !important; }
[class*="focus-visible:outline-(color:--color-n3-accent)"]:focus-visible { outline-color: var(--color-n3-accent) !important; }
[class*="focus-visible:outline-(color:--color-n3-ink)"]:focus-visible { outline-color: var(--color-n3-ink) !important; }

.h-13 { height: 3.25rem !important; }
@media (min-width: 640px) {
  .sm\\:h-13 { height: 3.25rem !important; }
}
.h-18 { height: 4.5rem !important; }
.max-w-360 { max-width: 90rem !important; }

/* ---------- One alignment system: the nav and the hero share it ---------- */
.n3-root {
  --n3-gutter: 20px;
  --n3-nav-space: 76px; /* replaced by the measured height of the real nav */
}

@media (min-width: 640px) {
  .n3-root {
    --n3-gutter: 32px;
  }
}

@media (min-width: 1024px) {
  .n3-root {
    --n3-gutter: 56px;
  }
}

.n3-frame {
  padding-left: var(--n3-gutter);
  padding-right: var(--n3-gutter);
}

/* dvh, not vh: on mobile 100vh is the large viewport and would overflow under the URL bar. */
.n3-hero {
  min-height: calc(100dvh - var(--n3-nav-space));
}

@media (max-width: 1023px) {
  .n3-hero {
    min-height: 0;
  }
}

/* ---------- Type ---------- */
.n3-h1 {
  font-size: clamp(2.5rem, 1.1rem + 3.6vw, 4.35rem);
  line-height: 1.06;
  letter-spacing: -0.035em;
}

/* ---------- Background: warm paper, one soft light behind the visual ---------- */
.n3-bg {
  background:
    radial-gradient(ellipse 60% 70% at 74% 52%, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0) 70%),
    radial-gradient(ellipse 40% 45% at 78% 58%, rgb(255 122 47 / 0.07) 0%, rgb(255 122 47 / 0) 70%),
    radial-gradient(ellipse 50% 40% at 100% 0%, rgb(233 230 223 / 0.7) 0%, rgb(233 230 223 / 0) 70%),
    var(--color-n3-page);
}

.n3-halo {
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0));
}

/* The floor grid runs under the whole hero: clearest beneath the visual and along the bottom,
   dissolving toward the top left so the headline sits on clean paper. */
.n3-floor,
.n3-floor-lit {
  --n3-floor-area: radial-gradient(ellipse 75% 80% at 72% 70%, #000 20%, transparent 100%);

  /* The lines also dissolve into the right edge and the bottom of the hero instead of stopping. */
  --n3-floor-edges:
    linear-gradient(to left, transparent 0%, #000 22%), linear-gradient(to top, transparent 0%, #000 28%);

  -webkit-mask-image: var(--n3-floor-area), var(--n3-floor-edges);
  mask-image: var(--n3-floor-area), var(--n3-floor-edges);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

.n3-floor {
  opacity: 0.35;
}

/* The spotlight: a soft round window onto an orange copy of the grid. Both move by transform
   only (see hero-floor.tsx), so following the cursor costs no repaints. */
.n3-floor-spot {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 400ms ease;
  will-change: transform, opacity;
  -webkit-mask-image: radial-gradient(closest-side, #000 0%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 0%, transparent 100%);
}

.n3-floor-lit {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

[data-spot='on'] > .n3-floor-spot {
  opacity: 0.7;
}

@media (max-width: 1023px) {
  .n3-floor,
  .n3-floor-lit {
    --n3-floor-area: radial-gradient(ellipse 90% 60% at 50% 75%, #000 20%, transparent 100%);
  }
}

/* The orbits and construction lines dissolve toward the copy instead of running under it. */
.n3-fade-edge {
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 14%);
  mask-image: linear-gradient(to right, transparent 0%, #000 14%);
}

@media (max-width: 1023px) {
  .n3-fade-edge {
    -webkit-mask-image: none;
    mask-image: none;
  }
}

/* ---------- Nav ---------- */
/* backdrop-filter doesn't transition, so the background and border fade and the blur switches. */
.n3-nav-bar {
  border-bottom: 1px solid transparent;
  transition:
    background-color 300ms ease,
    border-color 300ms ease;
}

.n3-nav-bar-scrolled {
  background-color: rgb(248 247 243 / 0.78);
  border-bottom-color: rgb(23 23 23 / 0.06);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

/* ---------- Label flip: every button's label turns over like a cube on hover ---------- */
/* Two identical faces of a cube --d deep: the label in front, its twin on the bottom face.
   The button never moves; only the cube rotates about its horizontal axis. */
.n3-flip {
  perspective: 600px;
}

.n3-flip-box {
  --d: 0.75em;
  display: inline-grid;
  transform-style: preserve-3d;
  transform: translateZ(calc(var(--d) * -1)) rotateX(0deg);
  transition: transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
}

.n3-flip-face {
  grid-area: 1 / 1;
  display: inline-flex;
  height: 1.5em;
  align-items: center;
  justify-content: center;
  line-height: 1.5em;
  backface-visibility: hidden;
  transform: translateZ(var(--d));
}

.n3-flip-back {
  transform: rotateX(-90deg) translateZ(var(--d));
}

.n3-flip:hover .n3-flip-box,
.n3-flip:focus-visible .n3-flip-box {
  transform: translateZ(calc(var(--d) * -1)) rotateX(90deg);
}

@media (prefers-reduced-motion: reduce) {
  .n3-flip-box {
    transition: none;
  }

  .n3-flip:hover .n3-flip-box,
  .n3-flip:focus-visible .n3-flip-box {
    transform: translateZ(calc(var(--d) * -1));
  }
}

/* ---------- Eyebrow dot ---------- */
.n3-dot {
  box-shadow: 0 0 0 4px rgb(255 122 47 / 0.14);
}

/* ---------- Intro ---------- */
/* CSS, not motion: the copy, nav and core play in from the first paint instead of waiting for
   hydration, so the largest text is painted (and LCP recorded) without the JavaScript. Each
   element sets its own animation-delay. Fill 'backwards', not 'both': a finished animation left
   filling would keep the header a backdrop root and stop the nav bar's blur reaching the page. */
.n3-rise {
  animation: n3-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.n3-drop {
  animation: n3-drop 600ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.n3-enter {
  animation: n3-enter 1100ms cubic-bezier(0.22, 1, 0.36, 1) 250ms backwards;
}

@keyframes n3-rise {
  from {
    opacity: 0;
    translate: 0 18px;
  }
}

@keyframes n3-drop {
  from {
    opacity: 0;
    translate: 0 -12px;
  }
}

@keyframes n3-enter {
  from {
    opacity: 0;
    scale: 0.97;
  }
}

@media (prefers-reduced-motion: reduce) {
  .n3-rise,
  .n3-drop,
  .n3-enter {
    animation: none;
  }
}

/* ---------- Core motion: all of it slow, none of it on the same property as a script ---------- */
@keyframes n3-float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(var(--n3-float, 6) * -1px));
  }
}

.n3-float {
  animation: n3-float var(--n3-float-seconds, 6.5s) ease-in-out infinite alternate;
}

@keyframes n3-seam {
  from {
    opacity: 0.78;
  }
  to {
    opacity: 1;
  }
}

.n3-seam-pulse {
  animation: n3-seam 4.8s ease-in-out infinite alternate;
}

@media (prefers-reduced-motion: reduce) {
  .n3-float,
  .n3-seam-pulse {
    animation: none;
  }
}

/* ---------- Stage cards: light glass that hides the lines behind the type ---------- */
.n3-stage-card {
  border: 1px solid rgb(23 23 23 / 0.06);
  border-radius: 1.3em;
  background: rgb(255 255 255 / 0.82);
  box-shadow:
    0 1px 2px rgb(60 50 40 / 0.04),
    0 14px 34px -18px rgb(90 78 62 / 0.3),
    inset 0 1px 0 rgb(255 255 255 / 0.9);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transition:
    border-color 300ms ease,
    box-shadow 300ms ease;
}

.n3-stage-card-lit {
  border-color: rgb(255 122 47 / 0.35);
  box-shadow:
    0 1px 2px rgb(60 50 40 / 0.04),
    0 18px 38px -18px rgb(255 122 47 / 0.4),
    inset 0 1px 0 rgb(255 255 255 / 0.9);
}

/* On small laptops the visual is too narrow for the app logos beside the text; the cards keep
   their number, icon, title and outputs. */
@container (max-width: 640px) {
  .n3-stage-apps {
    display: none;
  }
}
`

// ───── components/motionuikit/sections/syntra/geometry.ts ─────
/**
 * Shared isometric geometry. Everything on the core is a rounded square in a flat plane,
 * projected with the same 2:1 isometric matrix, so faces, seams and inlays all agree.
 */

const ISO_X = 0.866
const ISO_Y = 0.5

const CX = 500
const CY = 500

// Isometric ring flattening (true isometric circle height / width).
const RING_FLATTEN = 0.57

// Horizontal radii of the two orbits around the core, inner and outer.
const RING_RX = [400, 530] as const

type SlabType = {
  // half the side length of the square footprint
  half: number

  // corner radius of the footprint
  radius: number

  // screen y of the top face centre
  top: number

  // vertical thickness
  depth: number
}

// Stack, bottom to top. Each slab sits `gap` above the one below it; the gap is where the light lives.
const BASE: SlabType = { half: 168, radius: 40, top: 475, depth: 34 }
const SEAM_GAP = 9
const MID: SlabType = { half: 151, radius: 36, top: BASE.top - SEAM_GAP - 28, depth: 28 }
const CAP: SlabType = { half: 101, radius: 28, top: MID.top - 14, depth: 14 }

type Point = [number, number]

// Server and browser can disagree in the last float digit, which React reports as a hydration mismatch.
const round = (n: number) => Math.round(n * 100) / 100

const project = (x: number, y: number, cx = CX, cy = CY): Point => {
  return [cx + (x - y) * ISO_X, cy + (x + y) * ISO_Y]
}

// Rounded square in plane coordinates, walked once around.
const footprint = (half: number, radius: number, steps = 14): Point[] => {
  const r = Math.min(radius, half)
  const c = half - r

  const corners: [number, number, number][] = [
    [c, c, 0],
    [-c, c, 90],
    [-c, -c, 180],
    [c, -c, 270]
  ]

  const pts: Point[] = []

  for (const [ox, oy, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const a = ((start + (90 * i) / steps) * Math.PI) / 180

      pts.push([ox + r * Math.cos(a), oy + r * Math.sin(a)])
    }
  }

  return pts
}

const toPath = (pts: Point[]) => `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`

const topPath = (slab: SlabType, inset = 0, cx = CX, dy = 0) => {
  const half = slab.half - inset
  const radius = Math.max(slab.radius - inset, 1)

  return toPath(footprint(half, radius).map(([x, y]) => project(x, y, cx, slab.top + dy)))
}

// A vertically extruded convex shape is the convex hull of its top and bottom outlines.
const hull = (points: Point[]): Point[] => {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

  const build = (list: Point[]) => {
    const out: Point[] = []

    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop()
      out.push(p)
    }

    out.pop()

    return out
  }

  return [...build(pts), ...build([...pts].reverse())]
}

const bodyPath = (slab: SlabType, inset = 0) => {
  const half = slab.half - inset
  const radius = Math.max(slab.radius - inset, 1)
  const outline = footprint(half, radius)
  const upper = outline.map(([x, y]) => project(x, y, CX, slab.top))
  const lower = outline.map(([x, y]) => project(x, y, CX, slab.top + slab.depth))

  return toPath(hull([...upper, ...lower]))
}

// A point on one of the two visible side faces. u runs along the face, v down its thickness.
const facePoint = (slab: SlabType, side: 'left' | 'right', u: number, v: number): Point => {
  const { half, top, depth } = slab

  if (side === 'left') {
    const [x, y] = project(-half + 2 * half * u, half, CX, top)

    return [x, y + depth * v]
  }

  const [x, y] = project(half, half - 2 * half * u, CX, top)

  return [x, y + depth * v]
}

// Transform that lays a local (x, y) rectangle onto a side face, or onto a top plane.
const FACE_MATRIX = {
  left: `${ISO_X} ${ISO_Y} 0 1`,
  right: `${ISO_X} ${-ISO_Y} 0 1`,
  top: `${ISO_X} ${ISO_Y} ${-ISO_X} ${ISO_Y}`
}

const ringPoint = (rx: number, angleDeg: number): Point => {
  const a = (angleDeg * Math.PI) / 180

  return [round(CX + rx * Math.cos(a)), round(CY + rx * RING_FLATTEN * Math.sin(a))]
}

const ringPath = (rx: number) => {
  const ry = rx * RING_FLATTEN

  return `M${CX + rx} ${CY}A${rx} ${ry} 0 1 1 ${CX - rx} ${CY}A${rx} ${ry} 0 1 1 ${CX + rx} ${CY}Z`
}

// ───── assets/motionuikit/svg/am-logo-mark.tsx ─────
// Precise vector paths extracted from public/logo-wp.png
// The iconic Andrés Morales "AM" monogram with geometric legs and 3 orange core dots.
const PATH_M =
  'M 2.16 -10.01 L 0.90 -7.18 L 1.06 9.30 L 1.84 7.81 L 4.43 7.50 L 5.53 8.28 L 5.93 9.38 L 6.40 9.61 L 6.40 -5.53 L 7.81 -6.95 L 21.70 -6.95 L 22.80 -6.16 L 23.43 -4.59 L 23.51 11.26 L 25.00 12.44 L 27.12 12.44 L 28.37 11.81 L 28.92 10.63 L 28.92 -6.24 L 27.98 -9.06 L 25.86 -11.18 L 23.04 -12.44 L 6.47 -12.44 L 3.96 -11.50 Z'
const PATH_A =
  'M -18.64 -11.81 L -20.13 -10.32 L -21.39 -7.81 L -21.47 -7.02 L -23.27 -3.73 L -23.35 -2.94 L -25.15 0.35 L -25.23 1.14 L -27.04 4.43 L -27.12 5.22 L -28.92 9.06 L -26.72 7.81 L -25.39 8.12 L -23.66 9.54 L -23.35 10.79 L -23.66 11.58 L -23.43 11.58 L -18.17 0.27 L -18.09 -0.51 L -16.91 -2.55 L -16.83 -3.34 L -15.74 -4.43 L -14.40 -4.43 L -13.62 -3.65 L -12.68 -1.77 L -12.60 -0.98 L -8.59 6.71 L -8.52 7.50 L -6.32 11.89 L -5.93 11.89 L -5.45 12.44 L -3.02 12.44 L -1.45 11.50 L -0.90 10.32 L -1.22 8.20 L -10.32 -10.32 L -11.50 -11.50 L -13.38 -12.44 L -17.07 -12.44 Z'

const CIRCLE_0 = { cx: -15.15, cy: 3.70, r: 2.78 }
const CIRCLE_1 = { cx: 14.79, cy: 4.80, r: 2.83 }
const CIRCLE_2 = { cx: 14.85, cy: -2.31, r: 2.89 }

type AMLogoMarkProps = {
  fill?: string
  fillDark?: string
  fillOrange?: string
  stroke?: string
  strokeDark?: string
  strokeOrange?: string
  strokeWidth?: number
  fades?: boolean
  opacity?: number
}

// The official Andrés Morales AM monogram: A with apex & orange center, M with open portal & 2 orange dots
const AMLogoMark = ({
  fill,
  fillDark,
  fillOrange,
  stroke,
  strokeDark,
  strokeOrange,
  strokeWidth = 0.6,
  fades = false,
  opacity = 1
}: AMLogoMarkProps) => {
  const dFill = fillDark ?? fill ?? '#171717'
  const oFill = fillOrange ?? fill ?? '#FF7A2F'
  const dStroke = strokeDark ?? stroke
  const oStroke = strokeOrange ?? stroke

  return (
    <g opacity={opacity}>
      <path
        d={PATH_A}
        fill={dFill}
        stroke={dStroke}
        strokeWidth={dStroke ? strokeWidth : undefined}
      />
      <path
        d={PATH_M}
        fill={dFill}
        stroke={dStroke}
        strokeWidth={dStroke ? strokeWidth : undefined}
      />
      <circle
        cx={CIRCLE_0.cx}
        cy={CIRCLE_0.cy}
        r={CIRCLE_0.r}
        fill={oFill}
        stroke={oStroke}
        strokeWidth={oStroke ? strokeWidth : undefined}
      />
      <circle
        cx={CIRCLE_1.cx}
        cy={CIRCLE_1.cy}
        r={CIRCLE_1.r}
        fill={oFill}
        stroke={oStroke}
        strokeWidth={oStroke ? strokeWidth : undefined}
      />
      <circle
        cx={CIRCLE_2.cx}
        cy={CIRCLE_2.cy}
        r={CIRCLE_2.r}
        fill={oFill}
        stroke={oStroke}
        strokeWidth={oStroke ? strokeWidth : undefined}
      />
    </g>
  )
}

// Alias for compatibility
const SyntraLeaves = AMLogoMark

// ───── assets/motionuikit/svg/syntra-core-parts.tsx ─────
/**
 * The parts the resting core and its exploded view are both drawn from. Each slab is a rounded
 * square in an isometric plane; depth comes from the extruded side faces, bevels, and gradients
 * that assume light from the upper left.
 */

const ORANGE = '#FF7A2F'

type FaceProps = { slab: SlabType; side: 'left' | 'right'; u: number; v: number }

const FaceMark = ({
  slab,
  side,
  u,
  v,
  w,
  h,
  fill,
  glow
}: FaceProps & { w: number; h: number; fill: string; glow?: boolean }) => {
  // Vars
  const [x, y] = facePoint(slab, side, u, v)

  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) matrix(${FACE_MATRIX[side]} 0 0)`}>
      {glow && (
        <rect
          x={-w / 2 - 2}
          y={-h / 2 - 3}
          width={w + 4}
          height={h + 6}
          rx={h}
          fill={fill}
          filter='url(#n3-blur-sm)'
          opacity='0.75'
        />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} />
    </g>
  )
}

type PanelLineProps = {
  slab: SlabType
  side: 'left' | 'right'
  v: number
  from?: number
  to?: number
}

// A thin panel line running along a side face.
const PanelLine = ({ slab, side, v, from = 0.14, to = 0.86 }: PanelLineProps) => {
  // Vars
  const [x1, y1] = facePoint(slab, side, from, v)
  const [x2, y2] = facePoint(slab, side, to, v)

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke='#A7A298' strokeWidth='0.9' opacity='0.55' />
}

type FastenerProps = { slab: SlabType; x: number; y: number }

// A round fastener sunk into a top face, laid in the plane.
const Fastener = ({ slab, x, y }: FastenerProps) => {
  // Vars
  const [px, py] = project(x, y, CX, slab.top)

  return (
    <g transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) matrix(${FACE_MATRIX.top} 0 0)`}>
      <circle r='6.5' fill='url(#n3-hole)' stroke='#C9C5BB' strokeWidth='1' />
    </g>
  )
}

const SlabBody = ({ slab }: { slab: SlabType }) => {
  return (
    <g>
      <path d={bodyPath(slab)} fill='url(#n3-side)' />
      <path d={bodyPath(slab)} fill='url(#n3-side-shade)' />
      <path d={bodyPath(slab)} fill='none' stroke='#CFCBC1' strokeWidth='1' opacity='0.85' />
    </g>
  )
}

const SlabTop = ({ slab, groove }: { slab: SlabType; groove?: number }) => {
  return (
    <g>
      <path d={topPath(slab)} fill='url(#n3-bevel)' stroke='#D9D6D0' strokeWidth='1' />
      <path d={topPath(slab, 4.5)} fill='url(#n3-top)' stroke='#fff' strokeWidth='1' opacity='1' />
      {groove !== undefined && <path d={topPath(slab, groove)} fill='none' stroke='#DAD6CE' strokeWidth='1.2' />}
    </g>
  )
}

// Side colours of the mark's extrusion, bottom layer first: darker where it meets the plate.
const LOGO_DARK_SIDE = ['#171614', '#1F1E1A', '#292621', '#34312A', '#413C33', '#4F4A3F']
const LOGO_ORANGE_SIDE = ['#B24C19', '#C3531C', '#D15A1F', '#DC6022', '#E46525', '#EA6A28']
const LOGO_SCALE = 1.42

/**
 * The Andrés Morales AM mark as a precision solid object standing on the ceramic top face:
 * stepped 3D obsidian/dark titanium extrusion with 3 illuminated cylindrical orange cores.
 */
const CoreLogo = ({ x, y }: { x: number; y: number }) => {
  // Vars
  const plane = (lift: number) => `translate(${x} ${y - lift}) matrix(${FACE_MATRIX.top} 0 0) scale(${LOGO_SCALE})`
  const top = LOGO_DARK_SIDE.length

  return (
    <g>
      {/* Soft contact shadow */}
      <g transform={`${plane(0)} translate(2.4 2.4)`} opacity='0.22' filter='url(#n3-blur-sm)'>
        <AMLogoMark fillDark='#6E6556' fillOrange='#6E6556' />
      </g>
      {/* Stepped extrusion layers */}
      {LOGO_DARK_SIDE.map((darkFill, k) => (
        <g key={darkFill} transform={plane(k)}>
          <AMLogoMark fillDark={darkFill} fillOrange={LOGO_ORANGE_SIDE[k]} />
        </g>
      ))}
      {/* Top face plate with lit gradients and fine metallic rims */}
      <g transform={plane(top)}>
        {/* Dark body top plate */}
        <rect x='-35' y='-20' width='70' height='40' fill='url(#n3-dark-top)' clipPath='url(#n3-dark-clip)' />
        {/* Orange dots top plate */}
        <rect x='-35' y='-20' width='70' height='40' fill='url(#n3-logo-top)' clipPath='url(#n3-orange-clip)' />
        {/* Precision rim highlight strokes */}
        <path d={PATH_A} fill='none' stroke='#8A8275' strokeWidth='0.6' />
        <path d={PATH_M} fill='none' stroke='#8A8275' strokeWidth='0.6' />
        <circle cx={CIRCLE_0.cx} cy={CIRCLE_0.cy} r={CIRCLE_0.r} fill='none' stroke='#FFE2CC' strokeWidth='0.6' />
        <circle cx={CIRCLE_1.cx} cy={CIRCLE_1.cy} r={CIRCLE_1.r} fill='none' stroke='#FFE2CC' strokeWidth='0.6' />
        <circle cx={CIRCLE_2.cx} cy={CIRCLE_2.cy} r={CIRCLE_2.r} fill='none' stroke='#FFE2CC' strokeWidth='0.6' />
      </g>
      {/* Elevated glowing jewels: the 3 orange cores lift 1 step higher */}
      <g transform={plane(top + 1)}>
        <circle cx={CIRCLE_0.cx} cy={CIRCLE_0.cy} r={CIRCLE_0.r} fill='url(#n3-logo-top)' stroke='#FFF0E6' strokeWidth='0.4' />
        <circle cx={CIRCLE_1.cx} cy={CIRCLE_1.cy} r={CIRCLE_1.r} fill='url(#n3-logo-top)' stroke='#FFF0E6' strokeWidth='0.4' />
        <circle cx={CIRCLE_2.cx} cy={CIRCLE_2.cy} r={CIRCLE_2.r} fill='url(#n3-logo-top)' stroke='#FFF0E6' strokeWidth='0.4' />
      </g>
    </g>
  )
}

const CoreDefs = () => {
  return (
    <defs>
      <linearGradient id='n3-side' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stopColor='#F3F1EB' />
        <stop offset='0.46' stopColor='#E9E6DF' />
        <stop offset='0.5' stopColor='#DAD6CD' />
        <stop offset='1' stopColor='#E3DFD7' />
      </linearGradient>
      <linearGradient id='n3-side-shade' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0.45' stopColor='#7C7566' stopOpacity='0' />
        <stop offset='1' stopColor='#7C7566' stopOpacity='0.16' />
      </linearGradient>
      <linearGradient id='n3-bevel' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='#FFFFFF' />
        <stop offset='1' stopColor='#E6E2DA' />
      </linearGradient>
      <linearGradient id='n3-top' x1='0.1' y1='0' x2='0.9' y2='1'>
        <stop offset='0' stopColor='#FFFFFF' />
        <stop offset='1' stopColor='#F2EFE9' />
      </linearGradient>
      <linearGradient id='n3-inlay' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='#EFEBE4' />
        <stop offset='1' stopColor='#FFFFFF' />
      </linearGradient>
      <linearGradient id='n3-seam' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stopColor='#FFC59F' />
        <stop offset='0.5' stopColor={ORANGE} />
        <stop offset='1' stopColor='#FFA470' />
      </linearGradient>
      <linearGradient id='n3-slot' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stopColor='#5F5A52' />
        <stop offset='1' stopColor='#8E897F' />
      </linearGradient>
      <linearGradient id='n3-dark-top' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='#332E27' />
        <stop offset='0.55' stopColor='#23201C' />
        <stop offset='1' stopColor='#171614' />
      </linearGradient>
      <linearGradient id='n3-logo-top' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='#FFB07C' />
        <stop offset='0.55' stopColor='#FF8442' />
        <stop offset='1' stopColor='#FF6E24' />
      </linearGradient>
      <clipPath id='n3-dark-clip'>
        <path d={PATH_A} fill='#000' />
        <path d={PATH_M} fill='#000' />
      </clipPath>
      <clipPath id='n3-orange-clip'>
        <circle cx={CIRCLE_0.cx} cy={CIRCLE_0.cy} r={CIRCLE_0.r} fill='#000' />
        <circle cx={CIRCLE_1.cx} cy={CIRCLE_1.cy} r={CIRCLE_1.r} fill='#000' />
        <circle cx={CIRCLE_2.cx} cy={CIRCLE_2.cy} r={CIRCLE_2.r} fill='#000' />
      </clipPath>
      <clipPath id='n3-mark-clip'>
        <AMLogoMark fill='#000' />
      </clipPath>
      <radialGradient id='n3-hole' cx='0.5' cy='0.4' r='0.7'>
        <stop offset='0' stopColor='#D9D5CC' />
        <stop offset='1' stopColor='#F3F1EB' />
      </radialGradient>
      <filter id='n3-blur-sm' x='-40%' y='-40%' width='180%' height='180%'>
        <feGaussianBlur stdDeviation='3.5' />
      </filter>
      <filter id='n3-blur-glow' x='-40%' y='-40%' width='180%' height='180%'>
        <feGaussianBlur stdDeviation='9' />
      </filter>
      <filter id='n3-blur-spill' x='-40%' y='-40%' width='180%' height='180%'>
        <feGaussianBlur stdDeviation='18' />
      </filter>
    </defs>
  )
}

// ───── assets/motionuikit/svg/syntra-core-object.tsx ─────
const ORANGE2 = '#FF7A2F'

/**
 * The core at rest: three ceramic slabs (base, mid, cap), each a rounded square laid in an isometric
 * plane, with a light seam between the base and mid slabs and the mark inlaid on the cap.
 */
const SyntraCoreObject = (props: SVGProps<SVGSVGElement>) => {
  // Vars
  const seam: SlabType = {
    half: MID.half - 2,
    radius: MID.radius - 2,
    top: MID.top + MID.depth - 1,
    depth: SEAM_GAP + 1
  }

  const spillDy = BASE.top - MID.top
  const [logoX, logoY] = [CX, CAP.top]

  return (
    <svg viewBox='0 0 1000 1000' role='img' aria-label='The syntra core' {...props}>
      <CoreDefs />

      {/* Base slab, a tray the others sit in. */}
      <SlabBody slab={BASE} />
      <SlabTop slab={BASE} groove={10} />
      <PanelLine slab={BASE} side='left' v={0.3} />
      <PanelLine slab={BASE} side='right' v={0.3} />
      <FaceMark slab={BASE} side='right' u={0.5} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
      <FaceMark slab={BASE} side='right' u={0.58} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
      <FaceMark slab={BASE} side='right' u={0.66} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
      <FaceMark slab={BASE} side='left' u={0.32} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
      <FaceMark slab={BASE} side='left' u={0.4} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />

      {/* Light from the seam spills onto the tray and out along its own edge. */}
      <g className='n3-seam-pulse'>
        <path d={topPath(MID, 4, CX, spillDy)} fill={ORANGE2} opacity='0.24' filter='url(#n3-blur-spill)' />
        <path d={bodyPath(seam)} fill={ORANGE2} opacity='0.6' filter='url(#n3-blur-glow)' />
      </g>
      <path d={bodyPath(seam)} fill='url(#n3-seam)' />

      {/* Mid slab. */}
      <SlabBody slab={MID} />
      <SlabTop slab={MID} groove={11} />
      <PanelLine slab={MID} side='left' v={0.78} />
      <PanelLine slab={MID} side='right' v={0.78} />
      <FaceMark slab={MID} side='left' u={0.62} v={0.42} w={34} h={7.5} fill='url(#n3-slot)' />
      <FaceMark slab={MID} side='left' u={0.34} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
      <FaceMark slab={MID} side='left' u={0.42} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
      <FaceMark slab={MID} side='right' u={0.44} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
      <FaceMark slab={MID} side='right' u={0.52} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
      <FaceMark slab={MID} side='right' u={0.68} v={0.42} w={22} h={4.5} fill='url(#n3-slot)' />
      <g className='n3-seam-pulse'>
        <FaceMark slab={MID} side='left' u={0.2} v={0.42} w={7} h={2.6} fill={ORANGE2} glow />
      </g>

      <Fastener slab={MID} x={0} y={-MID.half + 28} />
      <Fastener slab={MID} x={-MID.half + 28} y={0} />
      <Fastener slab={MID} x={MID.half - 28} y={0} />
      <Fastener slab={MID} x={0} y={MID.half - 28} />

      {/* Cap slab and its inlaid mark. */}
      <SlabBody slab={CAP} />
      <SlabTop slab={CAP} />
      <path d={topPath(CAP, 19)} fill='url(#n3-inlay)' stroke='#DDD9D1' strokeWidth='1.2' />
      <path d={topPath(CAP, 20.5)} fill='none' stroke='#fff' strokeWidth='1' opacity='0.9' />

      <CoreLogo x={logoX} y={logoY} />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-core-shadow.tsx ─────
// The soft contact shadow under the core, laid on the floor plane below the base slab.
const SyntraCoreShadow = (props: SVGProps<SVGSVGElement>) => {
  // Vars
  const floor = { ...BASE, top: BASE.top + BASE.depth + 30 }

  return (
    <svg viewBox='0 0 1000 1000' aria-hidden {...props}>
      <defs>
        <filter id='n3-blur-lg' x='-30%' y='-30%' width='160%' height='160%'>
          <feGaussianBlur stdDeviation='26' />
        </filter>
        <filter id='n3-blur-md' x='-30%' y='-30%' width='160%' height='160%'>
          <feGaussianBlur stdDeviation='9' />
        </filter>
      </defs>
      <path d={topPath(floor, -14)} fill='#8A8377' opacity='0.2' filter='url(#n3-blur-lg)' />
      <path d={topPath(floor, 6)} fill='#5D574D' opacity='0.22' filter='url(#n3-blur-md)' />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-depth-backdrop.tsx ─────
/**
 * Layers of quiet depth behind the stack: two panes of glass
 * standing behind, and a few loose nodes. All of it very low contrast.
 */
const NODES: [number, number][] = [
  [118, 132],
  [318, 82],
  [690, 96],
  [884, 188],
  [936, 470],
  [70, 512],
  [150, 858],
  [850, 846]
]

const SyntraDepthBackdrop = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 1000 1000' aria-hidden {...props}>
      <defs>
        <linearGradient id='n3-glass' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#fff' stopOpacity='0.7' />
          <stop offset='1' stopColor='#fff' stopOpacity='0.12' />
        </linearGradient>
      </defs>

      <g fill='url(#n3-glass)' stroke='#E3E0D9' strokeWidth='1' opacity='0.35'>
        <rect width='290' height='250' rx='22' transform='matrix(0.866 -0.5 0 1 232 300)' />
        <rect width='290' height='250' rx='22' transform='matrix(0.866 0.5 0 1 520 150)' />
      </g>

      <g fill='#fff' stroke='#CFCBC1' strokeWidth='1'>
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 3} opacity='0.85' />
        ))}
      </g>
    </svg>
  )
}

// ───── components/motionuikit/sections/syntra/config.ts ─────
// The dials: everything a designer is likely to tune lives here, in plain units.

const EASE = [0.22, 1, 0.36, 1] as const

const COPY = {
  eyebrow: 'The intelligent workflow platform',
  headline: ['Build, automate', 'and scale your', 'workflows with'],
  accentWord: 'AI.',
  body: 'Connect your tools, automate repetitive work, and give your team a single intelligent system for everything that matters.',
  primaryCta: 'Start Free',
  secondaryCta: 'See how it works'
}

const NAV_LINKS = [{ label: 'Product' }, { label: 'Solutions' }, { label: 'Resources' }, { label: 'Pricing' }]

const METRICS = [
  { value: '10K+', label: 'Active teams', icon: 'users' },
  { value: '4.9/5', label: 'Customer rating', icon: 'star' },
  { value: '99.9%', label: 'Uptime', icon: 'shield' }
] as const

const MOTION = {
  // Vertical drift of the core, in px of the 1000-unit artboard. Larger = more bob.
  floatDistance: 10,

  // Seconds for one float cycle. Larger = calmer.
  floatSeconds: 6.5,

  // Maximum tilt of the core toward the cursor, in degrees. Keep under ~4.
  tiltDegrees: 3.5,

  // How far the rings and dots slide against the core, in px. 0 = no depth.
  ringParallax: 12,
  backdropParallax: 5,

  // Seconds for one lap of the inner (clockwise) and outer (counter-clockwise) orbit. Larger = stiller.
  orbitSeconds: [70, 95],

  // How visible the orbits and their beads stay while the stack is open. 0 = gone, 1 = unchanged.
  orbitOpenOpacity: 0.15
}

const ARTBOARD = 1000

/**
 * The exploded view: bottom to top: data enters at the bottom plate and leaves as outcomes at the top. Each stage
 * names the apps shown on its card (see stage-card-body.tsx) and its own icon.
 */
const STAGES = [
  {
    title: 'E-commerce & Tiendas',
    items: ['Shopify', 'Next.js', 'Google'],
    apps: ['Shopify', 'Next.js', 'Google'],
    icon: 'sources',
    side: 'right'
  },
  {
    title: 'Desarrollo Web & Edge',
    items: ['Next.js', 'GitHub', 'Google'],
    apps: ['Next.js', 'GitHub', 'Google'],
    icon: 'context',
    side: 'left'
  },
  {
    title: 'Inteligencia Artificial',
    items: ['Claude', 'OpenAI', 'Gemini'],
    apps: ['Claude', 'OpenAI', 'Gemini'],
    side: 'right',
    main: true
  },
  {
    title: 'Automatización & Flujos',
    items: ['n8n', 'Zapier', 'WhatsApp'],
    apps: ['n8n', 'Zapier', 'WhatsApp'],
    icon: 'automation',
    side: 'left'
  },
  {
    title: 'Datos & Resultados',
    items: ['Excel', 'Google', 'Shopify'],
    apps: ['Excel', 'Google', 'Shopify'],
    icon: 'outcomes',
    side: 'right'
  }
] as const

type Stage = (typeof STAGES)[number]

// The AI layer is the main one: its card carries a "Main layer" tag and its apps on a row of their own.
const isMain = (stage: Stage) => 'main' in stage && stage.main

const EXPLODE = {
  // Spring that drives the whole reveal. Lower stiffness = slower, softer; higher damping = less settle.
  spring: { stiffness: 105, damping: 25, mass: 1 },

  // Distance between neighbouring plates once apart, in artboard units. Larger = a taller stack.
  gap: 94,

  // How far the AI plate rides above the rest of the stack, in artboard units.
  aiLift: 12,

  // Height of the top plate's face when apart. Raise to move the whole stack down.
  topPlateY: 230,

  // Later plates start a beat behind the AI plate. 0 = all move together; ~0.1 = a clear ripple.
  stagger: 0.05,

  /**
   * Size of each plate when apart, bottom to top, as a fraction of its stacked size.
   * Chosen so every plate's corner sits about the same distance from the centre, which gives
   * every card-to-plate connector the same length. Kept under 1 at the bottom so they clear the cards.
   */
  scales: [0.63, 0.62, 0.7, 1.07, 1.06]
}

/**
 * The stage cards, positioned in percentages of the visual's width per side. The inner edge
 * (edge + width) must clear the opened plates' corners (see EXPLODE.scales); a negative edge
 * overhangs the visual, which only the left side has room for, so it holds the longest title.
 */
const STAGE_CARDS = {
  left: { edge: -2, width: 31 },
  right: { edge: 0, width: 29 },

  /**
   * Cards only show while the stack is open. They start this many px toward the core and ease
   * out to this many px past their spot.
   */
  restInset: 10,
  outward: 2,

  // Seconds for a bead to run from a card to its plate while the stack is open.
  beadSeconds: 1.6
}

// ───── components/motionuikit/sections/syntra/explode-layout.ts ─────
/**
 * The five plates, one per stage, bottom to top, cut from the three stacked slabs so that,
 * together, they are the resting object exactly: the base is two plates, the mid slab is the AI
 * plate, the cap is two.
 */
const PLATE_SLABS: SlabType[] = [
  { ...BASE, top: BASE.top + 17, depth: 17 },
  { ...BASE, top: BASE.top, depth: 17 },
  MID,
  { ...CAP, top: CAP.top + 7, depth: 7 },
  { ...CAP, top: CAP.top, depth: 7 }
]

const AI_PLATE = 2

// Where each plate's top face sits once apart, and how far it travels to get there.
const TARGET_TOPS = PLATE_SLABS.map(
  (_, i) => EXPLODE.topPlateY + (PLATE_SLABS.length - 1 - i) * EXPLODE.gap - (i === AI_PLATE ? EXPLODE.aiLift : 0)
)

const TRAVEL = PLATE_SLABS.map((slab, i) => TARGET_TOPS[i] - slab.top)

const clamp = (v: number) => Math.min(1, Math.max(0, v))

// Progress of one plate, 0 stacked to 1 apart. The AI plate leads; the rest follow at a stagger.
const plateProgress = (i: number, p: number) => {
  const delay = Math.abs(i - AI_PLATE) * EXPLODE.stagger

  return clamp((p - delay) / (1 - delay))
}

const plateY = (i: number, p: number) => TRAVEL[i] * plateProgress(i, p)
const plateScale = (i: number, p: number) => 1 + (EXPLODE.scales[i] - 1) * plateProgress(i, p)

// Screen x of a plate's left/right corner tip once apart (rounded corners pull the tip in).
const tipOffset = (i: number) => {
  const { half, radius } = PLATE_SLABS[i]

  return 0.866 * (2 * half - 0.586 * radius) * EXPLODE.scales[i]
}

const tipX = (i: number, side: 'left' | 'right') => CX + (side === 'right' ? 1 : -1) * tipOffset(i)

// Screen y of the side corners (half way down the plate) once apart.
const cornerY = (i: number) => TARGET_TOPS[i] + PLATE_SLABS[i].depth / 2

// ───── assets/motionuikit/svg/syntra-exploded-core.tsx ─────
// Third-party Imports

const ORANGE3 = '#FF7A2F'

const clamp2 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Extra side thickness each plate grows once it is apart, bottom to top. The thin cap plates gain
 * the most; at rest it is zero, so the stack still matches the resting object exactly.
 */
const SKIRT = [0, 4, 0, 10, 10]

type PlateProps = {
  index: number
  progress: MotionValue<number>
  selected?: boolean
  onSelectLevel?: (index: number) => void
  children: ReactNode
}

const Plate = ({ index, progress, selected = false, onSelectLevel, children }: PlateProps) => {
  // Hooks
  const y = useTransform(progress, v => plateY(index, v))
  const scale = useTransform(progress, v => plateScale(index, v))
  const apart = useTransform(progress, v => plateProgress(index, v))
  const shadow = useTransform(apart, v => v * 0.16)

  // Vars
  const slab = PLATE_SLABS[index]
  const skirt = SKIRT[index]

  return (
    <m.g
      style={{ y, scale }}
      onClick={onSelectLevel ? () => onSelectLevel(index) : undefined}
      className={onSelectLevel ? 'cursor-pointer transition-opacity' : undefined}
    >
      {/* A soft shadow the plate casts on the one below it as they part. */}
      {index > 0 && (
        <m.path
          d={topPath(slab, -6, CX, slab.depth + 34)}
          fill='#6E6556'
          filter='url(#n3-blur-spill)'
          style={{ opacity: shadow }}
        />
      )}
      {skirt > 0 && (
        <m.g style={{ opacity: apart }}>
          <SlabBody slab={{ ...slab, top: slab.top + slab.depth - 1, depth: skirt + 1 }} />
        </m.g>
      )}
      {selected && (
        <path
          d={topPath(slab, 2)}
          fill='none'
          stroke='#FF7A2F'
          strokeWidth='2.2'
          opacity='0.95'
          filter='url(#n3-blur-sm)'
        />
      )}
      {children}
    </m.g>
  )
}

type PlateNumberProps = { slab: SlabType; n: number; main?: boolean }

/**
 * The stage number engraved into a plate's top face near its front corner, laid flat in the
 * surface so it reads as part of the ceramic: a soft groove with light catching its lower lip.
 */
const PlateNumber = ({ slab, n, main = false }: PlateNumberProps) => {
  // Vars
  const k = slab.half * 0.56
  const [x, y] = project(k, k, CX, slab.top)
  const plane = `matrix(${FACE_MATRIX.top} 0 0) rotate(-45)`
  const label = String(n).padStart(2, '0')

  const text = {
    textAnchor: 'middle' as const,
    dominantBaseline: 'central' as const,
    fontSize: 25,
    fontWeight: 500,
    letterSpacing: 2.5
  }

  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`} aria-hidden>
      <text {...text} transform={`translate(0 0.9) ${plane}`} fill='#FFFFFF' opacity='0.95'>
        {label}
      </text>
      <text {...text} transform={plane} fill={main ? '#FF8C4D' : '#CBC6BC'}>
        {label}
      </text>
    </g>
  )
}

// A little light coming up on the AI plate: a ring and core in its plane.
const AiEmphasis = ({ progress }: { progress: MotionValue<number> }) => {
  // Hooks
  const on = useTransform(progress, v => clamp2((v - 0.5) / 0.4))
  const rim = useTransform(on, v => v * 0.9)
  const halo = useTransform(on, v => v * 0.55)
  const spill = useTransform(halo, v => v * 0.35)

  return (
    <g transform={`translate(${CX} ${MID.top}) matrix(${FACE_MATRIX.top} 0 0)`}>
      <m.circle r='86' fill={ORANGE3} filter='url(#n3-blur-spill)' style={{ opacity: spill }} />
      <m.circle r='56' fill='none' stroke={ORANGE3} strokeWidth='1.4' style={{ opacity: rim }} />
      <m.circle r='38' fill='none' stroke={ORANGE3} strokeWidth='1' strokeDasharray='3 6' style={{ opacity: halo }} />
      <m.circle r='9' fill={ORANGE3} style={{ opacity: rim }} />
    </g>
  )
}

type SyntraExplodedCoreProps = Omit<SVGProps<SVGSVGElement>, 'onSelect'> & {
  progress: MotionValue<number>
  selectedLevel?: number | null
  onSelectLevel?: (index: number) => void
}

/**
 * The core taken apart into its five stage plates, driven by `progress`. The AI plate's underglow
 * strengthens as the stack opens, on top of the resting glow.
 */
const SyntraExplodedCore = ({ progress, selectedLevel, onSelectLevel, ...props }: SyntraExplodedCoreProps) => {
  // Hooks
  const strongGlow = useTransform(progress, v => clamp2((v - 0.4) / 0.5) * 0.6)

  // Vars
  const seam = { half: MID.half - 2, radius: MID.radius - 2, top: MID.top + MID.depth - 1, depth: SEAM_GAP + 1 }

  const inlay = (slab: (typeof PLATE_SLABS)[number]) => (
    <>
      <path d={topPath(slab, 19)} fill='url(#n3-inlay)' stroke='#DDD9D1' strokeWidth='1.2' />
      <path d={topPath(slab, 20.5)} fill='none' stroke='#fff' strokeWidth='1' opacity='0.9' />
    </>
  )

  return (
    <svg viewBox='0 0 1000 1000' aria-hidden {...props}>
      <CoreDefs />

      <Plate index={0} progress={progress} selected={selectedLevel === 0} onSelectLevel={onSelectLevel}>
        <SlabBody slab={PLATE_SLABS[0]} />
        <SlabTop slab={PLATE_SLABS[0]} groove={10} />
        <PlateNumber slab={PLATE_SLABS[0]} n={1} />
        <FaceMark slab={BASE} side='right' u={0.5} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
        <FaceMark slab={BASE} side='right' u={0.58} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
        <FaceMark slab={BASE} side='right' u={0.66} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
        <FaceMark slab={BASE} side='left' u={0.32} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
        <FaceMark slab={BASE} side='left' u={0.4} v={0.62} w={4.5} h={4.5} fill='url(#n3-slot)' />
      </Plate>

      <Plate index={1} progress={progress} selected={selectedLevel === 1} onSelectLevel={onSelectLevel}>
        <SlabBody slab={PLATE_SLABS[1]} />
        <SlabTop slab={PLATE_SLABS[1]} groove={10} />
        <PlateNumber slab={PLATE_SLABS[1]} n={2} />
        <PanelLine slab={BASE} side='left' v={0.3} />
        <PanelLine slab={BASE} side='right' v={0.3} />
      </Plate>

      <Plate index={AI_PLATE} progress={progress} selected={selectedLevel === 2} onSelectLevel={onSelectLevel}>
        <g className='n3-seam-pulse'>
          <path d={topPath(MID, 4, CX, BASE.top - MID.top)} fill={ORANGE3} opacity='0.24' filter='url(#n3-blur-spill)' />
          <path d={bodyPath(seam)} fill={ORANGE3} opacity='0.6' filter='url(#n3-blur-glow)' />
        </g>
        <m.path d={bodyPath(seam)} fill={ORANGE3} filter='url(#n3-blur-glow)' style={{ opacity: strongGlow }} />
        <path d={bodyPath(seam)} fill='url(#n3-seam)' />
        <SlabBody slab={MID} />
        <SlabTop slab={MID} groove={11} />
        <PlateNumber slab={MID} n={3} main />
        <PanelLine slab={MID} side='left' v={0.78} />
        <PanelLine slab={MID} side='right' v={0.78} />
        <FaceMark slab={MID} side='left' u={0.62} v={0.42} w={34} h={7.5} fill='url(#n3-slot)' />
        <FaceMark slab={MID} side='left' u={0.34} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
        <FaceMark slab={MID} side='left' u={0.42} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
        <FaceMark slab={MID} side='right' u={0.44} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
        <FaceMark slab={MID} side='right' u={0.52} v={0.42} w={5} h={5} fill='url(#n3-slot)' />
        <FaceMark slab={MID} side='right' u={0.68} v={0.42} w={22} h={4.5} fill='url(#n3-slot)' />
        <g className='n3-seam-pulse'>
          <FaceMark slab={MID} side='left' u={0.2} v={0.42} w={7} h={2.6} fill={ORANGE3} glow />
        </g>
        <Fastener slab={MID} x={0} y={-MID.half + 28} />
        <Fastener slab={MID} x={-MID.half + 28} y={0} />
        <Fastener slab={MID} x={MID.half - 28} y={0} />
        <Fastener slab={MID} x={0} y={MID.half - 28} />
        <AiEmphasis progress={progress} />
      </Plate>

      <Plate index={3} progress={progress} selected={selectedLevel === 3} onSelectLevel={onSelectLevel}>
        <SlabBody slab={PLATE_SLABS[3]} />
        <SlabTop slab={PLATE_SLABS[3]} />
        {inlay(PLATE_SLABS[3])}
        <PlateNumber slab={PLATE_SLABS[3]} n={4} />
      </Plate>

      <Plate index={4} progress={progress} selected={selectedLevel === 4} onSelectLevel={onSelectLevel}>
        <SlabBody slab={PLATE_SLABS[4]} />
        <SlabTop slab={PLATE_SLABS[4]} />
        {inlay(CAP)}
        <CoreLogo x={CX} y={CAP.top} />
      </Plate>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-orbital-system.tsx ─────
// Two orbits around the core. Their nodes ride them in opposite directions (see syntra-particles).
const SyntraOrbitalSystem = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 1000 1000' aria-hidden {...props}>
      <g fill='none' stroke='#D9D6D0' strokeWidth='1'>
        <ellipse cx={CX} cy={CY} rx={RING_RX[0]} ry={RING_RX[0] * RING_FLATTEN} opacity='0.8' />
        <ellipse cx={CX} cy={CY} rx={RING_RX[1]} ry={RING_RX[1] * RING_FLATTEN} opacity='0.65' />
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-particles.tsx ─────
type NodeType = { ring: 0 | 1; angle: number; size: number }

/**
 * Small crystal beads spaced evenly around each orbit: four on the inner, five on the outer. Every
 * bead on an orbit shares its lap time, so they keep their spacing; the inner orbit runs
 * clockwise and the outer one against it.
 */
const NODES2: NodeType[] = [
  { ring: 0, angle: 20, size: 7 },
  { ring: 0, angle: 110, size: 5.5 },
  { ring: 0, angle: 200, size: 8 },
  { ring: 0, angle: 290, size: 6 },
  { ring: 1, angle: 60, size: 6 },
  { ring: 1, angle: 132, size: 8 },
  { ring: 1, angle: 204, size: 5.5 },
  { ring: 1, angle: 276, size: 7 },
  { ring: 1, angle: 348, size: 6.5 }
]

/**
 * A small sphere of amber glass: light at the upper left deepening to orange at the lower right,
 * a rim that is bright on top and darker below, a crisp specular highlight, and light gathered
 * at the bottom where it passes through the glass.
 */
const Crystal = ({ size }: { size: number }) => {
  return (
    <g filter='url(#n3-crystal-shadow)'>
      <circle r={size * 1.55} fill='url(#n3-crystal-halo)' />
      <circle r={size} fill='url(#n3-crystal-body)' />
      <circle r={size} fill='url(#n3-crystal-refract)' />
      <circle r={size - 0.5} fill='none' stroke='url(#n3-crystal-rim)' strokeWidth='1' />
      <ellipse
        cx={-size * 0.32}
        cy={-size * 0.4}
        rx={size * 0.36}
        ry={size * 0.2}
        transform={`rotate(-30 ${-size * 0.32} ${-size * 0.4})`}
        fill='#FFFFFF'
        opacity='0.95'
      />
      <circle cx={size * 0.34} cy={-size * 0.5} r={Math.max(0.7, size * 0.07)} fill='#FFFFFF' opacity='0.85' />
    </g>
  )
}

/**
 * The nodes are drawn twice, once behind the core and once in front, each clipped to its half of
 * the artboard, so a node passing the back of an orbit slips behind the object instead of over it.
 * `paused` freezes the beads where they are; they carry on from there when it clears.
 */
type SyntraParticlesProps = SVGProps<SVGSVGElement> & { half: 'back' | 'front'; animate: boolean; paused?: boolean }

const SyntraParticles = ({ half, animate, paused = false, ...props }: SyntraParticlesProps) => {
  // Refs
  const ref = useRef<SVGSVGElement>(null)

  // Vars
  const clipId = `n3-clip-${half}`

  // The beads run on this SVG's own animation clock, so pausing the clock stops them all at once.
  useEffect(() => {
    const svg = ref.current

    if (!svg) return

    if (paused) svg.pauseAnimations()
    else svg.unpauseAnimations()
  }, [paused])

  return (
    <svg ref={ref} viewBox='0 0 1000 1000' aria-hidden {...props}>
      <defs>
        <clipPath id={clipId}>
          {half === 'back' ? (
            <rect x='-200' y='-200' width='1400' height={CY + 200} />
          ) : (
            <rect x='-200' y={CY} width='1400' height='700' />
          )}
        </clipPath>
        <linearGradient id='n3-crystal-body' x1='0.15' y1='0.1' x2='0.85' y2='0.95'>
          <stop offset='0' stopColor='#FFE7D8' stopOpacity='0.9' />
          <stop offset='0.5' stopColor='#FFA56E' stopOpacity='0.88' />
          <stop offset='1' stopColor='#F2661F' stopOpacity='0.95' />
        </linearGradient>
        <radialGradient id='n3-crystal-refract' cx='0.6' cy='0.78' r='0.45'>
          <stop offset='0' stopColor='#FFF4EC' stopOpacity='0.85' />
          <stop offset='1' stopColor='#FFF4EC' stopOpacity='0' />
        </radialGradient>
        <linearGradient id='n3-crystal-rim' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#FFFFFF' stopOpacity='0.95' />
          <stop offset='1' stopColor='#C94F12' stopOpacity='0.55' />
        </linearGradient>
        <radialGradient id='n3-crystal-halo' cx='0.5' cy='0.5' r='0.5'>
          <stop offset='0.5' stopColor='#FF7A2F' stopOpacity='0.12' />
          <stop offset='1' stopColor='#FF7A2F' stopOpacity='0' />
        </radialGradient>
        <filter id='n3-crystal-shadow' x='-80%' y='-80%' width='260%' height='260%'>
          <feDropShadow dx='0' dy='2.5' stdDeviation='2.5' floodColor='#9A4A1E' floodOpacity='0.25' />
        </filter>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {NODES2.map((node, i) => {
          const rx = RING_RX[node.ring]
          const [x, y] = ringPoint(rx, node.angle)
          const dur = MOTION.orbitSeconds[node.ring]
          const reverse = node.ring === 1

          // The ring path starts at angle 0 and runs clockwise; a reversed lap starts from the far end.
          const start = node.angle / 360
          const begin = -dur * (reverse ? 1 - start : start)

          return (
            <g key={i} transform={animate ? undefined : `translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <Crystal size={node.size} />
              {animate && (
                <animateMotion
                  dur={`${dur}s`}
                  begin={`${begin}s`}
                  repeatCount='indefinite'
                  path={ringPath(rx)}
                  {...(reverse && { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' })}
                />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-technical-backdrop.tsx ─────
/**
 * Construction geometry behind the core: quiet enough that the eye only finds it on a second look.
 * Deterministic scatter, so server and client render the same dots.
 */
const DOTS = Array.from({ length: 26 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180
  const r = 160 + ((i * 53) % 340)

  return [
    round(CX + r * Math.cos(a) * 1.02),
    round(CY + r * Math.sin(a) * RING_FLATTEN * 1.6),
    0.8 + (i % 3) * 0.5
  ] as const
})

const SyntraTechnicalBackdrop = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 1000 1000' aria-hidden {...props}>
      <defs>
        <linearGradient id='n3-axis-v' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#C9C5BC' stopOpacity='0' />
          <stop offset='0.5' stopColor='#C9C5BC' stopOpacity='0.45' />
          <stop offset='1' stopColor='#C9C5BC' stopOpacity='0' />
        </linearGradient>
        <linearGradient id='n3-axis-h' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#C9C5BC' stopOpacity='0' />
          <stop offset='0.5' stopColor='#C9C5BC' stopOpacity='0.7' />
          <stop offset='1' stopColor='#C9C5BC' stopOpacity='0' />
        </linearGradient>
      </defs>

      <rect x={CX - 0.5} y='110' width='1' height='780' fill='url(#n3-axis-v)' />
      <rect x='70' y={CY - 0.5} width='860' height='1' fill='url(#n3-axis-h)' />

      <g fill='#C9C5BC'>
        {DOTS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={0.35 + (i % 4) * 0.12} />
        ))}
      </g>

      <g stroke='#C9C5BC' strokeWidth='1' opacity='0.5'>
        {(
          [
            [212, 292],
            [790, 690],
            [860, 430],
            [150, 560]
          ] as const
        ).map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 5} ${y}h10M${x} ${y - 5}v10`} />
        ))}
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-airtable-logo.tsx ─────
// The Airtable brand mark, from Iconify's open logo sets, in its own colours.
const SyntraAirtableLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 215' aria-hidden {...props}>
      <path
        fill='#ffbf00'
        d='M114.259 2.701L18.86 42.176c-5.305 2.195-5.25 9.73.089 11.847l95.797 37.989a35.54 35.54 0 0 0 26.208 0l95.799-37.99c5.337-2.115 5.393-9.65.086-11.846L141.442 2.7a35.55 35.55 0 0 0-27.183 0'
      />
      <path
        fill='#26b5f8'
        d='M136.35 112.757v94.902c0 4.514 4.55 7.605 8.746 5.942l106.748-41.435a6.39 6.39 0 0 0 4.035-5.941V71.322c0-4.514-4.551-7.604-8.747-5.941l-106.748 41.434a6.39 6.39 0 0 0-4.035 5.942'
      />
      <path
        fill='#ed3049'
        d='m111.423 117.654l-31.68 15.296l-3.217 1.555L9.65 166.548C5.411 168.593 0 165.504 0 160.795V71.72c0-1.704.874-3.175 2.046-4.283a7.3 7.3 0 0 1 1.618-1.213c1.598-.959 3.878-1.215 5.816-.448l101.41 40.18c5.155 2.045 5.56 9.268.533 11.697'
      />
      <path
        fillOpacity='.25'
        d='m111.423 117.654l-31.68 15.296L2.045 67.438a7.3 7.3 0 0 1 1.618-1.213c1.598-.959 3.878-1.215 5.816-.448l101.41 40.18c5.155 2.045 5.56 9.268.533 11.697'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-claude-logo.tsx ─────
// The Claude brand mark, from Iconify's open logo sets, in its own colours.
const SyntraClaudeLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 257' aria-hidden {...props}>
      <path
        fill='#d97757'
        d='m50.228 170.321l50.357-28.257l.843-2.463l-.843-1.361h-2.462l-8.426-.518l-28.775-.778l-24.952-1.037l-24.175-1.296l-6.092-1.297L0 125.796l.583-3.759l5.12-3.434l7.324.648l16.202 1.101l24.304 1.685l17.629 1.037l26.118 2.722h4.148l.583-1.685l-1.426-1.037l-1.101-1.037l-25.147-17.045l-27.22-18.017l-14.258-10.37l-7.713-5.25l-3.888-4.925l-1.685-10.758l7-7.713l9.397.649l2.398.648l9.527 7.323l20.35 15.75L94.817 91.9l3.889 3.24l1.555-1.102l.195-.777l-1.75-2.917l-14.453-26.118l-15.425-26.572l-6.87-11.018l-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0l10.63 1.426l4.472 3.888l6.61 15.101l10.694 23.786l16.591 32.34l4.861 9.592l2.592 8.879l.973 2.722h1.685v-1.556l1.36-18.211l2.528-22.36l2.463-28.776l.843-8.1l4.018-9.722l7.971-5.25l6.222 2.981l5.12 7.324l-.713 4.73l-3.046 19.768l-5.962 30.98l-3.889 20.739h2.268l2.593-2.593l10.499-13.934l17.628-22.036l7.778-8.749l9.073-9.657l5.833-4.601h11.018l8.1 12.055l-3.628 12.443l-11.342 14.388l-9.398 12.184l-13.48 18.147l-8.426 14.518l.778 1.166l2.01-.194l30.46-6.481l16.462-2.982l19.637-3.37l8.88 4.148l.971 4.213l-3.5 8.62l-20.998 5.184l-24.628 4.926l-36.682 8.685l-.454.324l.519.648l16.526 1.555l7.065.389h17.304l32.21 2.398l8.426 5.574l5.055 6.805l-.843 5.184l-12.962 6.611l-17.498-4.148l-40.83-9.721l-14-3.5h-1.944v1.167l11.666 11.406l21.387 19.314l26.767 24.887l1.36 6.157l-3.434 4.86l-3.63-.518l-23.526-17.693l-9.073-7.972l-20.545-17.304h-1.36v1.814l4.73 6.935l25.017 37.59l1.296 11.536l-1.814 3.76l-6.481 2.268l-7.13-1.297l-14.647-20.544l-15.1-23.138l-12.185-20.739l-1.49.843l-7.194 77.448l-3.37 3.953l-7.778 2.981l-6.48-4.925l-3.436-7.972l3.435-15.749l4.148-20.544l3.37-16.333l3.046-20.285l1.815-6.74l-.13-.454l-1.49.194l-15.295 20.999l-23.267 31.433l-18.406 19.702l-4.407 1.75l-7.648-3.954l.713-7.064l4.277-6.286l25.47-32.405l15.36-20.092l9.917-11.6l-.065-1.686h-.583L44.07 198.125l-12.055 1.555l-5.185-4.86l.648-7.972l2.463-2.593l20.35-13.999z'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-gemini-logo.tsx ─────
// The Gemini brand mark, from Iconify's open logo sets, in its own colours.
const SyntraGeminiLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 16 16' aria-hidden {...props}>
      <path
        fill='#448aff'
        d='M15 8.014A7.457 7.457 0 0 0 8.014 15h-.028A7.456 7.456 0 0 0 1 8.014v-.028A7.456 7.456 0 0 0 7.986 1h.028A7.457 7.457 0 0 0 15 7.986z'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-github-logo.tsx ─────
// The GitHub brand mark, from Iconify's open logo sets, in its own colours.
const SyntraGithubLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 250' aria-hidden {...props}>
      <path
        fill='#161614'
        d='M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46c6.397 1.185 8.746-2.777 8.746-6.158c0-3.052-.12-13.135-.174-23.83c-35.61 7.742-43.124-15.103-43.124-15.103c-5.823-14.795-14.213-18.73-14.213-18.73c-11.613-7.944.876-7.78.876-7.78c12.853.902 19.621 13.19 19.621 13.19c11.417 19.568 29.945 13.911 37.249 10.64c1.149-8.272 4.466-13.92 8.127-17.116c-28.431-3.236-58.318-14.212-58.318-63.258c0-13.975 5-25.394 13.188-34.358c-1.329-3.224-5.71-16.242 1.24-33.874c0 0 10.749-3.44 35.21 13.121c10.21-2.836 21.16-4.258 32.038-4.307c10.878.049 21.837 1.47 32.066 4.307c24.431-16.56 35.165-13.12 35.165-13.12c6.967 17.63 2.584 30.65 1.255 33.873c8.207 8.964 13.173 20.383 13.173 34.358c0 49.163-29.944 59.988-58.447 63.157c4.591 3.972 8.682 11.762 8.682 23.704c0 17.126-.148 30.91-.148 35.126c0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002C256 57.307 198.691 0 128.001 0m-80.06 182.34c-.282.636-1.283.827-2.194.39c-.929-.417-1.45-1.284-1.15-1.922c.276-.655 1.279-.838 2.205-.399c.93.418 1.46 1.293 1.139 1.931m6.296 5.618c-.61.566-1.804.303-2.614-.591c-.837-.892-.994-2.086-.375-2.66c.63-.566 1.787-.301 2.626.591c.838.903 1 2.088.363 2.66m4.32 7.188c-.785.545-2.067.034-2.86-1.104c-.784-1.138-.784-2.503.017-3.05c.795-.547 2.058-.055 2.861 1.075c.782 1.157.782 2.522-.019 3.08m7.304 8.325c-.701.774-2.196.566-3.29-.49c-1.119-1.032-1.43-2.496-.726-3.27c.71-.776 2.213-.558 3.315.49c1.11 1.03 1.45 2.505.701 3.27m9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033c-1.448-.439-2.395-1.613-2.103-2.626c.301-1.01 1.747-1.484 3.207-1.028c1.446.436 2.396 1.602 2.095 2.622m10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95c-1.53.034-2.769-.82-2.786-1.86c0-1.065 1.202-1.932 2.733-1.958c1.522-.03 2.768.818 2.768 1.868m10.555-.405c.182 1.03-.875 2.088-2.387 2.37c-1.485.271-2.861-.365-3.05-1.386c-.184-1.056.893-2.114 2.376-2.387c1.514-.263 2.868.356 3.061 1.403'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-google-analytics-logo.tsx ─────
// The Google Analytics brand mark, from Iconify's open logo sets, in its own colours.
const SyntraGoogleAnalyticsLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 284' aria-hidden {...props}>
      <path
        fill='#f9ab00'
        d='M256.003 247.933a35.224 35.224 0 0 1-39.376 35.161c-18.044-2.67-31.266-18.371-30.826-36.606V36.845C185.365 18.591 198.62 2.881 216.687.24a35.22 35.22 0 0 1 39.316 35.16z'
      />
      <path
        fill='#e37400'
        d='M35.101 213.193c19.386 0 35.101 15.716 35.101 35.101c0 19.386-15.715 35.101-35.101 35.101S0 267.68 0 248.295s15.715-35.102 35.101-35.102m92.358-106.387c-19.477 1.068-34.59 17.406-34.137 36.908v94.285c0 25.588 11.259 41.122 27.755 44.433a35.16 35.16 0 0 0 42.146-34.56V142.089a35.22 35.22 0 0 0-35.764-35.282'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-google-drive-logo.tsx ─────
/**
 * The Google Drive brand mark, from Iconify's open logo sets, in its own colours. Its ids are
 * per instance: the same logo appears in hidden and visible cards at once.
 */
const SyntraGoogleDriveLogo = (props: SVGProps<SVGSVGElement>) => {
  // Hooks
  const uid = useId().replace(/[^\w-]/g, '')

  return (
    <svg viewBox='0 0 256 238' aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}SVGjzk6ueva`} x1='86.924%' x2='7.63%' y1='94.294%' y2='45.952%'>
          <stop offset='9%' stopColor='#ffe921' />
          <stop offset='100%' stopColor='#fec700' />
        </linearGradient>
        <linearGradient id={`${uid}SVGb0f7AcFJ`} x1='99.538%' x2='23.437%' y1='93.901%' y2='54.033%'>
          <stop offset='15%' stopColor='#a9a8ff' />
          <stop offset='33%' stopColor='#6d97ff' />
          <stop offset='48%' stopColor='#3186ff' />
        </linearGradient>
        <linearGradient id={`${uid}SVGxMwz6dYk`} x1='87.128%' x2='-.639%' y1='51.518%' y2='93.078%'>
          <stop offset='55%' stopColor='#0ebc5f' />
          <stop offset='85%' stopColor='#78c9ff' />
        </linearGradient>
        <path
          id={`${uid}SVGAiIt3btS`}
          d='M77.303 29.27c22.531-39.026 78.863-39.027 101.394 0l69.373 120.158c22.531 39.027-5.633 87.81-50.698 87.81H58.628c-45.065 0-73.23-48.783-50.698-87.81z'
        />
      </defs>
      <mask id={`${uid}SVG6FLXsceq`} fill='#fff'>
        <use href={`#${uid}SVGAiIt3btS`} />
      </mask>
      <g mask={`url(#${uid}SVG6FLXsceq)`}>
        <path
          fill={`url(#${uid}SVGjzk6ueva)`}
          d='M341.719 295.937H200.166l-29.293-50.735l70.777-122.589z'
          transform='translate(-42.87 -58.67)'
        />
        <path
          fill={`url(#${uid}SVGb0f7AcFJ)`}
          d='m0 295.916l100.069-173.325v.003l-29.282 50.723h58.57l70.783 122.596l-200.138.001z'
          transform='translate(-42.87 -58.67)'
        />
        <path
          fill={`url(#${uid}SVGxMwz6dYk)`}
          d='m170.881 0l70.781 122.6l-29.286 50.726H70.812z'
          transform='translate(-42.87 -58.67)'
        />
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-google-sheets-logo.tsx ─────
/**
 * The Google Sheets brand mark, from Iconify's open logo sets, in its own colours. Its ids are
 * per instance: the same logo appears in hidden and visible cards at once.
 */
const SyntraGoogleSheetsLogo = (props: SVGProps<SVGSVGElement>) => {
  // Hooks
  const uid = useId().replace(/[^\w-]/g, '')

  return (
    <svg viewBox='0 0 74 100' aria-hidden {...props}>
      <defs>
        <path
          id={`${uid}SVGIGBbGcaJ`}
          fill='#fff'
          d='M45.398 1.43H7.867c-3.643 0-6.623 2.98-6.623 6.624v83.893c0 3.642 2.98 6.623 6.623 6.623h57.4c3.643 0 6.624-2.98 6.624-6.623V27.923z'
        />
      </defs>
      <mask
        id={`${uid}SVGeu8TmevZ`}
        width='71'
        height='98'
        x='1'
        y='1'
        maskUnits='userSpaceOnUse'
        style={{ maskType: 'alpha' }}
      >
        <use href={`#${uid}SVGIGBbGcaJ`} />
      </mask>
      <g fill='none'>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path
            fill='#0f9d58'
            d='M45.398 1.43H7.867c-3.643 0-6.623 2.98-6.623 6.624v83.893c0 3.642 2.98 6.623 6.623 6.623h57.4c3.643 0 6.624-2.98 6.624-6.623V27.923L56.436 16.884z'
          />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path
            fill='#f1f1f1'
            d='M18.905 48.896v32.012H54.23V48.896zM34.36 76.493H23.321v-5.52h11.038zm0-8.831H23.321v-5.52h11.038zm0-8.831H23.321v-5.52h11.038zm15.454 17.662H38.775v-5.52h11.038zm0-8.831H38.775v-5.52h11.038zm0-8.831H38.775v-5.52h11.038z'
          />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path fill={`url(#${uid}SVGoPMCPXuN)`} d='m47.335 25.986l24.556 24.55V27.922z' />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path fill='#87ceac' d='M45.398 1.43V21.3a6.62 6.62 0 0 0 6.623 6.623h19.87z' />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path
            fill='#fff'
            fillOpacity='.2'
            d='M7.867 1.43c-3.643 0-6.623 2.98-6.623 6.624v.551c0-3.642 2.98-6.623 6.623-6.623h37.531V1.43z'
          />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path
            fill='#263238'
            fillOpacity='.2'
            d='M65.267 98.018h-57.4c-3.643 0-6.623-2.98-6.623-6.623v.552c0 3.642 2.98 6.623 6.623 6.623h57.4c3.643 0 6.624-2.98 6.624-6.623v-.552c0 3.642-2.98 6.623-6.624 6.623'
          />
        </g>
        <g mask={`url(#${uid}SVGeu8TmevZ)`}>
          <path
            fill='#263238'
            fillOpacity='.1'
            d='M52.021 27.923a6.62 6.62 0 0 1-6.623-6.623v.552a6.62 6.62 0 0 0 6.623 6.623h19.87v-.552z'
          />
        </g>
        <path
          fill={`url(#${uid}SVGXgG8ibSI)`}
          d='M45.398 1.43H7.867c-3.643 0-6.623 2.98-6.623 6.624v83.893c0 3.642 2.98 6.623 6.623 6.623h57.4c3.643 0 6.624-2.98 6.624-6.623V27.923z'
        />
        <defs>
          <radialGradient
            id={`${uid}SVGXgG8ibSI`}
            cx='0'
            cy='0'
            r='1'
            gradientTransform='translate(3.482 3.361)scale(113.917)'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#fff' stopOpacity='.1' />
            <stop offset='1' stopColor='#fff' stopOpacity='0' />
          </radialGradient>
          <linearGradient
            id={`${uid}SVGoPMCPXuN`}
            x1='59.614'
            x2='59.614'
            y1='28.093'
            y2='50.539'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#263238' stopOpacity='.2' />
            <stop offset='1' stopColor='#263238' stopOpacity='.02' />
          </linearGradient>
        </defs>
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-google-slides-logo.tsx ─────
/**
 * The Google Slides brand mark, from Iconify's open logo sets, in its own colours. Its ids are
 * per instance: the same logo appears in hidden and visible cards at once.
 */
const SyntraGoogleSlidesLogo = (props: SVGProps<SVGSVGElement>) => {
  // Hooks
  const uid = useId().replace(/[^\w-]/g, '')

  return (
    <svg viewBox='0 0 73 100' aria-hidden {...props}>
      <defs>
        <path
          id={`${uid}SVGLqcj4blC`}
          fill='#fff'
          d='M44.823 0h-38.1C3.026 0 0 3.026 0 6.723v85.165c0 3.697 3.026 6.723 6.723 6.723h58.27c3.699 0 6.724-3.026 6.724-6.723V26.894z'
        />
      </defs>
      <mask
        id={`${uid}SVGOJaYrdyS`}
        width='72'
        height='99'
        x='0'
        y='0'
        maskUnits='userSpaceOnUse'
        style={{ maskType: 'alpha' }}
      >
        <use href={`#${uid}SVGLqcj4blC`} />
      </mask>
      <g fill='none'>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path
            fill='#f4b400'
            d='M44.823 0h-38.1C3.026 0 0 3.026 0 6.723v85.165c0 3.697 3.026 6.723 6.723 6.723h58.27c3.699 0 6.724-3.026 6.724-6.723V26.894L56.03 15.688z'
          />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path
            fill='#f1f1f1'
            d='M50.426 44.823H21.291a3.37 3.37 0 0 0-3.362 3.362V77.32a3.37 3.37 0 0 0 3.362 3.362h29.135a3.37 3.37 0 0 0 3.362-3.362V48.185a3.37 3.37 0 0 0-3.362-3.362m-1.12 25.774H22.412V54.909h26.894z'
          />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path fill={`url(#${uid}SVGHjkXJesw)`} d='M46.79 24.927L71.717 49.85V26.894z' />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path fill='#fada80' d='M44.823 0v20.17a6.72 6.72 0 0 0 6.724 6.724h20.17z' />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path fill='#fff' fillOpacity='.1' d='M44.823 0v.56l26.334 26.334h.56z' />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path
            fill='#fff'
            fillOpacity='.2'
            d='M6.723 0C3.026 0 0 3.026 0 6.723v.56C0 3.587 3.026.56 6.723.56h38.1V0z'
          />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path
            fill='#bf360c'
            fillOpacity='.2'
            d='M64.994 98.05H6.724C3.025 98.05 0 95.026 0 91.328v.56c0 3.698 3.026 6.724 6.723 6.724h58.27c3.699 0 6.724-3.026 6.724-6.723v-.56c0 3.697-3.025 6.723-6.723 6.723'
          />
        </g>
        <g mask={`url(#${uid}SVGOJaYrdyS)`}>
          <path
            fill='#bf360c'
            fillOpacity='.1'
            d='M51.547 26.894a6.72 6.72 0 0 1-6.724-6.723v.56a6.72 6.72 0 0 0 6.724 6.723h20.17v-.56z'
          />
        </g>
        <path
          fill={`url(#${uid}SVG6dpJadoi)`}
          d='M44.823 0h-38.1C3.026 0 0 3.026 0 6.723v85.165c0 3.697 3.026 6.723 6.723 6.723h58.27c3.699 0 6.724-3.026 6.724-6.723V26.894z'
        />
        <defs>
          <radialGradient
            id={`${uid}SVG6dpJadoi`}
            cx='0'
            cy='0'
            r='1'
            gradientTransform='translate(2.272 1.96)scale(115.643)'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#fff' stopOpacity='.1' />
            <stop offset='1' stopColor='#fff' stopOpacity='0' />
          </radialGradient>
          <linearGradient
            id={`${uid}SVGHjkXJesw`}
            x1='59.255'
            x2='59.255'
            y1='27.067'
            y2='49.852'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#bf360c' stopOpacity='.2' />
            <stop offset='1' stopColor='#bf360c' stopOpacity='.02' />
          </linearGradient>
        </defs>
      </g>
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-notion-logo.tsx ─────
// The Notion brand mark, from Iconify's open logo sets, in its own colours.
const SyntraNotionLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 268' aria-hidden {...props}>
      <path
        fill='#fff'
        d='M16.092 11.538L164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188'
      />
      <path d='M164.09.608L16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608M69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921M212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715c-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585l52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404z' />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-openai-logo.tsx ─────
// The OpenAI brand mark, from Iconify's open logo sets, in its own colours.
const SyntraOpenaiLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 260' aria-hidden {...props}>
      <path d='M239.184 106.203a64.72 64.72 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.72 64.72 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.67 64.67 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.77 64.77 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483m-97.56 136.338a48.4 48.4 0 0 1-31.105-11.255l1.535-.87l51.67-29.825a8.6 8.6 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601M37.158 197.93a48.35 48.35 0 0 1-5.781-32.589l1.534.921l51.722 29.826a8.34 8.34 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803M23.549 85.38a48.5 48.5 0 0 1 25.58-21.333v61.39a8.29 8.29 0 0 0 4.195 7.316l62.874 36.272l-21.845 12.636a.82.82 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405zm179.466 41.695l-63.08-36.63L161.73 77.86a.82.82 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.54 8.54 0 0 0-4.4-7.213m21.742-32.69l-1.535-.922l-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.72.72 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391zM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87l-51.67 29.825a8.6 8.6 0 0 0-4.246 7.367zm11.868-25.58L128.067 97.3l28.188 16.218v32.434l-28.086 16.218l-28.188-16.218z' />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-salesforce-logo.tsx ─────
// The Salesforce brand mark, from Iconify's open logo sets, in its own colours.
const SyntraSalesforceLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 180' aria-hidden {...props}>
      <path
        fill='#00a1e0'
        d='M106.553 19.651c8.248-8.594 19.731-13.924 32.43-13.924c16.883 0 31.612 9.414 39.455 23.389a54.5 54.5 0 0 1 22.3-4.74c30.449 0 55.134 24.9 55.134 55.615c0 30.719-24.685 55.62-55.134 55.62a54.7 54.7 0 0 1-10.86-1.083c-6.908 12.321-20.07 20.645-35.178 20.645a40.1 40.1 0 0 1-17.632-4.058c-7.002 16.47-23.316 28.019-42.33 28.019c-19.8 0-36.674-12.529-43.152-30.1c-2.83.602-5.763.915-8.772.915c-23.574 0-42.686-19.308-42.686-43.13a43.2 43.2 0 0 1 21.345-37.36a49.4 49.4 0 0 1-4.088-19.727C17.385 22.336 39.626.128 67.06.128c16.106 0 30.42 7.658 39.494 19.523'
      />
      <path
        fill='#fff'
        d='M37.17 92.956c-.16.419.058.506.11.58c.48.349.968.6 1.46.88c2.609 1.385 5.071 1.79 7.647 1.79c5.246 0 8.503-2.79 8.503-7.283v-.087c0-4.153-3.676-5.662-7.126-6.75l-.448-.147c-2.601-.845-4.845-1.573-4.845-3.286v-.09c0-1.465 1.311-2.544 3.344-2.544c2.259 0 4.94.75 6.667 1.705c0 0 .506.328.692-.164c.102-.262.976-2.615 1.068-2.87c.098-.277-.077-.481-.255-.59c-1.971-1.2-4.696-2.019-7.516-2.019l-.525.004c-4.801 0-8.153 2.9-8.153 7.057v.087c0 4.383 3.698 5.803 7.162 6.794l.558.172c2.524.775 4.7 1.442 4.7 3.22v.087c0 1.625-1.414 2.835-3.695 2.835c-.885 0-3.708-.018-6.758-1.946c-.368-.215-.583-.371-.867-.542c-.15-.095-.524-.26-.688.236zm76.8 0c-.16.419.058.506.11.58c.48.349.968.6 1.46.88c2.608 1.385 5.071 1.79 7.647 1.79c5.246 0 8.503-2.79 8.503-7.283v-.087c0-4.153-3.676-5.662-7.126-6.75l-.448-.147c-2.601-.845-4.846-1.573-4.846-3.286v-.09c0-1.465 1.312-2.544 3.345-2.544c2.259 0 4.94.75 6.667 1.705c0 0 .506.328.692-.164c.102-.262.976-2.615 1.067-2.87c.099-.277-.076-.481-.255-.59c-1.97-1.2-4.696-2.019-7.515-2.019l-.525.004c-4.802 0-8.153 2.9-8.153 7.057v.087c0 4.383 3.697 5.803 7.162 6.794l.557.172c2.525.775 4.704 1.442 4.704 3.22v.087c0 1.625-1.418 2.835-3.698 2.835a12.4 12.4 0 0 1-6.758-1.946c-.368-.215-.587-.364-.863-.542c-.095-.062-.54-.234-.693.236zm52.429-8.799c0 2.54-.474 4.54-1.406 5.953c-.922 1.4-2.317 2.08-4.263 2.08c-1.949 0-3.337-.677-4.244-2.08c-.918-1.41-1.384-3.413-1.384-5.953c0-2.535.466-4.532 1.384-5.93c.907-1.385 2.295-2.059 4.244-2.059c1.946 0 3.34.674 4.266 2.058c.93 1.4 1.403 3.396 1.403 5.931m4.379-4.707c-.43-1.453-1.1-2.735-1.993-3.803c-.893-1.071-2.022-1.93-3.363-2.557c-1.337-.623-2.918-.94-4.692-.94c-1.778 0-3.359.317-4.696.94c-1.34.626-2.47 1.486-3.366 2.557c-.889 1.071-1.56 2.354-1.993 3.803c-.426 1.447-.64 3.028-.64 4.707c0 1.68.214 3.265.64 4.707c.434 1.45 1.1 2.732 1.997 3.804a9.4 9.4 0 0 0 3.362 2.535c1.34.609 2.918.918 4.696.918c1.774 0 3.352-.31 4.692-.918a9.4 9.4 0 0 0 3.363-2.535c.893-1.068 1.563-2.35 1.993-3.804c.43-1.446.645-3.03.645-4.707c0-1.675-.215-3.26-.645-4.707m35.959 12.063c-.145-.426-.557-.266-.557-.266c-.637.244-1.315.47-2.036.583a16 16 0 0 1-2.401.171c-2.12 0-3.804-.63-5.01-1.876c-1.209-1.246-1.887-3.26-1.88-5.986c.008-2.48.606-4.346 1.68-5.767c1.068-1.413 2.692-2.138 4.86-2.138c1.807 0 3.184.207 4.627.663c0 0 .346.15.51-.303c.382-1.063.667-1.825 1.075-2.994c.116-.332-.168-.474-.27-.514c-.568-.222-1.909-.583-2.922-.736c-.947-.145-2.054-.222-3.286-.222c-1.84 0-3.479.313-4.882.94c-1.399.623-2.586 1.483-3.526 2.554s-1.654 2.353-2.131 3.803c-.474 1.446-.714 3.035-.714 4.714c0 3.632.98 6.569 2.914 8.718c1.938 2.157 4.85 3.253 8.645 3.253c2.244 0 4.547-.455 6.2-1.107c0 0 .318-.153.18-.521zm7.663-9.788c.207-1.41.597-2.583 1.198-3.497c.907-1.388 2.291-2.15 4.237-2.15c1.945 0 3.231.765 4.153 2.15c.612.914.878 2.138.983 3.497zm14.743-3.1c-.372-1.403-1.294-2.82-1.898-3.468c-.955-1.028-1.887-1.746-2.813-2.146a10.8 10.8 0 0 0-4.248-.86c-1.85 0-3.53.31-4.892.95c-1.366.642-2.514 1.516-3.414 2.606c-.9 1.085-1.577 2.379-2.007 3.847c-.434 1.46-.652 3.053-.652 4.732c0 1.709.226 3.3.674 4.732c.451 1.443 1.173 2.715 2.15 3.767c.972 1.06 2.225 1.891 3.726 2.47c1.49.576 3.3.875 5.38.871c4.281-.015 6.537-.969 7.465-1.483c.164-.09.321-.251.124-.71l-.969-2.714c-.145-.405-.557-.255-.557-.255c-1.06.393-2.568 1.1-6.084 1.093c-2.299-.004-4.004-.682-5.071-1.742c-1.097-1.085-1.632-2.68-1.727-4.932l14.824.014s.39-.007.43-.386c.014-.16.51-3.046-.441-6.386m-133.46 3.1c.211-1.41.597-2.583 1.199-3.497c.907-1.388 2.291-2.15 4.236-2.15c1.946 0 3.232.765 4.157 2.15c.609.914.875 2.138.98 3.497zm14.74-3.1c-.372-1.403-1.29-2.82-1.895-3.468c-.954-1.028-1.887-1.746-2.812-2.146a10.8 10.8 0 0 0-4.248-.86c-1.847 0-3.53.31-4.892.95c-1.367.642-2.514 1.516-3.414 2.606c-.9 1.085-1.577 2.379-2.007 3.847c-.43 1.46-.652 3.053-.652 4.732c0 1.709.225 3.3.674 4.732c.451 1.443 1.173 2.715 2.149 3.767c.973 1.06 2.226 1.891 3.727 2.47c1.49.576 3.3.875 5.38.871c4.281-.015 6.536-.969 7.465-1.483c.164-.09.32-.251.124-.71l-.965-2.714c-.15-.405-.561-.255-.561-.255c-1.06.393-2.565 1.1-6.088 1.093c-2.295-.004-4-.682-5.067-1.742c-1.097-1.085-1.633-2.68-1.727-4.932l14.823.014s.39-.007.43-.386c.015-.16.51-3.046-.444-6.386M63.642 91.431c-.58-.462-.66-.579-.856-.878c-.292-.455-.441-1.104-.441-1.927c0-1.304.43-2.24 1.322-2.87c-.01.003 1.275-1.112 4.3-1.072c2.123.03 4.021.343 4.021.343v6.74h.004s-1.884.404-4.004.531c-3.017.182-4.357-.87-4.346-.867m5.898-10.415c-.601-.044-1.38-.07-2.313-.07c-1.272 0-2.5.16-3.65.47a9.5 9.5 0 0 0-3.097 1.436a7.15 7.15 0 0 0-2.15 2.444c-.524.977-.79 2.128-.79 3.417c0 1.312.225 2.452.677 3.385a6.1 6.1 0 0 0 1.935 2.317c.823.601 1.84 1.042 3.02 1.308c1.162.266 2.48.4 3.923.4c1.52 0 3.035-.123 4.503-.375a94 94 0 0 0 3.734-.721c.492-.117 1.039-.266 1.039-.266c.368-.091.338-.485.338-.485l-.007-13.555c0-2.973-.794-5.177-2.357-6.543c-1.555-1.363-3.847-2.051-6.809-2.051c-1.11 0-2.9.153-3.97.368c0 0-3.24.626-4.573 1.668c0 0-.291.182-.131.59l1.05 2.82c.13.364.484.24.484.24s.113-.043.244-.12c2.852-1.552 6.459-1.504 6.459-1.504c1.603 0 2.834.32 3.665.958c.809.619 1.22 1.555 1.22 3.53v.626c-1.275-.182-2.444-.287-2.444-.287m119.56-7.639a.4.4 0 0 0-.223-.532c-.251-.098-1.512-.364-2.485-.426c-1.861-.113-2.896.2-3.821.616c-.918.415-1.938 1.085-2.507 1.847v-1.804c0-.251-.178-.451-.426-.451h-3.8c-.247 0-.426.2-.426.451v22.11c0 .248.204.452.452.452h3.894a.45.45 0 0 0 .448-.452V84.142c0-1.482.164-2.962.492-3.89c.32-.919.758-1.654 1.297-2.183a4.55 4.55 0 0 1 1.833-1.1c.688-.211 1.45-.28 1.989-.28c.776 0 1.628.2 1.628.2c.284.033.445-.142.54-.4c.254-.678.976-2.708 1.114-3.112'
      />
      <path
        fill='#fff'
        d='M152.544 63.13a13 13 0 0 0-1.465-.35a11.6 11.6 0 0 0-2.014-.152c-2.682 0-4.795.757-6.277 2.251c-1.476 1.486-2.478 3.749-2.98 6.725l-.183 1.002h-3.366s-.408-.015-.495.43l-.55 3.086c-.04.291.087.477.48.477h3.276l-3.323 18.55c-.258 1.494-.557 2.722-.889 3.654c-.324.918-.64 1.607-1.034 2.11c-.38.48-.736.838-1.356 1.045c-.51.172-1.1.252-1.745.252c-.357 0-.834-.059-1.187-.131a3.5 3.5 0 0 1-.802-.26s-.382-.145-.535.238c-.12.317-.995 2.717-1.1 3.013c-.102.295.043.524.229.593c.437.153.761.255 1.355.397c.824.194 1.52.204 2.172.204c1.362 0 2.608-.193 3.639-.564c1.035-.375 1.938-1.028 2.74-1.91c.863-.954 1.406-1.952 1.923-3.318c.514-1.348.955-3.024 1.304-4.976l3.341-18.897h4.882s.411.014.495-.434l.554-3.082c.036-.295-.087-.477-.485-.477h-4.74c.026-.106.241-1.774.784-3.344c.233-.667.67-1.21 1.038-1.581a3.1 3.1 0 0 1 1.243-.773c.47-.153 1.005-.226 1.592-.226c.444 0 .885.051 1.216.12c.46.099.638.15.758.186c.485.146.55.004.645-.23l1.133-3.11c.117-.335-.171-.478-.273-.518M86.322 95.19c0 .247-.179.448-.426.448h-3.931c-.248 0-.423-.2-.423-.448V63.553c0-.247.175-.448.423-.448h3.93c.248 0 .427.2.427.448z'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-slack-logo.tsx ─────
// The Slack brand mark, from Iconify's open logo sets, in its own colours.
const SyntraSlackLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 256' aria-hidden {...props}>
      <path
        fill='#e01e5a'
        d='M53.841 161.32c0 14.832-11.987 26.82-26.819 26.82S.203 176.152.203 161.32c0-14.831 11.987-26.818 26.82-26.818H53.84zm13.41 0c0-14.831 11.987-26.818 26.819-26.818s26.819 11.987 26.819 26.819v67.047c0 14.832-11.987 26.82-26.82 26.82c-14.83 0-26.818-11.988-26.818-26.82z'
      />
      <path
        fill='#36c5f0'
        d='M94.07 53.638c-14.832 0-26.82-11.987-26.82-26.819S79.239 0 94.07 0s26.819 11.987 26.819 26.819v26.82zm0 13.613c14.832 0 26.819 11.987 26.819 26.819s-11.987 26.819-26.82 26.819H26.82C11.987 120.889 0 108.902 0 94.069c0-14.83 11.987-26.818 26.819-26.818z'
      />
      <path
        fill='#2eb67d'
        d='M201.55 94.07c0-14.832 11.987-26.82 26.818-26.82s26.82 11.988 26.82 26.82s-11.988 26.819-26.82 26.819H201.55zm-13.41 0c0 14.832-11.988 26.819-26.82 26.819c-14.831 0-26.818-11.987-26.818-26.82V26.82C134.502 11.987 146.489 0 161.32 0s26.819 11.987 26.819 26.819z'
      />
      <path
        fill='#ecb22e'
        d='M161.32 201.55c14.832 0 26.82 11.987 26.82 26.818s-11.988 26.82-26.82 26.82c-14.831 0-26.818-11.988-26.818-26.82V201.55zm0-13.41c-14.831 0-26.818-11.988-26.818-26.82c0-14.831 11.987-26.818 26.819-26.818h67.25c14.832 0 26.82 11.987 26.82 26.819s-11.988 26.819-26.82 26.819z'
      />
    </svg>
  )
}

// ───── assets/motionuikit/svg/syntra-zapier-logo.tsx ─────
// The Zapier brand mark, from Iconify's open logo sets, in its own colours.
const SyntraZapierLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='0 0 256 256' aria-hidden {...props}>
      <path
        fill='#FF4A00'
        d='M128.08 0c7.231.013 14.343.624 21.256 1.78V76.3l52.831-52.696a128.425 128.425 0 0 1 16.34 13.789a128.468 128.468 0 0 1 13.84 16.312L179.513 106.4h74.715A127.58 127.58 0 0 1 256 127.587v.173c0 7.226-.613 14.306-1.772 21.2H179.5l52.847 52.682a129.615 129.615 0 0 1-13.824 16.312h-.015a128.254 128.254 0 0 1-16.326 13.789l-52.846-52.696v74.52a130.321 130.321 0 0 1-21.243 1.781h-.186a130.26 130.26 0 0 1-21.23-1.78v-74.52l-52.831 52.695a128.401 128.401 0 0 1-30.18-30.1L76.5 148.96H1.785A126.984 126.984 0 0 1 0 127.72v-.371c.012-1.875.135-4.166.311-6.536l.055-.713c.522-6.671 1.419-13.7 1.419-13.7H76.5L23.666 53.705a126.265 126.265 0 0 1 13.81-16.286l.026-.026a127.746 127.746 0 0 1 16.344-13.789L106.677 76.3V1.78A130.278 130.278 0 0 1 127.933 0h.147Zm-.013 95.76h-.122a76.718 76.718 0 0 0-27.034 4.902a76.662 76.662 0 0 0-4.915 26.952v.12a76.383 76.383 0 0 0 4.927 26.951a76.608 76.608 0 0 0 27.022 4.902h.122c9.51 0 18.617-1.74 27.022-4.902a76.146 76.146 0 0 0 4.915-26.952v-.12c0-9.484-1.747-18.57-4.915-26.951a76.614 76.614 0 0 0-27.022-4.902Z'
      />
    </svg>
  )
}

// ───── Brand Logos for Real Tech Stack ─────
const SyntraGoogleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' aria-hidden {...props}>
    <path fill='#4285F4' d='M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z' />
    <path fill='#34A853' d='M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z' />
    <path fill='#FBBC05' d='M5.28 14.27a7.18 7.18 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15Z' />
    <path fill='#EA4335' d='M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z' />
  </svg>
)

const SyntraNextjsLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 180 180' aria-hidden {...props}>
    <circle cx='90' cy='90' fill='black' r='90' />
    <path
      d='M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z'
      fill='#fff'
    />
    <rect fill='#fff' height='72' width='12' x='115' y='54' />
  </svg>
)

const SyntraShopifyLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' aria-hidden {...props}>
    <path fill='#95BF47' d='M19.38 6.47c-.03-.22-.19-.38-.41-.4l-3.32-.34-.02-.07a3.48 3.48 0 0 0-3.3-2.61c-1.86 0-3.23 1.4-3.37 3.23l-2.73.85c-.32.1-.53.4-.5.73l1.83 13.91a.57.57 0 0 0 .56.49h10.23c.3 0 .54-.22.56-.51l1.1-14.75c.02-.18-.04-.37-.17-.53zm-6.84-2.1c1.16 0 2.07.82 2.22 1.95l-4.43.46c.17-1.35 1.16-2.41 2.21-2.41zm-1.07 14.12l-1.37-3.95 2.87-.92-1.5 4.87zm4.27-2.68c-.06.28-.27.46-.55.46h-1.48l1.32-4.3 1.34 2.8c-.18.35-.41.72-.63 1.04z' />
  </svg>
)

const SyntraN8nLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' aria-hidden {...props}>
    <path
      fill='#EA4B71'
      d='M1.5 9.75a4.25 4.25 0 0 1 4.25-4.25h1.5v3h-1.5a1.25 1.25 0 0 0-1.25 1.25v.75h2.75v3H1.5V9.75zm16.75-4.25a4.25 4.25 0 0 1 4.25 4.25v3.75h-3V9.75a1.25 1.25 0 0 0-1.25-1.25h-1.5v-3h1.5zM1.5 14.25h6v3h-2.25v.75a1.25 1.25 0 0 0 1.25 1.25h1.5v3h-1.5A4.25 4.25 0 0 1 1.5 18v-3.75zm16.75 8h-1.5v-3h1.5a1.25 1.25 0 0 0 1.25-1.25v-.75h-3v-3h6V18a4.25 4.25 0 0 1-4.25 4.25zm-9.5-5.25h6.5v-3H8.75v3z'
    />
  </svg>
)

const SyntraExcelLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' aria-hidden {...props}>
    <path fill='#107C41' d='M21.17 2.05H8.83A1.83 1.83 0 0 0 7 3.88v3.29H2.83A1.83 1.83 0 0 0 1 9v6a1.83 1.83 0 0 0 1.83 1.83H7v3.29a1.83 1.83 0 0 0 1.83 1.83h12.34a1.83 1.83 0 0 0 1.83-1.83V3.88a1.83 1.83 0 0 0-1.83-1.83zM6 15.33a.67.67 0 0 1-.67.67H2.83a.67.67 0 0 1-.67-.67V9a.67.67 0 0 1 .67-.67h2.5a.67.67 0 0 1 .67.67v6.33zm16 4.79a.67.67 0 0 1-.67.67H8.83a.67.67 0 0 1-.67-.67v-3.12h4.5a.67.67 0 0 0 .67-.67V7.67a.67.67 0 0 0-.67-.67h-4.5V3.88a.67.67 0 0 1 .67-.67h12.34a.67.67 0 0 1 .67.67v16.24z' />
    <path fill='#107C41' d='m4.57 10.36-.93 1.48-.94-1.48H1.42l1.52 2.15-1.6 2.32h1.34l1.01-1.62 1.03 1.62h1.33l-1.63-2.32 1.54-2.15z' />
  </svg>
)

const SyntraWhatsappLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' aria-hidden {...props}>
    <path
      fill='#25D366'
      d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'
    />
  </svg>
)

// ───── components/motionuikit/sections/syntra/stage-card-body.tsx ─────
// Third-party Imports

type AppName = Stage['apps'][number]

const APP_LOGOS: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  Shopify: SyntraShopifyLogo,
  'Next.js': SyntraNextjsLogo,
  Google: SyntraGoogleLogo,
  Claude: SyntraClaudeLogo,
  n8n: SyntraN8nLogo,
  Excel: SyntraExcelLogo,
  WhatsApp: SyntraWhatsappLogo,
  OpenAI: SyntraOpenaiLogo,
  Gemini: SyntraGeminiLogo,
  Zapier: SyntraZapierLogo,
  GitHub: SyntraGithubLogo,
  Slack: SyntraSlackLogo,
  Notion: SyntraNotionLogo,
  Salesforce: SyntraSalesforceLogo
}

// The small orange mark under each stage number.
const STAGE_ICONS = {
  sources: Cable,
  context: FilePen,
  automation: Workflow,
  outcomes: ChartNoAxesColumnIncreasing
}

/**
 * Clean, legible stage card: Step number + Title + ONLY tool icons with hover tooltips.
 * Eliminates text clutter so cards remain crisp, spacious, and easily readable.
 */
const StageCardBody = ({ index, selected = false }: { index: number; selected?: boolean }) => {
  // Vars
  const stage = STAGES[index]
  const main = isMain(stage)

  return (
    <div className='flex flex-col gap-2 text-left'>
      {/* Title & Stage Number */}
      <div className='flex items-center justify-between gap-2.5'>
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full text-[0.72em] font-bold tabular-nums transition-colors',
              selected
                ? 'bg-[#FF7A2F] text-white shadow-sm shadow-[#FF7A2F]/40'
                : 'bg-stone-200/80 text-stone-700'
            )}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className='text-stone-900 text-[0.96em] leading-tight font-semibold tracking-[-0.015em] truncate'>
            {stage.title}
          </p>
        </div>

        {selected ? (
          <span className='shrink-0 rounded-full bg-[#FF7A2F]/15 px-2 py-0.5 text-[0.66em] font-semibold text-[#FF7A2F] uppercase tracking-wider flex items-center gap-1'>
            <span className='size-1.5 rounded-full bg-[#FF7A2F] animate-pulse' />
            Activo
          </span>
        ) : main ? (
          <span className='text-[#FF7A2F] shrink-0 text-[0.68em] font-bold tracking-[0.08em] uppercase'>
            Core IA
          </span>
        ) : null}
      </div>

      {/* ONLY Tool Icons: Clean, elegant, spacious, zero text crowding */}
      <div className='flex items-center gap-2 pl-7 pt-0.5'>
        {stage.apps.map(app => {
          const Logo = APP_LOGOS[app]
          if (!Logo) return null

          return (
            <div
              key={app}
              title={app}
              className='group/tool relative flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-stone-200/90 bg-white/95 p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:scale-110 hover:border-[#FF7A2F]/60 hover:shadow-md'
            >
              <Logo className='size-5' />
              {/* Tooltip on hover */}
              <span className='pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover/tool:opacity-100 z-50'>
                {app}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ───── components/motionuikit/sections/syntra/stage-cards.tsx ─────
// Third-party Imports

const pct = (n: number) => `${(n / ARTBOARD) * 100}%`

// Cards ease away from the core: left cards to the left, right cards to the right.
const cardDirection = (index: number) => (STAGES[index].side === 'left' ? -1 : 1)

type StageCardProps = {
  index: number
  progress: MotionValue<number>
  open: boolean
  lit: boolean
  selected: boolean
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

// One stage card beside its plate. Hidden at rest; it fades in and eases outward as the stack opens.
const StageCard = ({ index, progress, open, lit, selected, onHover, onSelect }: StageCardProps) => {
  // Hooks
  const opacity = useTransform(progress, [0.35, 0.9], [0, 1])

  const x = useTransform(
    progress,
    [0, 1],
    [-cardDirection(index) * STAGE_CARDS.restInset, cardDirection(index) * STAGE_CARDS.outward]
  )

  // Vars
  const stage = STAGES[index]
  const { edge, width } = STAGE_CARDS[stage.side]
  const left = stage.side === 'left' ? edge : 100 - edge - width

  const handlePointerEnter = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') onHover(index)
  }

  const handlePointerLeave = () => {
    onHover(null)
  }

  return (
    <li
      style={{ top: pct(cornerY(index)), left: `${left}%`, width: `${width}%` }}
      className='pointer-events-auto absolute -translate-y-1/2'
    >
      <m.div
        style={{ opacity, x }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={() => onSelect(index)}
        role='button'
        tabIndex={0}
        aria-pressed={selected}
        className={cn(
          'n3-stage-card px-[0.95em] py-[0.85em] cursor-pointer transition-all duration-300 pointer-events-auto',
          'hover:border-[#FF7A2F]/50 hover:shadow-lg hover:scale-[1.02]',
          selected
            ? 'n3-stage-card-lit border-[#FF7A2F] ring-2 ring-[#FF7A2F]/40 shadow-[0_12px_32px_-8px_rgba(255,122,47,0.35)] scale-[1.03] bg-white'
            : lit
              ? 'n3-stage-card-lit'
              : ''
        )}
      >
        <StageCardBody index={index} selected={selected} />
      </m.div>
    </li>
  )
}

type StageCardsProps = {
  progress: MotionValue<number>
  open: boolean
  hovered: number | null
  selectedLevel: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

/**
 * The five stages as floating cards beside their plates, from tablet up. Font size follows the
 * visual's width (cqw), so the cards keep their place against the plates at every size.
 */
const StageCards = ({ progress, open, hovered, selectedLevel, onHover, onSelect }: StageCardsProps) => {
  return (
    <ul
      aria-label='Niveles de la arquitectura'
      aria-hidden={!open}
      className='pointer-events-none absolute inset-0 m-0 hidden list-none p-0 text-[clamp(10px,1.7cqw,15px)] md:block'
    >
      {STAGES.map((stage, i) => (
        <StageCard
          key={stage.title}
          index={i}
          progress={progress}
          open={open}
          lit={hovered === i}
          selected={selectedLevel === i}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

// ───── assets/motionuikit/svg/syntra-stage-connector.tsx ─────
// Third-party Imports

const ORANGE4 = '#FF7A2F'

/**
 * plate: x of the plate's corner tip; card: x of the card's inner edge; y: the line's height.
 * All in artboard units.
 */
type SyntraStageConnectorProps = {
  className?: string
  plate: number
  card: number
  y: number
  side: 'left' | 'right'
  index: number
  main: boolean
  lit: boolean
  active: boolean
  progress: MotionValue<number>
}

// Where the line meets the plate's corner and the card's node, in artboard units.
const lineEnds = (plate: number, card: number, side: 'left' | 'right') => {
  const dir = side === 'right' ? 1 : -1

  return { plateX: plate + dir * 7, nodeX: card - dir * 10 }
}

// Card → orange node → hairline → the corner of its plate. A bead runs the line while the stack is open.
const SyntraStageConnector = ({
  plate,
  card,
  y,
  side,
  index,
  main,
  lit,
  active,
  progress,
  className
}: SyntraStageConnectorProps) => {
  // Hooks
  const show = useTransform(progress, [0.55, 0.9], [0, 1])
  const t = useMotionValue(0)

  const beadX = useTransform(t, k => {
    const ends = lineEnds(plate, card, side)

    return ends.nodeX + (ends.plateX - ends.nodeX) * k
  })

  const beadOpacity = useTransform([t, show], ([k, s]: number[]) => s * Math.sin(Math.PI * k))

  // Vars
  const { plateX, nodeX } = lineEnds(plate, card, side)

  useEffect(() => {
    if (!active) return

    const controls = animate(t, [0, 1], {
      duration: STAGE_CARDS.beadSeconds,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 1.4,
      delay: 0.5 + index * 0.25
    })

    return () => {
      controls.stop()
      t.set(0)
    }
  }, [active, index, t])

  return (
    <m.svg aria-hidden viewBox={`0 0 ${ARTBOARD} ${ARTBOARD}`} style={{ opacity: show }} className={className}>
      <line x1={plateX} x2={nodeX} y1={y} y2={y} stroke='#CFCAC1' strokeWidth='1' />
      <m.line
        x1={plateX}
        x2={nodeX}
        y1={y}
        y2={y}
        stroke={ORANGE4}
        strokeWidth='1.2'
        initial={false}
        animate={{ opacity: lit ? 0.9 : 0 }}
        transition={{ duration: 0.25 }}
      />
      <circle cx={plateX} cy={y} r='2.6' fill='#A8A399' />
      <m.circle
        cx={nodeX}
        cy={y}
        r={main ? 10 : 8}
        fill={ORANGE4}
        initial={false}
        animate={{ opacity: lit || main ? 0.22 : 0.12 }}
        transition={{ duration: 0.25 }}
      />
      <circle cx={nodeX} cy={y} r='3.6' fill={ORANGE4} />
      <m.circle cx={beadX} cy={y} r='2.6' fill={ORANGE4} style={{ opacity: beadOpacity }} />
    </m.svg>
  )
}

// ───── components/motionuikit/sections/syntra/stage-connectors.tsx ─────
// Third-party Imports

type StageConnectorsProps = {
  progress: MotionValue<number>
  active: boolean
  hovered: number | null
}

// Hairlines from each card to its plate, from tablet up. They tilt and float with the stack.
const StageConnectors = ({ progress, active, hovered }: StageConnectorsProps) => {
  return (
    <div className='pointer-events-none absolute inset-0 hidden md:block'>
      {STAGES.map((stage, i) => {
        const { edge, width } = STAGE_CARDS[stage.side]
        const cardEdge = stage.side === 'left' ? (edge + width) * 10 : (100 - edge - width) * 10

        return (
          <SyntraStageConnector
            key={stage.title}
            plate={tipX(i, stage.side)}
            card={cardEdge}
            y={cornerY(i)}
            side={stage.side}
            index={i}
            main={isMain(stage)}
            lit={hovered === i}
            active={active}
            progress={progress}
            className='pointer-events-none absolute inset-0 size-full overflow-visible'
          />
        )
      })}
    </div>
  )
}

// ───── components/motionuikit/sections/syntra/stage-list.tsx ─────
// Third-party Imports

// On a phone the visual is too narrow for cards beside it, so they sit below it as a grid.
const StageList = ({
  reduce,
  selectedLevel,
  onSelect
}: {
  reduce: boolean
  selectedLevel: number | null
  onSelect: (index: number) => void
}) => {
  return (
    <m.ul
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      aria-label='Niveles de la arquitectura'
      className='m-0 grid list-none grid-cols-1 gap-2.5 p-0 text-[13px] sm:grid-cols-2 md:hidden'
    >
      {STAGES.map((stage, i) => (
        <li
          key={stage.title}
          onClick={() => onSelect(i)}
          className={cn(
            'n3-stage-card px-[1.05em] py-[0.95em] cursor-pointer transition-all',
            selectedLevel === i
              ? 'n3-stage-card-lit border-[#FF7A2F] ring-2 ring-[#FF7A2F]/30 bg-white'
              : 'hover:border-stone-300'
          )}
        >
          <StageCardBody index={i} selected={selectedLevel === i} />
        </li>
      ))}
    </m.ul>
  )
}

// ───── components/motionuikit/sections/syntra/core-visual.tsx ─────
// Third-party Imports

// Follows the tab being shown or hidden, for useSyncExternalStore
const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)

  return () => document.removeEventListener('visibilitychange', onChange)
}

const isPageVisible = () => !document.hidden

// The server has no tab to hide, so it renders as shown
const isPageVisibleOnServer = () => true

type ParallaxLayerProps = {
  x: MotionValue<number>
  y: MotionValue<number>
  reach: number
  children: ReactNode
}

// Each layer slides against the pointer by a different amount, which is what reads as depth.
const ParallaxLayer = ({ x, y, reach, children }: ParallaxLayerProps) => {
  // Hooks
  const tx = useTransform(x, v => v * reach)
  const ty = useTransform(y, v => v * reach)

  return (
    <m.div style={{ x: tx, y: ty }} className='pointer-events-none absolute inset-0'>
      {children}
    </m.div>
  )
}

type TiltedProps = {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  children: ReactNode
}

// The tilt toward the cursor and the slow float, shared by every layer that moves with the stack.
const Tilted = ({ rotateX, rotateY, children }: TiltedProps) => {
  return (
    <div className='pointer-events-none absolute inset-0 [perspective:1400px]'>
      <m.div style={{ rotateX, rotateY }} className='absolute inset-0'>
        <div className='n3-float absolute inset-0'>{children}</div>
      </m.div>
    </div>
  )
}

const CoreVisual = () => {
  // States
  const [open, setOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  // Refs
  const pointerType = useRef('mouse')
  const visualRef = useRef<HTMLDivElement>(null)

  // Hooks
  const reduce = useReducedMotion() ?? false

  // The margin covers the outer orbit and its beads running a little past the visual's box
  const onScreen = useInView(visualRef, { initial: true, margin: '40px' })
  const pageVisible = useSyncExternalStore(subscribeToVisibility, isPageVisible, isPageVisibleOnServer)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, { stiffness: 55, damping: 18, mass: 0.9 })
  const y = useSpring(py, { stiffness: 55, damping: 18, mass: 0.9 })
  const rotateY = useTransform(x, v => v * MOTION.tiltDegrees)

  // When a level is selected, the stack stays steadily open
  const isExploded = open || selectedLevel !== null
  const activeHovered = hovered !== null ? hovered : selectedLevel

  // 0 = stacked, 1 = apart. One spring drives the plates, connectors, cards and shadow together.
  const target = useMotionValue(0)
  const progress = useSpring(target, reduce ? { duration: 0.01 } : EXPLODE.spring)

  // While it is open the stack also leans back a little more, which is where the extra depth comes from.
  const rotateX = useTransform([y, progress], ([v, p]: number[]) => v * -MOTION.tiltDegrees + p * 4)
  const restOpacity = useTransform(progress, [0, 0.04], [1, 0])
  const explodedOpacity = useTransform(progress, [0, 0.03], [0, 1])
  const shadowOpacity = useTransform(progress, [0, 1], [1, 0.55])

  // The orbits step back while the stack is open, so the plates and cards have the stage.
  const orbitOpacity = useTransform(progress, [0, 0.6], [1, MOTION.orbitOpenOpacity])

  // The hint under the core bows out as soon as the stack starts to open.
  const hintOpacity = useTransform(progress, [0, 0.25], [1, 0])

  // Vars

  // The beads hold still while the stack is open, off screen or in a hidden tab
  const beadsPaused = isExploded || !onScreen || !pageVisible

  useEffect(() => {
    target.set(isExploded ? 1 : 0)
  }, [isExploded, target])

  const handleSelectLevel = (index: number) => {
    setSelectedLevel(prev => (prev === index ? null : index))
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return

    const box = e.currentTarget.getBoundingClientRect()

    px.set(((e.clientX - box.left) / box.width - 0.5) * 2)
    py.set(((e.clientY - box.top) / box.height - 0.5) * 2)
  }

  const handlePointerLeave = () => {
    px.set(0)
    py.set(0)
    if (selectedLevel === null) {
      setOpen(false)
    }
  }

  // Hovering a card lights its connector and opens the stack, the same as hovering the core.
  const handleCardHover = (index: number | null) => {
    setHovered(index)
    if (index !== null && !reduce) setOpen(true)
  }

  const handleCorePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    pointerType.current = e.pointerType
  }

  const handleCorePointerEnter = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && !reduce) setOpen(true)
  }

  // A mouse opens it by hovering the core. Touch and keyboard have no hover, so they toggle instead.
  const handleCoreClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0 || pointerType.current !== 'mouse') {
      if (selectedLevel !== null) {
        setSelectedLevel(null)
      } else {
        setOpen(v => !v)
      }
    }
  }

  const handleCoreBlur = () => {
    if (selectedLevel === null) {
      setOpen(false)
    }
  }

  return (
    <LazyMotion features={domAnimation}>
      <>
        {/* Fades and scales in with CSS (n3-enter), from the first paint rather than after hydration. */}
        <div
          ref={visualRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className='n3-enter @container relative -my-[6%] -ml-[12.5%] aspect-square w-[125%] max-w-none md:mx-auto md:my-0 md:w-full md:max-w-[840px] lg:mx-0 lg:w-[104%] lg:max-w-none'
        >
          <div className='absolute inset-0'>
            <div aria-hidden className='n3-halo pointer-events-none absolute inset-[6%]' />

            <div className='n3-fade-edge absolute inset-0'>
              <ParallaxLayer x={x} y={y} reach={-MOTION.backdropParallax}>
                <SyntraDepthBackdrop className='absolute inset-0 size-full overflow-visible' />
                <SyntraTechnicalBackdrop className='absolute inset-0 size-full overflow-visible' />
              </ParallaxLayer>
            </div>

            {/**
             * The orbits sit outside the faded layer: the outer ring runs past the visual's box, and a
             * mask would cut it off there.
             */}
            <ParallaxLayer x={x} y={y} reach={MOTION.ringParallax}>
              <m.div style={{ opacity: orbitOpacity }} className='absolute inset-0'>
                <SyntraOrbitalSystem className='absolute inset-0 size-full overflow-visible' />
                <SyntraParticles
                  half='back'
                  animate={!reduce}
                  paused={beadsPaused}
                  className='absolute inset-0 size-full overflow-visible'
                />
              </m.div>
            </ParallaxLayer>

            <m.div style={{ opacity: shadowOpacity }} className='absolute inset-0'>
              <SyntraCoreShadow className='pointer-events-none absolute inset-0 size-full overflow-visible' />
            </m.div>

            <Tilted rotateX={rotateX} rotateY={rotateY}>
              <m.div style={{ opacity: restOpacity }} className='absolute inset-0'>
                <SyntraCoreObject className='absolute inset-0 size-full overflow-visible' />
              </m.div>
              <m.div style={{ opacity: explodedOpacity }} className='absolute inset-0'>
                <SyntraExplodedCore
                  progress={progress}
                  selectedLevel={selectedLevel}
                  onSelectLevel={handleSelectLevel}
                  className='absolute inset-0 size-full overflow-visible'
                />
              </m.div>
              <StageConnectors progress={progress} active={isExploded && !reduce} hovered={activeHovered} />
            </Tilted>

            <ParallaxLayer x={x} y={y} reach={MOTION.ringParallax}>
              <m.div style={{ opacity: orbitOpacity }} className='absolute inset-0'>
                <SyntraParticles
                  half='front'
                  animate={!reduce}
                  paused={beadsPaused}
                  className='absolute inset-0 size-full overflow-visible'
                />
              </m.div>
            </ParallaxLayer>

            {/* The cards ride the same tilt and float in a layer of their own, above the front orbit. */}
            <Tilted rotateX={rotateX} rotateY={rotateY}>
              <StageCards
                progress={progress}
                open={isExploded}
                hovered={hovered}
                selectedLevel={selectedLevel}
                onHover={handleCardHover}
                onSelect={handleSelectLevel}
              />
            </Tilted>
          </div>

          {/* Invitation under the core */}
          <m.p
            aria-hidden
            style={{ opacity: hintOpacity }}
            className='text-(color:--color-n3-grey) pointer-events-none absolute top-[84%] left-1/2 m-0 flex -translate-x-1/2 items-center gap-1.5 text-[12.5px] whitespace-nowrap'
          >
            <MousePointer2 className='text-(color:--color-n3-accent) size-3.5' strokeWidth={1.8} />
            <span className='[@media(hover:none)]:hidden'>Pasa el cursor o selecciona un nivel</span>
            <span className='hidden [@media(hover:none)]:inline'>Toca para seleccionar un nivel</span>
          </m.p>

          <button
            type='button'
            aria-expanded={isExploded}
            aria-label='Explorar niveles del núcleo'
            onPointerDown={handleCorePointerDown}
            onPointerEnter={handleCorePointerEnter}
            onClick={handleCoreClick}
            onBlur={handleCoreBlur}
            className='focus-visible:outline-(color:--color-n3-accent) absolute top-[30%] left-[22%] h-[44%] w-[56%] cursor-pointer rounded-[3rem] focus-visible:outline-2 focus-visible:outline-offset-4'
          />
        </div>

        {/* Interactive Level Selector Controller: allows instant direct selection of levels */}
        <div className='relative z-30 mx-auto mt-4 mb-2 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 px-3'>
          <span className='mr-1 hidden text-[11px] font-semibold uppercase tracking-wider text-stone-400 sm:inline'>
            Niveles:
          </span>
          {STAGES.map((s, idx) => {
            const isSel = selectedLevel === idx
            return (
              <button
                key={s.title}
                type='button'
                onClick={() => handleSelectLevel(idx)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 shadow-sm',
                  isSel
                    ? 'bg-[#FF7A2F] text-white border border-[#FF7A2F] shadow-[#FF7A2F]/30 shadow-md scale-105'
                    : 'bg-white/90 text-stone-700 border border-stone-200/90 hover:border-[#FF7A2F]/50 hover:bg-orange-50/40'
                )}
              >
                <span
                  className={cn(
                    'size-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isSel ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  )}
                >
                  {idx + 1}
                </span>
                <span>{s.title}</span>
              </button>
            )
          })}
          {selectedLevel !== null && (
            <button
              type='button'
              onClick={() => setSelectedLevel(null)}
              className='inline-flex cursor-pointer items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800'
            >
              <X className='size-3.5' />
              <span>Cerrar</span>
            </button>
          )}
        </div>

        <StageList reduce={reduce} selectedLevel={selectedLevel} onSelect={handleSelectLevel} />
      </>
    </LazyMotion>
  )
}

// ───── components/motionuikit/sections/syntra/flip-label.tsx ─────
// Third-party Imports

/**
 * A button label drawn as two identical faces of a small cube. Put `n3-flip` on the button and
 * hovering it turns the cube over; the twin face is hidden from screen readers.
 */
const FlipLabel = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <span className='n3-flip-box'>
      <span className={cn('n3-flip-face', className)}>{children}</span>
      <span aria-hidden className={cn('n3-flip-face n3-flip-back', className)}>
        {children}
      </span>
    </span>
  )
}

// ───── components/motionuikit/sections/syntra/hero-copy.tsx ─────
// Third-party Imports

const ICONS = { users: Users, star: Star, shield: ShieldCheck }

/**
 * The rise is a CSS animation (n3-rise in index.css), so the copy plays in from the first paint
 * rather than after hydration.
 */
const rise = (delay: number) => ({ style: { animationDelay: `${delay}s` } })

const HeroCopy = () => {
  return (
    <div className='flex flex-col justify-center'>
      <p
        {...rise(0.1)}
        className='n3-rise text-(color:--color-n3-grey) flex items-center gap-3 text-[12px] font-medium tracking-[0.22em] uppercase'
      >
        <span aria-hidden className='n3-dot bg-(color:--color-n3-accent) size-2 rounded-full' />
        {COPY.eyebrow}
      </p>

      <h1 id='n3-title' {...rise(0.18)} className='n3-rise n3-h1 text-(color:--color-n3-ink) mt-7 font-normal'>
        {COPY.headline.map((line, i) => (
          <span key={line} className='block'>
            {line}
            {i === COPY.headline.length - 1 && <span className='text-(color:--color-n3-accent)'> {COPY.accentWord}</span>}
          </span>
        ))}
      </h1>

      <p {...rise(0.3)} className='n3-rise text-(color:--color-n3-grey) mt-7 max-w-[30rem] text-[17px] leading-[1.6] lg:text-[19px]'>
        {COPY.body}
      </p>

      <div {...rise(0.4)} className='n3-rise mt-9 flex flex-wrap items-center gap-3'>
        <a
          href='#start'
          className='n3-flip bg-(color:--color-n3-accent) focus-visible:outline-(color:--color-n3-ink) inline-flex h-13 items-center rounded-full px-7 text-[16px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-14'
        >
          <FlipLabel className='gap-2.5'>
            {COPY.primaryCta}
            <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden />
          </FlipLabel>
        </a>
        <a
          href='#how-it-works'
          className='n3-flip border-(color:--color-n3-line) text-(color:--color-n3-ink) focus-visible:outline-(color:--color-n3-accent) inline-flex h-13 items-center rounded-full border bg-white/50 px-6 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-14'
        >
          <FlipLabel className='gap-3'>
            <span className='border-(color:--color-n3-ink) grid size-5 place-items-center rounded-full border'>
              <Play className='size-2.5 fill-current' strokeWidth={0} aria-hidden />
            </span>
            {COPY.secondaryCta}
          </FlipLabel>
        </a>
      </div>

      <dl {...rise(0.58)} className='n3-rise mt-12 grid grid-cols-3 sm:flex sm:items-stretch lg:mt-20'>
        {METRICS.map(({ value, label, icon }, i) => {
          const Icon = ICONS[icon]

          return (
            <div
              key={label}
              className={cn(
                'flex flex-col items-start gap-2 pr-3 sm:flex-row sm:items-center sm:gap-3 sm:pr-8',
                i > 0 && 'border-(color:--color-n3-line) border-l pl-4 sm:pl-8'
              )}
            >
              {/* 32px, centred on the two 20px lines beside it. */}
              <Icon className='text-(color:--color-n3-ink) size-8 shrink-0' strokeWidth={1.25} aria-hidden />
              <div>
                <dd className='text-(color:--color-n3-ink) text-[14px] leading-5 font-medium'>{value}</dd>
                <dt className='text-(color:--color-n3-grey) text-[13px] leading-5'>{label}</dt>
              </div>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

// ───── assets/motionuikit/svg/syntra-floor-grid.tsx ─────
// One diamond of the isometric floor: the same 30° axes the core is drawn on, 48px along each edge.
const CELL = { w: 84, h: 48 }

/**
 * The floor grid behind the whole hero, as a repeating pattern. Where it shows is decided by the
 * CSS masks in index.css; see hero-floor.tsx for the two copies (quiet grey, and the orange spotlight).
 */
type SyntraFloorGridProps = SVGProps<SVGSVGElement> & { id: string; stroke?: string; strokeWidth?: number }

const SyntraFloorGrid = ({ id, stroke = '#D3CFC6', strokeWidth = 0.8, ...props }: SyntraFloorGridProps) => {
  return (
    <svg aria-hidden width='100%' height='100%' {...props}>
      <defs>
        <pattern id={id} width={CELL.w} height={CELL.h} patternUnits='userSpaceOnUse'>
          <path
            d={`M0 ${CELL.h / 2}L${CELL.w / 2} 0L${CELL.w} ${CELL.h / 2}M0 ${CELL.h / 2}L${CELL.w / 2} ${CELL.h}L${CELL.w} ${CELL.h / 2}`}
            fill='none'
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill={`url(#${id})`} />
    </svg>
  )
}

// ───── components/motionuikit/sections/syntra/hero-floor.tsx ─────
// Diameter of the cursor spotlight, in px.
const SPOT = 340

/**
 * The floor grid, plus an orange copy seen through a round window that follows the cursor. Window
 * and grid move only by opposite transforms, so nothing repaints and the orbits stay smooth; it
 * listens on the hero section, since the grid sits behind the content and never gets the pointer.
 */
const HeroFloor = () => {
  // Refs
  const ref = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const litRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const spot = spotRef.current
    const lit = litRef.current
    const section = el?.parentElement

    if (!el || !spot || !lit || !section) return

    // The orange grid matches the section's size, so its pattern lines up with the grey one.
    const resize = new ResizeObserver(([entry]) => {
      lit.style.width = `${entry.contentRect.width}px`
      lit.style.height = `${entry.contentRect.height}px`
    })

    resize.observe(section)

    let frame = 0

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = section.getBoundingClientRect()
        const x = e.clientX - box.left - SPOT / 2
        const y = e.clientY - box.top - SPOT / 2

        spot.style.transform = `translate3d(${x}px, ${y}px, 0)`
        lit.style.transform = `translate3d(${-x}px, ${-y}px, 0)`
        el.dataset.spot = 'on'
      })
    }

    const handlePointerLeave = () => {
      cancelAnimationFrame(frame)
      el.dataset.spot = 'off'
    }

    section.addEventListener('pointermove', handlePointerMove)
    section.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      section.removeEventListener('pointermove', handlePointerMove)
      section.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden data-spot='off' className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
      <SyntraFloorGrid id='n3-floor-cell' className='n3-floor absolute inset-0' />
      <div ref={spotRef} style={{ width: SPOT, height: SPOT }} className='n3-floor-spot'>
        <div ref={litRef} className='n3-floor-lit'>
          <SyntraFloorGrid id='n3-floor-cell-lit' stroke='#FF7A2F' strokeWidth={1} className='block size-full' />
        </div>
      </div>
    </div>
  )
}

// ───── components/motionuikit/sections/syntra/hero.tsx ─────
const Hero = () => {
  return (
    <section id='top' aria-labelledby='n3-title' className='n3-hero relative isolate overflow-x-clip'>
      <HeroFloor />
      <div className='n3-frame mx-auto grid max-w-360 items-center gap-6 pt-6 pb-12 lg:min-h-[inherit] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-20'>
        <HeroCopy />
        <CoreVisual />
      </div>
    </section>
  )
}

// ───── assets/motionuikit/svg/syntra-mark.tsx ─────
/**
 * The Andrés Morales AM mark: precise monogram with apex, open portal, and 3 glowing orange dots.
 * Drawn flat for 2D nav contexts and mapped to 3D isometric planes on the core.
 */
const SyntraMark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox='-32 -16 64 32' aria-hidden {...props}>
      <defs>
        <linearGradient id='n3-mark-grad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#FF9A5C' />
          <stop offset='1' stopColor='#FF7A2F' />
        </linearGradient>
      </defs>
      <AMLogoMark fillDark='#171717' fillOrange='url(#n3-mark-grad)' />
    </svg>
  )
}

// ───── components/motionuikit/sections/syntra/navbar.tsx ─────
// Third-party Imports

const Navbar = () => {
  // States
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Refs
  const wrapRef = useRef<HTMLDivElement>(null)

  // Hooks
  const reduce = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * The hero fills what the nav leaves, so the nav's real height (wrapper included) is measured,
   * and re-measured whenever it wraps, resizes or the web font lands.
   */
  useEffect(() => {
    const el = wrapRef.current
    const root = el?.closest<HTMLElement>('.n3-root')

    if (!el || !root) return

    const measure = () => root.style.setProperty('--n3-nav-space', `${el.getBoundingClientRect().height}px`)
    const observer = new ResizeObserver(measure)

    measure()
    observer.observe(el)
    document.fonts?.ready.then(measure)

    return () => observer.disconnect()
  }, [])

  const handleMenuToggle = () => {
    setOpen(v => !v)
  }

  const handleMenuClose = () => {
    setOpen(false)
  }

  return (
    <LazyMotion features={domAnimation}>
      <header ref={wrapRef} className='n3-drop sticky top-0 z-50'>
        <div className={cn('n3-nav-bar', (scrolled || open) && 'n3-nav-bar-scrolled')}>
          <nav
            aria-label='Primary'
            className='n3-frame mx-auto flex h-18 max-w-360 items-center justify-between lg:h-24'
          >
            <a href='#top' aria-label='syntra home' className='text-(color:--color-n3-ink) flex items-center gap-2.5'>
              <SyntraMark className='size-9' />
              <span className='text-[26px] font-medium tracking-[-0.04em]'>syntra</span>
            </a>

            <ul className='hidden items-center gap-10 lg:flex'>
              {NAV_LINKS.map(({ label }) => (
                <li key={label}>
                  <a
                    href={`#${label.toLowerCase()}`}
                    className='text-(color:--color-n3-ink) hover:text-(color:--color-n3-accent) focus-visible:text-(color:--color-n3-accent) inline-flex items-center py-2 text-[16px] transition-colors duration-200 focus-visible:outline-none'
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div className='flex items-center gap-2 sm:gap-4'>
              <a
                href='#log-in'
                className='text-(color:--color-n3-ink) hover:text-(color:--color-n3-accent) hidden px-3 py-2 text-[16px] transition-colors duration-200 sm:block'
              >
                Log in
              </a>
              <a
                href='#get-started'
                className='n3-flip bg-(color:--color-n3-ink) focus-visible:outline-(color:--color-n3-accent) inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-13 sm:px-6 sm:text-[16px]'
              >
                <FlipLabel className='gap-2'>
                  Get Started
                  <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden />
                </FlipLabel>
              </a>
              <button
                type='button'
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls='n3-mobile-menu'
                onClick={handleMenuToggle}
                className='text-(color:--color-n3-ink) grid size-11 place-items-center rounded-full lg:hidden'
              >
                {open ? <X className='size-5' strokeWidth={1.6} /> : <Menu className='size-5' strokeWidth={1.6} />}
              </button>
            </div>
          </nav>

          <AnimatePresence initial={false}>
            {open && (
              <m.div
                id='n3-mobile-menu'
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE }}
                className='n3-frame pb-5 lg:hidden'
              >
                <ul className='border-(color:--color-n3-ink)/8 flex flex-col border-t pt-2'>
                  {[...NAV_LINKS.map(l => l.label), 'Log in'].map(label => (
                    <li key={label}>
                      <a
                        href={`#${label.toLowerCase().replace(' ', '-')}`}
                        onClick={handleMenuClose}
                        className='text-(color:--color-n3-ink) flex h-12 items-center text-[16px]'
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </LazyMotion>
  )
}

// ───── components/motionuikit/sections/syntra/index.tsx ─────
// Onest at the weights the block uses: 400 for the headline, 500 for labels and buttons, 600 for card titles.
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&display=swap'

const motionVars = {
  '--n3-float': MOTION.floatDistance,
  '--n3-float-seconds': `${MOTION.floatSeconds}s`
} as CSSProperties

const CoreHeroBase = ({ withNavbar = true }: { withNavbar?: boolean }) => {
  return (
    <>
      <div style={motionVars} className='n3-root n3-bg font-(family-name:--font-n3-sans) text-(color:--color-n3-ink) w-full antialiased'>
        {withNavbar && <Navbar />}
        <Hero />
      </div>
    </>
  )
}

type CoreHeroProps = {
  withNavbar?: boolean;
}

const CoreHero = ({ withNavbar = true }: CoreHeroProps) => (
  <>
    <style>{BLOCK_CSS}</style>
    <CoreHeroBase withNavbar={withNavbar} />
  </>
)

export { Hero, Navbar, CoreVisual, HeroCopy, CoreHero }
export default CoreHero
