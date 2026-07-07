"use client";

import { useEffect } from "react";

/**
 * ParticlesBackground — orange particles decoration
 *
 * Source: andresmorales.com.co (the Elementor particles config)
 * - orange (#f96e03) circles with random movement
 *
 * Three variants:
 * - dark:  160 particles, opacity 0.6-0.9, size 2-5, hover bubble, click repulse
 *         (for dark/contrast backgrounds — bottom of CTAs, footer)
 * - cream: 90 particles, opacity 0.35-0.7, size 3-6, hover bubble
 *         (legacy subtle variant for light backgrounds)
 * - soft:  60 particles, opacity 0.15-0.35, size 2-4, NO hover/click
 *         (subtle ambient decoration for hero sections with text content)
 *
 * Usage:
 *   <section className="relative bg-primary overflow-hidden">
 *     <ParticlesBackground id="hero-porticles-canvas" variant="soft" />
 *     <div className="relative z-10">...content...</div>
 *   </section>
 */
export function ParticlesBackground({
  id = "particles-js",
  variant = "dark",
}: {
  id?: string;
  variant?: "dark" | "cream" | "soft";
}) {
  useEffect(() => {
    let mounted = true;

    const ensureParticlesLib = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window !== "undefined" && (window as any).particlesJS) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    // Per-variant tuning
    let opacityMin: number;
    let opacityMax: number;
    let sizeMin: number;
    let sizeMax: number;
    let particleCount: number;
    let enableHover: boolean;

    switch (variant) {
      case "soft":
        // Subtle ambient: barely visible decoration for heroes with text
        opacityMin = 0.15;
        opacityMax = 0.35;
        sizeMin = 2;
        sizeMax = 4;
        particleCount = 60;
        enableHover = false;
        break;
      case "cream":
        opacityMin = 0.3;
        opacityMax = 0.7;
        sizeMin = 3;
        sizeMax = 6;
        particleCount = 90;
        enableHover = true;
        break;
      case "dark":
      default:
        opacityMin = 0.3;
        opacityMax = 0.75;
        sizeMin = 2;
        sizeMax = 5;
        particleCount = 160;
        enableHover = true;
        break;
    }

    ensureParticlesLib().then(() => {
      if (!mounted) return;
      const target = document.getElementById(id);
      if (!target) return;

      (window as any).particlesJS(id, {
        particles: {
          number: {
            value: particleCount,
            density: { enable: true, value_area: 900 },
          },
          color: { value: "#f96e03" },
          shape: {
            type: "circle",
            stroke: { width: 0, color: "#000000" },
            polygon: { nb_sides: 5 },
          },
          opacity: {
            value: opacityMax,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: opacityMin,
              sync: false,
            },
          },
          size: {
            value: (sizeMin + sizeMax) / 2,
            random: true,
            anim: { enable: false, speed: 4, size_min: sizeMin, sync: false },
          },
          line_linked: {
            enable: false,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 600 },
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: enableHover, mode: "bubble" },
            onclick: { enable: enableHover, mode: "repulse" },
            resize: true,
          },
          modes: enableHover
            ? {
                bubble: {
                  distance: 250,
                  size: 8,
                  duration: 2,
                  opacity: 1,
                  speed: 3,
                },
                repulse: { distance: 400, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 },
              }
            : {},
        },
        retina_detect: true,
      });
    });

    return () => {
      mounted = false;
    };
  }, [id, variant]);

  return (
    <div
      id={id}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
