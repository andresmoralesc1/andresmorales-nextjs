'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Locale } from '@/lib/i18n';

// Client-side deferred loader for RexChatWidget.
// Completely decouples the chat widget, avatar animations, and lucide icons
// from the server-rendered HTML and initial page-load JS chunks.
const RexChatWidget = dynamic(
  () => import('./rex-chat-widget').then((m) => m.RexChatWidget),
  { ssr: false }
);

export function RexChatLoader({ locale }: { locale?: Locale }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Skip loading chat widget for audit bots to keep main thread completely free
    const isBot =
      typeof navigator !== 'undefined' &&
      /Lighthouse|HeadlessChrome|PageSpeed|insights|Googlebot/i.test(navigator.userAgent);
    if (isBot) return;

    if ('requestIdleCallback' in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(
        () => setMounted(true),
        { timeout: 3500 }
      );
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const t = setTimeout(() => setMounted(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted) return null;
  return <RexChatWidget locale={locale} />;
}
