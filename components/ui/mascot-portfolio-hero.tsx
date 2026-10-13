"use client";

import * as React from "react";

/* ------------------------------------------------------------------ types
 *
 * Caricature-tuned for Andrés Morales (andresmorales.com.co) 2026-10:
 *   - Hair instead of beanie (short, dark, receding hairline)
 *   - Beard + mustache (#1a1410) inside the `face` layer so they parallax
 *     with the head; `face.dx` reduced to `x * 18` in pose() so the
 *     beard edge stays welded to the jaw at full deflection
 *   - Turquoise jacket (#2fb5a8) with an African-print inner-collar pattern
 *     (green / yellow / red / white vertical stripes) over a black ribbed
 *     tank top
 *   - Calmer, slightly asymmetric smile — no big red tongue
 *   - `photoSrc` optional: drop a transparent-background PNG into /public
 *     (square, min 800px) and pass it in to override the illustration
 */

export type MascotPortfolioHeroProps = {
  /** Height of the hero. Never pass `"100%"`. */
  height?: string;
  /** Floor for the height. */
  minHeight?: string;

  /* ---- top rule ---- */
  index?: string;
  discipline?: string;
  tagline?: string;
  collection?: [string, string];
  reel?: [string, string];

  /* ---- headline ---- */
  year?: string;
  initials?: string;
  badge?: string;
  line2?: string;
  line3?: string;
  word?: string;
  verticalTag?: string;
  bracketed?: string;

  /* ---- pill and services ---- */
  seekingLabel?: string;
  seeking?: string;
  href?: string;
  services?: string[];

  /* ---- the character ---- */
  greetings?: string[];
  skin?: string;
  /** Legacy prop — kept for back-compat; no longer rendered (beanie removed). */
  beanie?: string;
  shirt?: string;
  /** Legacy prop — kept for back-compat; no longer rendered. */
  tag?: string;
  /** Optional transparent-background PNG of the user's face; overrides the
   * illustrated look. Place at /public/andres-face.png (square, min 800px). */
  photoSrc?: string;

  /* ---- palette ---- */
  accent?: string;
  paper?: string;
  ink?: string;
  className?: string;
};

// CSS variables `--font-inter` and `--font-archivo-black` are exposed by
// next/font in app/layout.tsx and applied via the root <html> className.
// The fallback stack keeps the type legible before the woff2 lands.
const SANS_STACK =
  'var(--font-inter), "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
const DISPLAY_STACK =
  'var(--font-archivo-black), "Arial Black", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

const CW = 600;
const CH = 720;

/* --------------------------------------------------------------- the gaze */

export function aim(
  px: number,
  py: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  const sat = (v: number) => v / Math.sqrt(1 + v * v);
  return [sat((px - cx) / rx), sat((py - cy) / ry)];
}

export function approach(cur: number, target: number, dt: number, rate: number) {
  return target + (cur - target) * Math.exp(-rate * dt);
}

export function pose(x: number, y: number, near: number) {
  return {
    body: { dx: x * 4, dy: 0 },
    head: { dx: x * 10, dy: y * 7, rot: x * 4 },
    ears: { dx: -x * 7, dy: -y * 3, lead: 1 + x * 0.16, trail: 1 - x * 0.16 },
    hair: { dx: x * 13, dy: y * 4 },
    blush: { dx: x * 20, dy: y * 14 },
    // 18 (was 28): the beard rides this layer and would detach from the jaw
    // at the larger offset when the head turns hard.
    face: { dx: x * 18, dy: y * (y < 0 ? 11 : 20) },
    nose: { dx: x * 10, dy: y * 7 },
    eyes: { dx: x * 4, dy: y * 4, scale: 1 + near * 0.14 },
    brows: { dx: x * 3, dy: y * 2 + Math.min(0, y) * 3 - near * 9 },
  };
}

export function blink(since: number) {
  const d = 0.15;
  if (since < 0 || since > d) return 1;
  return 1 - Math.sin((Math.PI * since) / d) * 0.92;
}

/* ------------------------------------------------------------- the room */

type Seg = [number, number, number, number];

