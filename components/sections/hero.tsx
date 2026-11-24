import CoreHero from '@/components/ui/syntra-hero';

// Section 1 of home — Syntra Hero (Exact match to design):
// Isometric 3D core, stepped extruded logo, interactive floating stage cards,
// floor spotlight cursor tracker, and Onest typography.
export async function Hero() {
  return <CoreHero withNavbar={false} />;
}
