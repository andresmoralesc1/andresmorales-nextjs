"use client";

import { useEffect } from "react";

/**
 * ParticlesBackground — replicates the WordPress hero with particles.js
 *
 * Source: andresmorales.com.co (the Elementor particles config)
 * - 160 orange (#f96e03) circles
 * - hover: bubble (grows on hover)
 * - click: repulse
 * - random movement, slow speed
 *
 * Two variants:
 * - default (dark):  opacity 0.6-0.9, size 2-5, particles more visible
 * - cream:           opacity 0.35-0.6, size 1.5-3, subtler (for light bg)
 *
 * Usage:
 *   <section className="relative bg-wp-pattern overflow-hidden">
 *     <ParticlesBackground id="hero-particles-canvas" variant="cream" />
 *     <div className="relative z-10">...content...</div>
 *   </section>
 */
export function ParticlesBackground({
  id = "particles-js",
  variant = "dark",
}: {
  id?: string;
  variant?: "dark" | "cream";
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

    // Cream variant: bigger, more visible particles (subtle but noticeable)
    const opacityMin = variant === "cream" ? 0.3 : 0.3;
    const opacityMax = variant === "cream" ? 0.7 : 0.75;
    const sizeMin = variant === "cream" ? 3 : 2;
    const sizeMax = variant === "cream" ? 6 : 5;
    const particleCount = variant === "cream" ? 90 : 160;

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
            onhover: { enable: true, mode: "bubble" },
            onclick: { enable: true, mode: "repulse" },
            resize: true,
          },
          modes: {
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
          },
        },
        retina_detect: true,
      });
    });

    return () => {
      mounted = true;
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