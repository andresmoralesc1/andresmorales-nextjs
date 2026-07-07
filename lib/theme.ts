// Theme tokens extracted from Elementor globals endpoint
// /wp-json/elementor/v1/globals
export const COLORS = {
  primary: '#FFFFFF',
  secondary: '#000000',
  text: '#758398',
  accent: '#009BDF',
  background: '#084088',
  theme1: '#FF7A3D',
  theme2: '#FF5100',
  theme3: '#1E1810',
  theme4: '#575250',
  theme5: '#F8F5F4',
  theme8: '#4B4F58',
  theme9: '#F6F7F8',
} as const;

export const FONTS = {
  heading: { family: 'Montserrat', weight: 600 },
  secondary: { family: 'Roboto Slab', weight: 400 },
  body: { family: 'Roboto', weight: 400 },
  accent: { family: 'Roboto', weight: 500 },
} as const;

// WP site URL — kept for assets not yet downloaded to /public
export const WP_BASE = 'https://andresmorales.com.co';

// Resolve image URL: prefer local /uploads, fall back to WP for anything not migrated
export const wpImage = (path: string) => {
  if (path.startsWith('http')) return path;
  const localPath = `/uploads${path.replace(/^\/wp-content\/uploads/, '')}`;
  return localPath;
};
