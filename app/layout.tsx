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
  // JSON-LD Person + WebSite schema for knowledge graph / rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://portafolio.andresmorales.com.co/#person',
        name: 'Andrés Morales',
        givenName: 'Andrés',
        familyName: 'Morales',
        jobTitle: 'AI Automation Consultant',
        description:
          'AI consultant specialized in automation, chatbots, and digital transformation. Building automation flows that work — so you don’t have to.',
        url: 'https://portafolio.andresmorales.com.co',
        image: 'https://portafolio.andresmorales.com.co/uploads/2025/06/andres-morales-og.jpg',
        sameAs: [
          'https://andresmorales.com.co',
          // Add real profiles when ready:
          // 'https://linkedin.com/in/andresmoralesc1',
          // 'https://github.com/andresmoralesc1',
        ],
        knowsAbout: [
          'AI Automation',
          'n8n',
          'Chatbots',
          'AI Agents',
          'Web Development',
          'UI/UX Design',
          'Sales',
        ],
        knowsLanguage: ['es-CO', 'en-US'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://portafolio.andresmorales.com.co/#website',
        url: 'https://portafolio.andresmorales.com.co',
        name: 'Andrés Morales — Portfolio',
        inLanguage: 'en-US',
        publisher: { '@id': 'https://portafolio.andresmorales.com.co/#person' },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoCondensed.variable} ${playfair.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}