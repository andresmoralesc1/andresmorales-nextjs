import type { Metadata } from 'next';
import { Roboto, Roboto_Condensed, Playfair_Display } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

// Exact fonts from the original WordPress site (Astra + Elementor):
// Roboto (body), Roboto Condensed (nav + accent), Playfair Display (headings serif)
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  // Title parent — each page uses `title: 'Home'` and the layout converts it to
  // "Home — Andrés Morales". The name stays as proper noun / brand spelling.
  title: {
    default: 'Andrés Morales — AI Automation Consultant',
    template: '%s — Andrés Morales',
  },
  description:
    'AI consultant specialized in automation, chatbots, and digital transformation. Building automation flows that work — so you don’t have to.',
  metadataBase: new URL('https://portafolio.andresmorales.com.co'),
  alternates: {
    canonical: '/',
    languages: {
      'es-CO': '/',
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portafolio.andresmorales.com.co',
    siteName: 'Andrés Morales · Portfolio',
    title: 'Andrés Morales — AI Automation Consultant',
    description:
      'AI consultant specialized in automation, chatbots, and digital transformation. Building automation flows that work — so you don’t have to.',
    images: [
      {
        url: '/uploads/2025/06/andres-morales-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Andrés Morales — AI Automation Consultant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andrés Morales — AI Automation Consultant',
    description:
      'AI consultant specialized in automation, chatbots, and digital transformation.',
    images: ['/uploads/2025/06/andres-morales-og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoCondensed.variable} ${playfair.variable}`}
    >
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}