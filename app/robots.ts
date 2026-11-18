import type { MetadataRoute } from 'next';

const SITE_URL = 'https://andresmorales.com.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin/',
          '/admin/',
          '/brief/thanks',
          '/unsubscribe',
          '/p/', // Enlaces privados de cotizaciones
        ],
      },
      // Permitir a los principales agentes y motores de IA (ChatGPT, Gemini, Claude, Perplexity, Meta, Apple)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'Google-Extended',
          'PerplexityBot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'cohere-ai',
          'MistralAI-Crawler',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin/',
          '/admin/',
          '/brief/thanks',
          '/unsubscribe',
          '/p/',
        ],
      },
      // Bloquear scrapers masivos de datos que no aportan tráfico ni citas de búsqueda
      {
        userAgent: ['Bytespider', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