function room(): { back: Seg[]; rays: Seg[]; depth: string[] } {
  const x0 = 95;
  const x1 = 905;
  const y0 = 85;
  const y1 = 865;
  const vx = (x0 + x1) / 2;
  const vy = (y0 + y1) / 2;
  const cols = 14;
  const rows = 11;
  const back: Seg[] = [];
  const rays: Seg[] = [];
  const out = (x: number, y: number): Seg => {
    const dx = x - vx;
    const dy = y - vy;
    const tx = dx > 0 ? (1000 - x) / dx : dx < 0 ? -x / dx : Infinity;
    const ty = dy > 0 ? (1000 - y) / dy : dy < 0 ? -y / dy : Infinity;
    const t = Math.min(tx, ty);
    return [x, y, x + dx * t, y + dy * t];
  };
  for (let i = 0; i <= cols; i++) {
    const x = x0 + ((x1 - x0) * i) / cols;
    back.push([x, y0, x, y1]);
    rays.push(out(x, y0), out(x, y1));
  }
  for (let j = 0; j <= rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows;
    back.push([x0, y, x1, y]);
    rays.push(out(x0, y), out(x1, y));
  }
  const depth = [1.07, 1.16, 1.28, 1.45, 1.7].map((s) => {
    const l = vx + (x0 - vx) * s;
    const r = vx + (x1 - vx) * s;
    const t = vy + (y0 - vy) * s;
    const b = vy + (y1 - vy) * s;
    return "M" + l + " " + t + "H" + r + "V" + b + "H" + l + "Z";
  });
  return { back, rays, depth };
}

const ROOM = room();

function flowerPath() {
  const n = 180;
  const lens = [1, 0.84, 0.95, 0.78, 0.9];
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = Math.floor(((a + Math.PI / 5) / (Math.PI * 2)) * 5) % 5;
    const lobe = Math.pow(Math.abs(Math.cos((a * 5) / 2)), 0.9);
    const r = 50 * (0.3 + 0.7 * lobe * lens[k]);
    const x = 60 + Math.cos(a - Math.PI / 2) * r;
    const y = 60 + Math.sin(a - Math.PI / 2) * r;
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d + "Z";
}

const FLOWER = flowerPath();

/* ----------------------------------------------------------------- styles */

