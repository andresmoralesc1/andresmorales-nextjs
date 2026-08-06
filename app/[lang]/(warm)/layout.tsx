// Route group `(warm)` for personal campaigns (cumple-2025, invest).
//
// Intentionally minimal — does NOT render Header/Footer. Those live in the
// parent `app/[lang]/layout.tsx`, which reads the resolved pathname via
// the `x-pathname` header (set in middleware.ts) and decides whether to
// render the default <Footer /> or the warm variant.
//
// Route groups in Next.js are URL-invisible: pages still resolve to
// `/cumple-2025` and `/invest-in-people-inspire-the-future`.
export default function WarmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}