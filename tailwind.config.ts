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
        'theme-1': '#f96e03', // particles orange + CTA (PRIMARY)
        'theme-2': '#ff5100', // hover orange
        'theme-3': '#1E1810', // dark text/footer
        'theme-4': '#575250', // muted text
        'theme-5': '#F8F5F4', // light cream (cards bg)
        'theme-8': '#4B4F58', // gray
        'theme-9': '#eeeeee', // borders/light gray
      },
      fontFamily: {
        // Exact fonts from WP
        heading: ['var(--font-playfair)', 'Georgia', 'serif'], // Playfair Display for h1/h2
        secondary: ['var(--font-roboto-condensed)', 'Arial Narrow', 'sans-serif'], // nav + accents
        body: ['var(--font-roboto)', 'system-ui', 'sans-serif'], // body text
        accent: ['var(--font-roboto-condensed)', 'Arial Narrow', 'sans-serif'], // small uppercase labels
      },
    },
  },
  plugins: [],
};

export default config;