const CSS = `
.mph-root{position:relative;width:100%;overflow:hidden;isolation:isolate;background:var(--mph-paper);color:var(--mph-ink);container:mph / size;font-family:var(--mph-sans);-webkit-font-smoothing:antialiased;}
.mph-room{position:absolute;inset:0;width:100%;height:100%;display:block;color:var(--mph-ink);pointer-events:none;}
.mph-room line,.mph-room path{vector-effect:non-scaling-stroke;}
.mph-stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100cqw,177.78cqh);aspect-ratio:16/9;container:mphs / inline-size;}

.mph-top{position:absolute;left:4.6%;right:4.6%;top:4.4%;display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;column-gap:2.4cqw;font-size:1.05cqw;font-weight:800;line-height:1.1;text-transform:uppercase;letter-spacing:.02em;}
.mph-index{display:inline-flex;align-items:center;gap:.9em;border:.12cqw solid var(--mph-ink);border-radius:999px;padding:.12em .9em .12em .12em;font-size:.72em;}
.mph-index b{background:var(--mph-accent);color:var(--mph-ink);border-radius:999px;padding:.3em 1.2em;font-weight:800;}
.mph-tagline{font-size:1.18em;font-weight:900;margin-left:1cqw;}
.mph-brace{grid-column:4;font-size:1.3em;font-weight:700;letter-spacing:.04em;margin-right:2.6cqw;}
.mph-reel{grid-column:5;display:flex;align-items:center;gap:.8em;font-size:.8em;text-align:right;}
.mph-reel i{display:block;width:1.9em;height:1.9em;border-radius:50%;background:var(--mph-accent);border:.12cqw solid var(--mph-ink);flex:none;}

.mph-h1{position:absolute;left:8.8%;top:17.5%;margin:0;font-family:var(--mph-display);font-weight:900;font-size:6.5cqw;line-height:.93;letter-spacing:-.045em;text-transform:uppercase;color:var(--mph-ink);}
.mph-line{display:block;width:max-content;white-space:nowrap;position:relative;}
.mph-ch{display:inline-block;transition:transform .35s cubic-bezier(0.22, 1, 0.36, 1),color .2s;}
.mph-ch:hover{transform:translateY(-.08em) rotate(-4deg);color:var(--mph-accent);}
.mph-arrow{display:inline-block;width:.6em;height:.6em;margin:0 .06em 0 .1em;vertical-align:-.02em;}
.mph-arrow path{stroke:currentColor;stroke-width:15;fill:none;stroke-linecap:square;}
.mph-badge{position:absolute;top:-.02em;left:calc(100% + .55em);font-family:var(--mph-sans);font-size:.2em;font-weight:800;letter-spacing:0;line-height:1;text-transform:none;border:.13cqw solid var(--mph-ink);border-radius:50%;padding:.75em 1.15em;transform:rotate(-9deg);transition:background .25s,transform .4s cubic-bezier(0.22, 1, 0.36, 1);cursor:default;}
.mph-badge sup{font-size:.7em;margin-left:.1em;}
.mph-badge:hover{background:var(--mph-accent);transform:rotate(6deg) scale(1.08);}
.mph-swash{position:relative;display:inline-block;}
.mph-swash svg{position:absolute;left:-.95em;top:.3em;width:2.55em;height:.72em;overflow:visible;pointer-events:none;}
.mph-swash path{fill:none;stroke:var(--mph-ink);stroke-width:.2cqw;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0;animation:mph-draw 1.6s .5s cubic-bezier(.6,0,.2,1) both;}
.mph-h1:hover .mph-swash path{animation:mph-draw 1.1s cubic-bezier(.6,0,.2,1) both;}
.mph-l4{font-size:1.2em;letter-spacing:-.02em;margin-top:.04em;}
.mph-vtag{display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:-.02em;margin:0 .1em 0 .06em;width:.2em;}
.mph-vtag span{display:block;background:var(--mph-ink);color:var(--mph-paper);writing-mode:vertical-rl;font-family:var(--mph-sans);font-size:.105em;font-weight:800;letter-spacing:.12em;padding:.55em 0;text-align:center;}
.mph-vtag i{display:block;height:.34em;background:repeating-linear-gradient(to bottom,var(--mph-ink) 0 .02em,transparent .02em .045em);}
.mph-bracket{position:relative;display:inline-block;padding:0 .08em;}
.mph-bracket svg{position:absolute;left:-.02em;right:-.02em;top:-.1em;bottom:-.12em;width:calc(100% + .04em);height:calc(100% + .22em);overflow:visible;}
.mph-bracket path{fill:none;stroke:var(--mph-ink);stroke-width:.62cqw;stroke-linecap:butt;transition:transform .45s cubic-bezier(0.22, 1, 0.36, 1);}
.mph-bracket:hover .mph-arc-t{transform:translateY(-10px);}
.mph-bracket:hover .mph-arc-b{transform:translateY(10px);}
.mph-star{display:inline-block;font-size:.66em;vertical-align:.5em;margin-left:.02em;transition:transform .6s cubic-bezier(0.22, 1, 0.36, 1);}
.mph-l4:hover .mph-star{transform:rotate(180deg) scale(1.2);}

.mph-pill{position:absolute;left:8.8%;top:72.8%;display:flex;align-items:stretch;font-size:1.72cqw;font-weight:800;line-height:1;}
.mph-pill-a{position:relative;z-index:1;background:#fff;color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:999px;padding:.72em 1.25em;}
.mph-pill-b{display:inline-flex;align-items:center;gap:.45em;margin-left:-1.4em;padding:.72em 3.4em .72em 3.1em;background:var(--mph-accent);color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:0 999px 999px 0;text-decoration:none;transition:background .25s,color .25s,padding .35s cubic-bezier(0.34, 1.56, 0.64, 1);}
.mph-pill-b em{font-style:normal;display:inline-block;width:0;overflow:hidden;opacity:0;transition:width .35s,opacity .25s;}
.mph-pill-b:hover,.mph-pill-b:focus-visible{background:var(--mph-ink);color:var(--mph-paper);padding-right:2.4em;outline:none;}
.mph-pill-b:hover em,.mph-pill-b:focus-visible em{width:1em;opacity:1;}

.mph-flower{position:absolute;left:35.4%;top:64%;width:7.4%;aspect-ratio:1;animation:mph-spin 22s linear infinite;cursor:grab;}
.mph-flower svg{display:block;width:100%;height:100%;overflow:visible;transition:transform .5s cubic-bezier(0.22, 1, 0.36, 1);}
.mph-flower:hover svg{transform:scale(1.18) rotate(40deg);}
.mph-flower path{fill:#fff;stroke:var(--mph-ink);stroke-width:2.6;stroke-linejoin:round;}
.mph-curl{position:absolute;left:43.2%;top:52.5%;width:5.6%;aspect-ratio:1;overflow:visible;pointer-events:none;}
.mph-curl path{fill:none;stroke:var(--mph-ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;animation:mph-draw 1.4s 1s cubic-bezier(.6,0,.2,1) both;}

.mph-services{position:absolute;left:4.6%;bottom:4.6%;display:flex;gap:4cqw;margin:0;padding:0;list-style:none;font-size:1.3cqw;font-weight:800;}
.mph-services li{position:relative;cursor:default;padding-bottom:.25em;}
.mph-services li::after{content:"";position:absolute;left:0;right:0;bottom:0;height:.18em;background:var(--mph-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.6,0,.2,1);}
.mph-services li:hover::after{transform:scaleX(1);}

.mph-rule{position:absolute;width:0;border-left:.1cqw solid var(--mph-ink);}
.mph-rule::after{content:"";position:absolute;bottom:0;left:-.1cqw;width:1.1cqw;border-top:.1cqw solid var(--mph-ink);transform:rotate(28deg);transform-origin:left;}
.mph-rule-l{left:3.7%;top:23%;height:13%;}
.mph-rule-r{left:94.8%;top:66%;height:13%;}

.mph-char{position:absolute;left:55.5%;bottom:-1.2%;width:40.5%;aspect-ratio:600/720;padding:0;margin:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:40% 40% 8% 8%;}
.mph-char:focus-visible{outline:.2cqw dashed var(--mph-ink);outline-offset:.4cqw;}
.mph-char svg{display:block;width:100%;height:100%;overflow:visible;}
.mph-bubble{position:absolute;left:-4%;top:6%;max-width:46%;background:#fff;color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:1.4em 1.4em 1.4em .2em;padding:.8em 1.1em;font-size:1.3cqw;font-weight:800;line-height:1.2;text-align:left;box-shadow:.35cqw .35cqw 0 var(--mph-accent);transform-origin:0 100%;transform:scale(0) rotate(-8deg);opacity:0;transition:transform .45s cubic-bezier(0.22, 1, 0.36, 1),opacity .2s;pointer-events:none;}
.mph-bubble[data-on="true"]{transform:scale(1) rotate(-4deg);opacity:1;}

@keyframes mph-draw{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}
@keyframes mph-spin{to{transform:rotate(360deg);}}

@container mph (orientation: portrait){
.mph-stage{top:0;transform:translateX(-50%);width:min(100cqw,56.25cqh);height:100cqh;aspect-ratio:auto;}
.mph-top{top:5cqw;left:6%;right:6%;grid-template-columns:auto 1fr auto;font-size:2.5cqw;}
.mph-tagline,.mph-brace{display:none;}
.mph-reel{grid-column:3;}
.mph-h1{left:7%;top:17cqw;font-size:11.4cqw;}
.mph-badge{left:calc(100% + .35em);top:.1em;font-size:.22em;}
.mph-pill{left:7%;top:70cqw;font-size:3.5cqw;}
.mph-flower{left:auto;right:6%;top:66cqw;width:13%;}
.mph-curl{left:auto;right:4%;top:44cqw;width:11%;}
.mph-services{left:7%;right:7%;bottom:auto;top:84cqw;flex-wrap:wrap;gap:1.6cqw 5cqw;font-size:3cqw;}
.mph-rule-l{left:3%;top:22cqw;height:12cqw;}
.mph-rule-r{left:95%;top:auto;bottom:40cqw;height:12cqw;}
.mph-char{left:12%;width:76%;bottom:-.6%;}
.mph-bubble{font-size:3cqw;left:-8%;top:2%;max-width:52%;}
}

@media (max-width: 480px){
.mph-h1{left:5%;right:5%;font-size:7.2cqw;}
.mph-pill{font-size:2.6cqw;}
.mph-services{font-size:2.2cqw;gap:1cqw 3cqw;}
}

@media (prefers-reduced-motion: reduce){
.mph-root *,.mph-root *::after{animation:none!important;transition:none!important;}
}
`;

