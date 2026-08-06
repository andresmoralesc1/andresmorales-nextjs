import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // WordPress theme palette (extracted from Elementor globals)
        primary: '#FFFFFF',
        secondary: '#1E1810', // dark text from WP
        text: '#575250', // muted text from WP
        background: '#F8F5F4', // cream from WP
        // Orange tones extracted from WP (same hex as Elementor)
        'theme-1': '#f96e03', // particles orange + CTA bg (PRIMARY)
        'theme-2': '#ff5100', // hover orange
        'theme-3': '#1E1810', // dark text/footer
        'theme-4': '#575250', // muted text
        'theme-5': '#F8F5F4', // light cream (cards bg)
        'theme-8': '#4B4F58', // gray
        'theme-9': '#eeeeee', // borders/light gray
        // Accessibility (WCAG AA): brand orange for TEXT use where background
        // is dark or white. On cream backgrounds (`bg-background`, `bg-theme-5`)
        // the contrast drops to 2.67:1 — use `text-secondary` / `text-black`
        // there instead. Buttons keep `bg-theme-1` (full saturation).
        accent: '#f96e03', // brand orange — same as theme-1
      },
      fontFamily: {
        // Exact fonts from WP
        heading: ['Georgia', 'serif'], // system serif for h1/h2/h3
        secondary: ['Arial Narrow', 'sans-serif'], // nav + accents
        body: ['system-ui', 'sans-serif'], // body text (Roboto dropped Jul 2026 for LCP)
        accent: ['Arial Narrow', 'sans-serif'], // small uppercase labels
      },
    },
  },
  plugins: [
    // Intentionally NOT loading @tailwindcss/typography plugin globally.
    // The `prose` class would add ~57KB of CSS that's only used on the
    // about-home section and /blog/[slug] pages. Loading it globally made
    // Lighthouse flag every page's main stylesheet as render-blocking.
    // For the 2 pages that need prose styling we use local Tailwind
    // classes (see app/[lang]/blog/[slug]/page.tsx and the about section).
  ],
};

export default config;