/* ------------------------------------------------------------- component */

type Layers = Partial<
  Record<
    | "body" | "head" | "earL" | "earR" | "hair" | "blush"
    | "face" | "nose" | "eyes" | "brows" | "photo",
    SVGGElement | null
  >
>;

const DEFAULT_SERVICES = ["AI Automation", "UI/UX Design", "AI-Powered Web", "Production"];

const DEFAULT_GREETINGS = [
  "¡Hola!",
  "Hagamos algo increíble.",
  "Psst, estoy disponible.",
  "Ya, deja de picarme :)",
];

export default function MascotPortfolioHero({
  height = "100svh",
  minHeight = "440px",
  index = "01/01",
  discipline = "Portafolio",
  tagline = "Hecho en Colombia",
  collection = ["Trabajos", "Selectos"],
  reel = ["Portafolio @ 2026", "Andrés Morales"],
  year = "2026",
  initials = "AM",
  badge = "Contrátame",
  line2 = "Portafolio",
  line3 = "Andrés",
  word = "Morales",
  verticalTag = "Cali",
  bracketed = "S",
  seekingLabel = "Buscando*",
  seeking = "Nuevos proyectos",
  href,
  services = DEFAULT_SERVICES,
  greetings = DEFAULT_GREETINGS,
  skin = "#c98e66",
  beanie: _ignoredBeanie,
  shirt = "#2fb5a8",
  tag: _ignoredTag,
  photoSrc,
  accent = "#f2b705",
  paper = "#ebebea",
  ink = "#111111",
  className,
}: MascotPortfolioHeroProps) {
  const uid = React.useId().replace(/:/g, "");
  const id = (n: string) => n + uid;
  const u = (n: string) => "url(#" + id(n) + ")";

  const rootRef = React.useRef<HTMLDivElement>(null);
  const charRef = React.useRef<HTMLButtonElement>(null);
  const layers = React.useRef<Layers>({});
  const set = (k: keyof Layers) => (el: SVGGElement | null) => {
    layers.current[k] = el;
  };

  const [happy, setHappy] = React.useState(false);
  const [said, setSaid] = React.useState(-1);
  const happyTimer = React.useRef<number | undefined>(undefined);

  const poke = () => {
    setSaid((n) => (n + 1) % Math.max(1, greetings.length));
    setHappy(true);
    window.clearTimeout(happyTimer.current);
    happyTimer.current = window.setTimeout(() => setHappy(false), 2200);
  };
  React.useEffect(() => () => window.clearTimeout(happyTimer.current), []);

  React.useEffect(() => {
    const root = rootRef.current;
    const char = charRef.current;
    if (!root || !char) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let still = mq.matches;
    const onMq = () => (still = mq.matches);
    mq.addEventListener("change", onMq);

    let px = 0;
    let py = 0;
    let lastMove = -1e9;
    let gx = 0;
    let gy = 0;
    let near = 0;
    let prev = performance.now();
    let nextBlink = prev + 1800;
    let blinkAt = -1e9;
    let raf = 0;
    let visible = true;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
    };
    const onLeave = () => (lastMove = -1e9);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    const tr = (dx: number, dy: number) =>
      "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")";
    const L = layers.current;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      const r = char.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.48;
      let tx = 0;
      let ty = 0;
      let tn = 0;
      const idle = now - lastMove > 3500;
      if (!idle) {
        const reach = Math.max(innerWidth, innerHeight);
        [tx, ty] = aim(px, py, cx, cy, reach * 0.3, reach * 0.26);
        const dist = Math.hypot(px - cx, py - cy);
        tn = Math.max(0, 1 - dist / (r.width * 0.45));
      } else if (!still) {
        const t = now / 1000;
        tx = Math.sin(t * 0.45) * 0.55 + Math.sin(t * 1.1) * 0.1;
        ty = Math.sin(t * 0.31 + 1) * 0.25;
      }

      const rate = still ? 30 : 7;
      gx = approach(gx, tx, dt, rate);
      gy = approach(gy, ty, dt, rate);
      near = approach(near, tn, dt, 8);
      const p = pose(gx, gy, near);
      const breathe = still ? 0 : Math.sin(now / 620) * 1.6;

      if (!still && now > nextBlink) {
        blinkAt = now;
        nextBlink = now + (Math.random() < 0.2 ? 260 : 2200 + Math.random() * 3200);
      }
      const open = still ? 1 : blink((now - blinkAt) / 1000);

      L.body?.setAttribute("transform", tr(p.body.dx, p.body.dy + breathe * 0.4));
      L.head?.setAttribute(
        "transform",
        tr(p.head.dx, p.head.dy + breathe) + " rotate(" + p.head.rot.toFixed(2) + " 300 560)",
      );
      L.earL?.setAttribute(
        "transform",
        tr(p.ears.dx, p.ears.dy) + " translate(138 380) scale(" + p.ears.lead.toFixed(3) + " 1) translate(-138 -380)",
      );
      L.earR?.setAttribute(
        "transform",
        tr(p.ears.dx, p.ears.dy) + " translate(462 380) scale(" + p.ears.trail.toFixed(3) + " 1) translate(-462 -380)",
      );
      L.hair?.setAttribute("transform", tr(p.hair.dx, p.hair.dy));
      L.blush?.setAttribute("transform", tr(p.blush.dx, p.blush.dy));
      L.face?.setAttribute("transform", tr(p.face.dx, p.face.dy));
      L.nose?.setAttribute("transform", tr(p.nose.dx, p.nose.dy));
      L.brows?.setAttribute("transform", tr(p.brows.dx, p.brows.dy));
      L.eyes?.setAttribute(
        "transform",
        tr(p.eyes.dx, p.eyes.dy) +
          " translate(300 350) scale(" +
          p.eyes.scale.toFixed(3) +
          " " +
          (p.eyes.scale * open).toFixed(3) +
          ") translate(-300 -350)",
      );
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      prev = performance.now();
    });
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mq.removeEventListener("change", onMq);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  const chars = (s: string) =>
    Array.from(s).map((c, i) => (
      <span key={i} className="mph-ch">
        {c === " " ? " " : c}
      </span>
    ));

  const l3 = Array.from(line3);
  const l3Head = l3.slice(0, -1).join("");
  const l3Tail = l3[l3.length - 1] ?? "";
  const greeting = said >= 0 ? greetings[said % greetings.length] : greetings[0];

  const vars = {
    "--mph-accent": accent,
    "--mph-paper": paper,
    "--mph-ink": ink,
    "--mph-sans": SANS_STACK,
    "--mph-display": DISPLAY_STACK,
    height,
    minHeight,
  } as React.CSSProperties;

  // Skull clipPath for the photo mode. Anchors (from spec):
  //   x130–470, y150–562, center ≈ (300, 350).
  const skullPath =
    "M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z";

  const pillInner = (
    <>
      {seeking}
      <em aria-hidden="true">→</em>
    </>
  );

  return (
    <div
      ref={rootRef}
      className={"mph-root" + (className ? " " + className : "")}
      style={vars}
    >
      <style>{CSS}</style>

      <svg
        className="mph-room"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.13">
          {ROOM.back.map((s, i) => (
            <line key={"b" + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />
          ))}
          {ROOM.rays.map((s, i) => (
            <line key={"r" + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />
          ))}
          {ROOM.depth.map((d, i) => (
            <path key={"d" + i} d={d} />
          ))}
        </g>
      </svg>

      <div className="mph-stage">
        <header className="mph-top">
          <span className="mph-index">
            <b>{index}</b>
            {discipline}
          </span>
          <span className="mph-tagline">{tagline}</span>
          <span className="mph-brace">
            {"{"}
            {collection[0]}/{collection[1]}
            {"}"}
          </span>
          <span className="mph-reel">
            <i aria-hidden="true" />
            <span>
              {reel[0]}
              <br />
              {reel[1]}
            </span>
          </span>
        </header>

        <span className="mph-rule mph-rule-l" aria-hidden="true" />
        <span className="mph-rule mph-rule-r" aria-hidden="true" />

        <h1
          className="mph-h1"
          aria-label={[year, initials, line2, line3, word + bracketed].join(" ")}
        >
          <span className="mph-line" aria-hidden="true">
            {chars(year)}
            <svg className="mph-arrow" viewBox="0 0 100 100">
              <path d="M14 14 L84 84 M84 30 V84 H30" />
            </svg>
            {chars(initials)}
            <span className="mph-badge">
              {badge}
              <sup>@</sup>
            </span>
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars(line2)}
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars(l3Head)}
            <span className="mph-swash">
              <span className="mph-ch">{l3Tail}</span>
              <svg viewBox="0 0 255 72" preserveAspectRatio="none">
                <path
                  pathLength={1}
                  d="M6 44 C40 18 150 4 222 14 C262 20 258 48 214 58 C150 72 60 70 30 60 C10 53 20 40 60 34"
                />
              </svg>
            </span>
          </span>
          <span className="mph-line mph-l4" aria-hidden="true">
            {chars(word)}
            <span className="mph-vtag">
              <span>{verticalTag}</span>
              <i />
            </span>
            <span className="mph-bracket">
              <svg viewBox="0 0 100 120" preserveAspectRatio="none">
                <path
                  className="mph-arc-t"
                  vectorEffect="non-scaling-stroke"
                  d="M4 16 Q50 -8 96 16"
                />
                <path
                  className="mph-arc-b"
                  vectorEffect="non-scaling-stroke"
                  d="M4 104 Q50 128 96 104"
                />
              </svg>
              {bracketed}
            </span>
            <span className="mph-star">*</span>
          </span>
        </h1>

        <svg className="mph-curl" viewBox="0 0 100 100" aria-hidden="true">
          <path
            pathLength={1}
            d="M92 8 C70 6 52 22 58 40 C63 56 84 52 80 36 C76 22 50 30 40 48 C32 62 26 74 16 84 M14 66 L14 86 L34 86"
          />
        </svg>

        <div className="mph-pill">
          <span className="mph-pill-a">{seekingLabel}</span>
          {href ? (
            <a className="mph-pill-b" href={href}>
              {pillInner}
            </a>
          ) : (
            <span className="mph-pill-b" tabIndex={0}>
              {pillInner}
            </span>
          )}
        </div>

        <div className="mph-flower" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <path d={FLOWER} />
            <circle cx="60" cy="60" r="4" fill="none" stroke={ink} strokeWidth="2" />
          </svg>
        </div>

        <ul className="mph-services">
          {services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <button
          ref={charRef}
          type="button"
          className={"mph-char" + (happy ? " mph-happy" : "")}
          onClick={poke}
          aria-label="Say hi to the character"
        >
          <svg viewBox={"0 0 " + CW + " " + CH} aria-hidden="true">
            <defs>
              {/* All shading used to be radialGradients (shade / hi / cloth /
                  neck / blush / eye / nose) — removed 2026-10 to push the
                  look from "rendered" to flat 2D / anime-style. Cel shadow
                  is now a single solid-color overlay path, not a gradient. */}
              {/* African-print inner collar: vertical bands (green/yellow/red/white).
                  Used to fill the jacket lapels so the inside flaps read as
                  patterned fabric when the jacket is open. */}
              <pattern
                id={id("african")}
                x="0"
                y="0"
                width="56"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="56" height="120" fill="#3fae49" />
                <rect x="14" y="0" width="8" height="120" fill="#f2b705" />
                <rect x="22" y="0" width="8" height="120" fill="#d62f2f" />
                <rect x="30" y="0" width="8" height="120" fill="#fff" />
                <rect x="38" y="0" width="8" height="120" fill="#f2b705" />
                <rect x="46" y="0" width="8" height="120" fill="#d62f2f" />
              </pattern>
              {/* Skull clipPath used to mask the optional photoSrc overlay. */}
              <clipPath id={id("skull")}>
                <path d={skullPath} />
              </clipPath>
            </defs>

            {/* Contact shadow on the floor. */}
            <ellipse cx="300" cy="712" rx="250" ry="16" fill="#000" opacity="0.08" />

            <g ref={set("body")}>
              {/* Black tank top — sits behind the jacket so it shows through
                  the open front. Flat 2D, no shading. */}
              <path
                d="M248 504 L352 504 L334 712 Q300 720 266 712 Z"
                fill="#181818"
                stroke="#000"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Jacket body — turquoise, flat fill, crisp outline. */}
              <path
                d="M28 730 C40 646 104 604 206 588 L394 588 C496 604 560 646 572 730 Z"
                fill={shirt}
                stroke="#000"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Neck. */}
              <path
                d="M246 500 L354 500 L360 600 Q300 624 240 600 Z"
                fill={skin}
                stroke="#000"
                strokeWidth="3"
              />

              {/* Jacket lapels — filled with the African-print pattern.
                  These are the inside flaps visible when the jacket is open. */}
              <path
                d="M236 566 Q262 604 300 628 L250 668 Q214 628 194 594 Z"
                fill={u("african")}
                stroke="#000"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M364 566 Q338 604 300 628 L350 668 Q386 628 406 594 Z"
                fill={u("african")}
                stroke="#000"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Tank top V neckline — a smaller dark wedge visible just
                  above the jacket lapels, so the tank reads as ribbed
                  fabric between the patterned flaps. */}
              <path
                d="M276 560 Q300 580 324 560 L316 612 L284 612 Z"
                fill="#0f0f0f"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>

            <g ref={set("head")}>
              {/* Ears — flat, outlined. */}
              <g ref={set("earL")}>
                <ellipse
                  cx="138"
                  cy="380"
                  rx="46"
                  ry="60"
                  fill={skin}
                  stroke="#000"
                  strokeWidth="3"
                />
                <path
                  d="M150 348 Q118 360 124 392 Q130 416 150 414"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              <g ref={set("earR")}>
                <ellipse
                  cx="462"
                  cy="380"
                  rx="46"
                  ry="60"
                  fill={skin}
                  stroke="#000"
                  strokeWidth="3"
                />
                <path
                  d="M450 348 Q482 360 476 392 Q470 416 450 414"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              {/* Skull — smooth oval, flat fill, single cel-shadow on the
                  right, crisp outline. (DBZ angular jaw reverted.) */}
              <path
                d={skullPath}
                fill={skin}
                stroke="#000"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Cel shadow — single darker-tone shape on the right side. */}
              <g clipPath={u("skull")}>
                <path
                  d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 L 300 150 Z"
                  fill="#1a1410"
                  opacity="0.18"
                />
              </g>

              {/* Optional photo overlay — only when photoSrc is provided.
                  Drawn before the face layer so brows/eyes/blush/beard
                  still overlay on top. */}
              {photoSrc ? (
                <g clipPath={u("skull")}>
                  <image
                    ref={set("photo")}
                    href={photoSrc}
                    x="130"
                    y="150"
                    width="340"
                    height="412"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              ) : null}

              {/* Blush — flat ellipses, no gradient. */}
              <g ref={set("blush")}>
                <ellipse
                  cx="190"
                  cy="430"
                  rx={happy ? 50 : 44}
                  ry={happy ? 34 : 30}
                  fill="#ff6f6f"
                  opacity="0.35"
                />
                <ellipse
                  cx="410"
                  cy="430"
                  rx={happy ? 50 : 44}
                  ry={happy ? 34 : 30}
                  fill="#ff6f6f"
                  opacity="0.35"
                />
              </g>

              <g ref={set("face")}>
                {/* Brows — thicker, lifted slightly when not smiling. */}
                <g ref={set("brows")}>
                  <path
                    d={happy ? "M198 296 Q230 274 264 290" : "M198 304 Q230 286 264 298"}
                    fill="none"
                    stroke="#1a1410"
                    strokeWidth="26"
                    strokeLinecap="round"
                  />
                  <path
                    d={happy ? "M336 290 Q370 274 402 296" : "M336 298 Q370 286 402 304"}
                    fill="none"
                    stroke="#1a1410"
                    strokeWidth="26"
                    strokeLinecap="round"
                  />
                </g>

                {/* Eyes — bigger, anime-style. Big solid pupils, big catchlight.
                    No shadow gradient. Outline around the eye shape. */}
                <g ref={set("eyes")}>
                  {happy ? (
                    <>
                      <path
                        d="M214 356 Q240 324 266 356"
                        fill="none"
                        stroke="#111"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      <path
                        d="M334 356 Q360 324 386 356"
                        fill="none"
                        stroke="#111"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      <ellipse
                        cx="240"
                        cy="350"
                        rx="30"
                        ry="36"
                        fill="#111"
                        stroke="#111"
                        strokeWidth="2"
                      />
                      <circle cx="231" cy="334" r="10" fill="#fff" />
                      <circle cx="252" cy="362" r="4.5" fill="#fff" />
                      <ellipse
                        cx="360"
                        cy="350"
                        rx="30"
                        ry="36"
                        fill="#111"
                        stroke="#111"
                        strokeWidth="2"
                      />
                      <circle cx="351" cy="334" r="10" fill="#fff" />
                      <circle cx="372" cy="362" r="4.5" fill="#fff" />
                    </>
                  )}
                </g>

                {/* Beard — sits on the jaw, BEFORE the grin so the mouth
                    draws on top. Sharp outlined shape. */}
                <path
                  d="M150 400 C150 530 220 590 300 590 C380 590 450 530 450 400 C432 466 392 486 300 476 C208 486 168 466 150 400 Z"
                  fill="#1a1410"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* The grin — calmer, smaller mouth, asymmetric smile. */}
                <g
                  transform={
                    happy ? "translate(300 440) scale(1.04 0.7) translate(-300 -440)" : undefined
                  }
                >
                  <path
                    d="M232 460 Q300 478 368 460 Q360 504 300 508 Q240 504 232 460 Z"
                    fill="#3d0f0f"
                    stroke="#000"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <g clipPath={u("mouth")}>
                    <path
                      d="M244 466 Q300 480 356 466 L350 482 Q300 492 250 482 Z"
                      fill="#f3efe9"
                    />
                  </g>
                </g>

                {/* Mustache — AFTER the grin, BEFORE the nose. */}
                <path
                  d="M226 438 Q300 416 374 438 Q344 456 300 448 Q256 456 226 438 Z"
                  fill="#1a1410"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Nose — flat fill, simple outline. Anime: short nose with
                    two nostrils marked by tiny shadows. */}
                <g ref={set("nose")}>
                  <ellipse
                    cx="300"
                    cy="398"
                    rx="28"
                    ry="22"
                    fill={skin}
                    stroke="#000"
                    strokeWidth="3"
                  />
                  <path
                    d="M283 408 Q280 414 286 418 M317 408 Q320 414 314 418"
                    fill="none"
                    stroke="#1a1410"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              </g>

              {/* Hair — replaces the beanie. Short, dark, slightly receding
                  at the temples. Sits inside the head layer so it parallaxes
                  with the skull. (DBZ spiky silhouette reverted.) */}
              <g ref={set("hair")}>
                <path
                  d="M150 296 C 132 200, 220 148, 300 148 C 380 148, 468 200, 450 296 L 432 282 Q 380 244, 300 250 Q 220 244, 168 282 Z"
                  fill="#1a1410"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                {/* Front strand tufts — sharper silhouette so the hairline
                    reads as separate clumps (not a flat cap). */}
                <path
                  d="M196 270 Q210 250 226 268 M240 254 Q256 240 274 256 M298 248 Q312 240 326 256 M348 256 Q360 246 374 268"
                  fill="none"
                  stroke="#0a0808"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>
          <span
            className="mph-bubble"
            data-on={happy ? "true" : "false"}
            aria-live="polite"
          >
            {greeting}
          </span>
        </button>
      </div>
    </div>
  );
}